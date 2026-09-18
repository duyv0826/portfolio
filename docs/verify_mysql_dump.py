#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MySQL dump 真验证 —— 导入本地实例后逐表 SELECT COUNT(*)

分两层，且不互相冒充：

  A 层（离线静态预检，永远可跑、可反证）
      解析 dump 结构：CREATE TABLE / INSERT INTO / 结尾标记 / 括号配对 /
      每表解析行数 / INSERT 是否引用了未定义的表。
      这层只能证明"文件结构完整"，【不能】证明数据真的能导入、行数对得上。

  B 层（真跑 SELECT COUNT(*)，需要 docker daemon）
      起临时 mysql 容器 → 导入 → 逐表 COUNT → 与 A 层解析行数对账。
      这层才是"文件大小和有没有 CREATE TABLE 都不算数"的那一步。

  ⚠️ 环境不具备（docker 没启动）时，B 层报 SKIP 并【退出非 0】——
     绝不用 A 层的通过冒充 B 层的通过。

用法：
  python docs/verify_mysql_dump.py exp-xxx/11-newapi.sql     # A 层 +（可能时）B 层
  python docs/verify_mysql_dump.py <file> --no-docker        # 只跑 A 层
  python docs/verify_mysql_dump.py --self-test               # 反证测试
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
import tempfile
import shutil

FAILS: list[str] = []
WARNS: list[str] = []


def bad(msg: str) -> None:
    FAILS.append(msg)
    print(f"  [FAIL] {msg}")


def ok(msg: str) -> None:
    print(f"  [PASS] {msg}")


def warn(msg: str) -> None:
    WARNS.append(msg)
    print(f"  [WARN] {msg}")


# ---------------- 解析工具 ----------------

def split_statements(text: str) -> list[str]:
    """按顶层分号切分语句（忽略引号/反引号内的分号）。"""
    stmts, buf, quote = [], [], None
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        if quote:
            buf.append(c)
            if c == "\\" and i + 1 < n:
                buf.append(text[i + 1]); i += 2; continue
            if c == quote:
                quote = None
        else:
            if c in "'\"`":
                quote = c; buf.append(c)
            elif c == ";":
                stmts.append("".join(buf)); buf = []
            else:
                buf.append(c)
        i += 1
    if "".join(buf).strip():
        stmts.append("".join(buf))   # 没有结尾分号 = 可能被截断
    return stmts


def balanced(text: str) -> bool:
    """括号是否配对（损坏 dump 的第一现场）。"""
    depth, quote = 0, None
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        if quote:
            if c == "\\" and i + 1 < n:
                i += 2; continue
            if c == quote:
                quote = None
        else:
            if c in "'\"`":
                quote = c
            elif c == "(":
                depth += 1
            elif c == ")":
                depth -= 1
                if depth < 0:
                    return False
        i += 1
    return depth == 0 and quote is None


def count_tuples(after_values: str) -> int:
    """统计 INSERT ... VALUES 后面的元组个数（顶层括号组）。"""
    cnt, depth, quote, in_tuple = 0, 0, None, False
    i, n = 0, len(after_values)
    while i < n:
        c = after_values[i]
        if quote:
            if c == "\\" and i + 1 < n:
                i += 2; continue
            if c == quote:
                quote = None
        else:
            if c in "'\"`":
                quote = c
            elif c == "(":
                depth += 1
                if depth == 1:
                    in_tuple = True; cnt += 1
            elif c == ")":
                depth -= 1
                if depth == 0:
                    in_tuple = False
            elif c == ";" and depth == 0:
                break
        i += 1
    return cnt


# ⚠️ 不要用「一个 alternation + 硬编码 group 编号」去匹配 `db`.`tbl` 与 `tbl` 两种写法：
#    Python 捕获组按整个 pattern 的左括号顺序编号，不按命中的分支。
#    本文件最初就是这么写的，结果表名全落在未预期的 group 上 → 解析出 None
#    → 多张表塌进同一个 key → "INSERT 引用未定义的表" 检查静默失效（反证测试抓出）。
#    改用两个独立命名正则，先试 db.tbl，再退化为 tbl。
NAME = r"`?([^`\s.(]+)`?"
RE_CREATE_DBTBL = re.compile(
    r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?" + NAME + r"\s*\.\s*" + NAME, re.I)
RE_CREATE_TBL = re.compile(
    r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?" + NAME, re.I)
RE_INSERT_DBTBL = re.compile(r"INSERT\s+INTO\s+" + NAME + r"\s*\.\s*" + NAME, re.I)
RE_INSERT_TBL = re.compile(r"INSERT\s+INTO\s+" + NAME, re.I)


def table_of(m_db, m_tbl) -> str | None:
    """从 (db.tbl 匹配, tbl 匹配) 中取规范表名。"""
    if m_db:
        return f"{m_db.group(1)}.{m_db.group(2)}"
    if m_tbl:
        return m_tbl.group(1)
    return None


# ---------------- A 层：离线静态预检 ----------------

def static_check(path: str) -> dict:
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    if not text.strip():
        bad("dump 为空")
        return {}
    ok(f"dump 非空（{len(text.encode('utf-8'))} 字节）")

    if not balanced(text):
        bad("括号/引号不配对 —— dump 损坏或被截断（A 层）")
    else:
        ok("括号与引号配对")

    # 结尾标记（mysqldump 正常结束会写）
    if re.search(r"--\s*Dump completed", text, re.I):
        ok("存在 mysqldump 结尾标记（未截断）")
    else:
        bad("缺少 `-- Dump completed` 结尾标记 —— 导出很可能被截断")

    stmts = split_statements(text)

    created: dict[str, int] = {}
    rows: dict[str, int] = {}
    for s in stmts:
        t = table_of(RE_CREATE_DBTBL.search(s), RE_CREATE_TBL.search(s))
        if t:
            created[t] = created.get(t, 0) + 1

        mi_db, mi_tbl = RE_INSERT_DBTBL.search(s), RE_INSERT_TBL.search(s)
        mi = mi_db or mi_tbl
        t = table_of(mi_db, mi_tbl)
        if mi and t:
            mv = re.search(r"\bVALUES\b", s[mi.end():], re.I)
            if mv:
                rows[t] = rows.get(t, 0) + count_tuples(s[mi.end() + mv.end():])

    if not created:
        bad("dump 里没有任何 CREATE TABLE —— 只有数据没有结构，导入必失败")
    else:
        ok(f"含 {len(created)} 张表的 CREATE TABLE")

    if not rows:
        warn("dump 里没有任何 INSERT —— 库可能是空的，也可能是导出失败（人工确认）")
    else:
        ok(f"含 {len(rows)} 张表的 INSERT，解析总行数 {sum(rows.values())}")

    # INSERT 引用了没定义的的表 = 导入会报错
    undefined = sorted(set(rows) - set(created))
    if undefined:
        bad(f"INSERT 引用了未定义的表：{undefined}")
    else:
        ok("所有 INSERT 的表都有对应 CREATE TABLE")

    print("\n  ── 逐表解析行数（A 层估算，待 B 层对账）──")
    for t in sorted(created):
        r = rows.get(t, 0)
        print(f"    {t}: {r}")
    return {"created": created, "rows": rows, "text": text}


# ---------------- B 层：真跑 SELECT COUNT(*) ----------------

def docker_available() -> bool:
    try:
        subprocess.run(["docker", "info"], capture_output=True, timeout=20, check=True)
        return True
    except Exception:
        return False


def live_check(path: str, parsed: dict) -> bool:
    name = f"dumpverify-{os.getpid()}"
    print("\n── B 层：真起实例导入并 COUNT(*) ──")
    try:
        subprocess.run(["docker", "run", "-d", "--name", name,
                        "-e", "MYSQL_ALLOW_EMPTY_PASSWORD=1", "-e", "MYSQL_DATABASE=verifydb",
                        "mariadb:11"], capture_output=True, timeout=120, check=True)
    except Exception as e:
        bad(f"起容器失败：{type(e).__name__}（镜像拉取/网络问题？）")
        return False

    try:
        # 等就绪
        for _ in range(60):
            p = subprocess.run(["docker", "exec", name, "healthcheck.sh", "--connect"],
                               capture_output=True, timeout=15)
            if p.returncode == 0:
                break
            p = subprocess.run(["docker", "exec", name, "mariadb", "-uroot", "-e", "SELECT 1"],
                               capture_output=True, timeout=15)
            if p.returncode == 0:
                break
        else:
            bad("容器 60 次探测仍未就绪"); return False
        ok("实例就绪")

        # 导入
        with open(path, "rb") as f:
            p = subprocess.run(["docker", "exec", "-i", name, "mariadb", "-uroot", "--force"],
                               stdin=f, capture_output=True, timeout=600)
        if p.returncode != 0:
            err = p.stderr.decode("utf-8", "replace")[:300]
            bad(f"导入失败（退出码 {p.returncode}）：{err}")
            return False
        if p.stderr and b"ERROR" in p.stderr.upper():
            bad(f"导入过程有 ERROR：{p.stderr.decode('utf-8','replace')[:300]}")
            return False
        ok("dump 可导入（无 ERROR）")

        # 逐表 COUNT
        q = ("SELECT CONCAT(TABLE_SCHEMA,'.',TABLE_NAME) FROM information_schema.TABLES "
             "WHERE TABLE_SCHEMA NOT IN ('mysql','information_schema','performance_schema','sys')")
        p = subprocess.run(["docker", "exec", name, "mariadb", "-uroot", "-N", "-B", "-e", q],
                           capture_output=True, timeout=60)
        tables = [t for t in p.stdout.decode().split() if t]
        if not tables:
            bad("导入后一张表都没有 —— 数据没进来")
            return False
        ok(f"导入后 {len(tables)} 张表")

        mismatch = 0
        for t in sorted(tables):
            p = subprocess.run(["docker", "exec", name, "mariadb", "-uroot", "-N", "-B",
                                "-e", f"SELECT COUNT(*) FROM `{t.split('.')[0]}`.`{t.split('.')[1]}`"],
                               capture_output=True, timeout=120)
            if p.returncode != 0:
                bad(f"COUNT(*) 失败：{t}"); mismatch += 1; continue
            live = p.stdout.decode().strip()
            parsed_rows = None
            for k, v in parsed.get("rows", {}).items():
                if k == t or k.endswith("." + t) or t.endswith("." + k) or k == t.split(".")[-1]:
                    parsed_rows = v; break
            flag = "" if (parsed_rows is None or str(parsed_rows) == live) else "  <-- 不一致"
            if flag:
                mismatch += 1
            print(f"    {t}: COUNT(*)={live}  (A 层解析={parsed_rows}){flag}")

        if mismatch:
            bad(f"{mismatch} 张表 COUNT(*) 与解析行数不一致 —— 导入不完整")
            return False
        ok("所有表 COUNT(*) 与 A 层解析一致")
        return True
    finally:
        subprocess.run(["docker", "rm", "-f", name], capture_output=True, timeout=60)
        print("  （临时容器已销毁）")


# ---------------- 主流程 ----------------

def run(path: str, use_docker: bool = True) -> int:
    print("════════ MySQL dump 验证 ════════")
    print(f"文件：{path}")
    if not os.path.isfile(path):
        print("[FAIL] 文件不存在"); return 1

    parsed = static_check(path)

    if not use_docker:
        print("\n（--no-docker：已跳过 B 层。注意：A 层通过 ≠ 数据可导入、行数对得上）")
    elif not docker_available():
        bad("docker daemon 不可用 —— B 层（真跑 COUNT(*)）无法执行")
        print("\n  请先启动 Docker Desktop，然后重跑本脚本。")
        print("  ⚠️ 本脚本【不会】用 A 层的通过冒充 B 层 —— 退出码非 0。")
    else:
        if not live_check(path, parsed):
            pass

    print("\n═══════════════════════════════")
    print(f"结果：失败 {len(FAILS)} 项，警告 {len(WARNS)} 项")
    if FAILS:
        print("❌ dump 未通过验证")
        return 1
    print("✅ 通过" + ("（含 B 层真跑 COUNT(*)）" if use_docker and docker_available() else "（仅 A 层）"))
    return 0


# ---------------- 反证测试 ----------------

GOOD = """-- MySQL dump
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
INSERT INTO `users` VALUES (1,'alice'),(2,'bob'),(3,'carol');
CREATE TABLE `orders` (
  `oid` int NOT NULL,
  `uid` int DEFAULT NULL
) ENGINE=InnoDB;
INSERT INTO `orders` VALUES (10,1),(11,2);
-- Dump completed on 2026-09-19
"""


def self_test() -> int:
    print("════════ 反证测试（A 层，无需 docker）════════")
    tmp = tempfile.mkdtemp(prefix="dumpverify-")
    rc = 0

    def case(name: str, content: str, expect_fail: bool):
        nonlocal rc
        p = os.path.join(tmp, f"{abs(hash(name))}.sql")
        with open(p, "w", encoding="utf-8") as f:
            f.write(content)
        r = subprocess.run([sys.executable, __file__, p, "--no-docker"],
                           capture_output=True, text=True)
        failed = r.returncode != 0
        tag = "FAIL/非0" if expect_fail else "PASS/0"
        print(f"── 用例：{name}（期望 {tag}）──")
        if failed == expect_fail:
            print("  ✅ 按期望")
        else:
            print("  ❌ 未按期望 —— 该检查形同虚设" if expect_fail else "  ❌ 合格 dump 被误判")
            rc = 1

    case("完整 dump", GOOD, expect_fail=False)
    case("截断（删掉结尾标记与末尾语句）", GOOD.split("-- Dump completed")[0].replace(
        "INSERT INTO `orders` VALUES (10,1),(11,2);", "INSERT INTO `orders` VALUES (10,1"), True)
    case("括号不配对", GOOD.replace("(1,'alice'),(2,'bob'),(3,'carol');", "(1,'alice'),(2,'bob';"), True)
    case("只有 INSERT 没有 CREATE TABLE", "INSERT INTO `users` VALUES (1,'a');\n-- Dump completed\n", True)
    case("INSERT 引用未定义的表",
         GOOD.replace("CREATE TABLE `orders` (", "CREATE TABLE `orders_x` ("), True)

    if not docker_available():
        print("\n[B 层] docker daemon 不可用 → B 层反证【未执行】，不能声称已验证。")
        print("       启动 Docker Desktop 后重跑本脚本，B 层才会真起实例对账。")
    else:
        print("\n[B 层] docker 可用，执行真实例反证：")
        case("语法错误的 dump（导入必失败）",
             "CREATE TABLE `t` (`id` INT);\nTHIS IS NOT SQL;\n-- Dump completed\n", True)

    shutil.rmtree(tmp, ignore_errors=True)
    print("\n" + ("✅ A 层反证通过" if rc == 0 else "❌ 有用例未按期望失败"))
    return rc


if __name__ == "__main__":
    args = [a for a in sys.argv[1:]]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__); sys.exit(2)
    if args[0] == "--self-test":
        sys.exit(self_test())
    no_docker = "--no-docker" in args
    target = next((a for a in args if not a.startswith("--")), None)
    if not target:
        print(__doc__); sys.exit(2)
    sys.exit(run(target, use_docker=not no_docker))
