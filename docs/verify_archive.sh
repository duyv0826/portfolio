#!/usr/bin/env bash
# ============================================================
# 本地侧归档验证 —— export_manifest.sh 产物的【下游】验证
#
# 为什么要有这个：在服务器上验完不算数。传输会出错、路径会撞、权限会变。
# 必须在归档落地的这台机器上再验一次。
#
# 用法：
#   ./verify_archive.sh <exp-XXXXXXXX.tgz>     # 正常校验，全绿退出 0，有问题非 0
#   ./verify_archive.sh --self-test            # 反证测试：故意破坏，确认本脚本真会失败
#
# 铁律：校验器自己必须被验证过。跑 --self-test 确认它会喊，否则别信它的"通过"。
# ============================================================
set -uo pipefail

SELF="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
FAILURES=0
WARNS=0

ok(){   echo "  [PASS] $*"; }
bad(){  echo "  [FAIL] $*"; FAILURES=$((FAILURES+1)); }
warn(){ echo "  [WARN] $*"; WARNS=$((WARNS+1)); }

# 必查文件：缺了就说明导出没跑完（对应 P0/P1 的关键产物）
REQUIRED=(
  "MANIFEST.txt"
  "SHA256SUMS"
  "00-host.txt"
  "20-env-files.txt"
  "40-git-repos.txt"
)

# ---------- 正常校验 ----------
verify(){
  local ARCHIVE="$1"
  echo "════════ 本地归档验证 ════════"
  echo "归档：$ARCHIVE"

  # ① 存在且非零
  if [ ! -f "$ARCHIVE" ]; then echo "[FAIL] 归档不存在"; return 1; fi
  local ASIZE; ASIZE=$(stat -c%s "$ARCHIVE" 2>/dev/null || echo 0)
  if [ "$ASIZE" -eq 0 ]; then echo "[FAIL] 归档 0 字节 = 导出根本没成功"; return 1; fi
  echo "  [PASS] 归档存在且非零（$ASIZE 字节）"

  # ② gzip 完整性（传输损坏的第一现场）
  if gzip -t "$ARCHIVE" 2>/dev/null; then ok "gzip -t 通过"; else bad "gzip -t 失败：归档在传输中损坏"; fi

  # ③ 能列出条目
  local LIST; LIST=$(tar -tzf "$ARCHIVE" 2>/dev/null)
  if [ -z "$LIST" ]; then bad "tar -tzf 列不出条目"; return 1; fi
  local N; N=$(printf '%s\n' "$LIST" | wc -l)
  ok "tar -tzf 可列出（$N 个条目）"

  # ④ 解到独立目录（带秒 + pid，拒绝复用，免得读到上一次的旧产物）
  local WORK; WORK="$(mktemp -d)/exp-verify-$(date +%Y%m%d-%H%M%S)-$$"
  mkdir -p "$WORK"
  if tar -xzf "$ARCHIVE" -C "$WORK" 2>/dev/null; then ok "可解压"; else bad "解压失败"; return 1; fi

  # 归档可能带一层顶层目录，定位到含 MANIFEST.txt 的那一层
  local ROOT; ROOT=$(find "$WORK" -name MANIFEST.txt -printf '%h\n' 2>/dev/null | head -1)
  [ -z "$ROOT" ] && ROOT="$WORK"
  echo "  解包根目录：$ROOT"

  # ⑤ 必查文件在【归档里】都存在（不是看源目录）
  echo "── 必查文件 ──"
  for f in "${REQUIRED[@]}"; do
    if [ -f "$ROOT/$f" ] && [ -s "$ROOT/$f" ]; then ok "$f"; else bad "$f 缺失或为 0 字节"; fi
  done

  # ⑥ SHA256SUMS 校验 + 数量一致性
  echo "── 校验和 ──"
  if [ -f "$ROOT/SHA256SUMS" ]; then
    ( cd "$ROOT" && sha256sum -c SHA256SUMS >/dev/null 2>&1 ) \
      && ok "sha256sum -c 全部匹配" || bad "sha256sum -c 有条目不匹配（内容被改过）"
    local SUM_N DISK_N
    SUM_N=$(grep -c . "$ROOT/SHA256SUMS")
    DISK_N=$(find "$ROOT" -type f ! -name SHA256SUMS | wc -l)
    if [ "$SUM_N" -eq "$DISK_N" ]; then
      ok "校验和条目数 = 实际文件数（$SUM_N）"
    else
      bad "数量对不上：SHA256SUMS 记 $SUM_N 条，实际 $DISK_N 个文件 → 有文件没进校验和"
    fi
  else
    bad "SHA256SUMS 不存在"
  fi

  # ⑦ 0 字节产物（静默失败的头号特征）
  # ⚠️ 不能用 `find | while read`：管道会让 while 跑在子 shell，
  #    里面 bad 累加的 FAILURES 传不回父进程 → 检查静默失效（反证测试抓到过）。
  #    必须先落成文件，再用重定向读。
  echo "── 0 字节扫描 ──"
  local ZLIST="$WORK/.zeros"; find "$ROOT" -type f -size 0 > "$ZLIST" 2>/dev/null
  if [ -s "$ZLIST" ]; then
    while IFS= read -r z; do bad "0 字节：$z"; done < "$ZLIST"
    bad "存在 0 字节产物（每个都要人工确认，尤其是 .sql 与 .env）"
  else
    ok "无 0 字节文件"
  fi

  # ⑧ 数据库能打开（不看大小，看内容 —— 同样避免子 shell）
  echo "── 数据库 ──"
  local SLIST="$WORK/.sqls"; find "$ROOT" -name '*.sql' -type f > "$SLIST" 2>/dev/null
  if [ -s "$SLIST" ]; then
    while IFS= read -r s; do
      if grep -qiE 'CREATE TABLE|INSERT INTO|CREATE DATABASE' "$s"; then
        ok "$(basename "$s") 含有效 SQL 结构（$(stat -c%s "$s") 字节）"
      else
        bad "$(basename "$s") 没有 CREATE TABLE / INSERT → 可能是空导出"
      fi
    done < "$SLIST"
    # sqlite 能真跑 SELECT COUNT(*)
    if command -v sqlite3 >/dev/null; then
      local DLIST="$WORK/.dbs"
      find "$ROOT" \( -name '*.db' -o -name '*.sqlite*' \) -type f > "$DLIST" 2>/dev/null
      while IFS= read -r db; do
        local cnt; cnt=$(sqlite3 "$db" "SELECT COUNT(*) FROM sqlite_master;" 2>/dev/null)
        if [ -n "$cnt" ]; then ok "sqlite 可打开 $(basename "$db")（对象数 $cnt）"
        else warn "sqlite 打不开 $(basename "$db")（可能加密或非 sqlite）"; fi
      done < "$DLIST"
    fi
    echo "  [提示] MySQL dump 要真验证，需在本地起实例导入后 SELECT COUNT(*) —— 见文末"
  else
    warn "归档里没有 .sql：若该机确实无数据库则忽略，否则导出没跑成功"
  fi

  # ⑨ 密钥命中清单（P0，确认扫过）
  echo "── 密钥 ──"
  if [ -f "$ROOT/22-cred-hits.txt" ] && [ -s "$ROOT/22-cred-hits.txt" ]; then
    ok "命中密钥文件清单（$(grep -c . "$ROOT/22-cred-hits.txt") 条）→ 拿到后立刻轮换 cos-sync-bot"
  else
    warn "22-cred-hits.txt 为空：要么没扫到，要么没匹配上（人工确认 .env 是否真的进了包）"
  fi

  echo "═══════════════════════════════"
  echo "结果：失败 $FAILURES 项，警告 $WARNS 项"
  if [ "$FAILURES" -eq 0 ]; then
    echo "✅ 归档可用。下一步：MySQL dump 导入本地实例跑 SELECT COUNT(*) 才算最终确认。"
    return 0
  fi
  echo "❌ 归档不可用或需人工复核 —— 别在验证通过前动实例（续费/释放）"
  return 1
}

# ---------- 反证测试：确认本校验器真的会失败 ----------
self_test(){
  echo "════════ 反证测试 ════════"
  echo "目的：故意破坏归档，确认校验器按期望以非零码喊出来。"
  echo "一个永远不会失败的检查，比没有检查更危险。\n"

  local TMP; TMP=$(mktemp -d)
  local BASE="$TMP/exp-base"
  mkdir -p "$BASE"

  # 造一个"合格"归档
  echo "hostname: fake-host-ubuntu" > "$BASE/00-host.txt"
  echo "/opt/newapi/.env"           > "$BASE/20-env-files.txt"
  echo "/opt/newapi/.git"          > "$BASE/40-git-repos.txt"
  echo "server { listen 80; }"     > "$BASE/30-nginx-full.conf"
  printf 'CREATE TABLE users (id INT);\nINSERT INTO users VALUES (1);\n' > "$BASE/11-newapi.sql"
  echo "SecretId=AKIDxxx"          > "$BASE/22-cred-hits.txt"
  ( cd "$BASE" && find . -type f -printf '%10s  %p\n' | sort -k2 ) > "$BASE/MANIFEST.txt"
  ( cd "$BASE" && find . -type f ! -name SHA256SUMS -exec sha256sum {} + ) > "$BASE/SHA256SUMS"

  local GOOD="$TMP/exp-good.tgz"
  tar czf "$GOOD" -C "$TMP" exp-base

  # 正向：合格归档必须 PASS
  echo "── 用例 0：未破坏的归档（期望 PASS / 退出 0）──"
  if "$SELF" "$GOOD" >/dev/null 2>&1; then
    echo "  ✅ 按期望通过"
  else
    echo "  ❌ 合格归档被判失败 —— 校验器太严，会误报"
    return 1
  fi

  # REGEN=1 → 破坏后重新生成 MANIFEST/SHA256SUMS，让校验和保持一致，
  #           从而【单独】验证目标检查（否则 sha256 会掩盖其他所有检查，反证不成立）。
  # REGEN=0 → 不重新生成，专测 sha256sum 检查本身。
  REGEN=1
  run_case(){
    local name="$1"; shift
    local dir="$TMP/case-$RANDOM$RANDOM"
    mkdir -p "$dir"
    cp -r "$BASE" "$dir/exp-base"
    "$@" "$dir/exp-base"          # 执行破坏动作
    if [ "$REGEN" = "1" ]; then
      ( cd "$dir/exp-base" && find . -type f -printf '%10s  %p\n' | sort -k2 ) > "$dir/exp-base/MANIFEST.txt"
      ( cd "$dir/exp-base" && find . -type f ! -name SHA256SUMS -exec sha256sum {} + ) > "$dir/exp-base/SHA256SUMS"
    fi
    local arc="$dir/broken.tgz"
    tar czf "$arc" -C "$dir" exp-base 2>/dev/null
    echo "── 用例：${name}（期望 FAIL / 退出非 0，REGEN=$REGEN）──"
    if "$SELF" "$arc" >/dev/null 2>&1; then
      echo "  ❌ 破坏没被抓到 —— 这个检查形同虚设"
      return 1
    else
      echo "  ✅ 按期望失败"
      return 0
    fi
  }

  local RC=0
  # 每条检查独立受测（REGEN=1 排除 sha256 的掩盖）
  run_case "仅删必查文件 → 测 REQUIRED 检查"        rm_f       || RC=1
  run_case "仅掏空 SQL 内容 → 测 SQL 结构检查"      empty_sql || RC=1
  run_case "仅混入 0 字节文件 → 测 0 字节扫描"       add_zero  || RC=1
  # 专测 sha256sum 检查（不重新生成校验和）
  REGEN=0
  run_case "仅改动 .env 内容 → 测 sha256sum"        tamper_env || RC=1
  REGEN=1

  # 用例 5：截断归档（gzip 损坏）
  echo "── 用例：截断归档尾部（期望 FAIL / 退出非 0）──"
  local trunc="$TMP/trunc.tgz"; cp "$GOOD" "$trunc"
  local sz; sz=$(stat -c%s "$trunc"); truncate -s $(( sz / 2 )) "$trunc" 2>/dev/null
  if "$SELF" "$trunc" >/dev/null 2>&1; then
    echo "  ❌ 截断没被抓到"; RC=1
  else
    echo "  ✅ 按期望失败"
  fi

  echo "\n═══════════════════════════════"
  if [ "$RC" -eq 0 ]; then
    echo "✅ 反证全部通过：正向能过、5 种破坏都能抓到。这个校验器可以信。"
  else
    echo "❌ 有用例没按期望失败 —— 校验器不可信，修好再用。"
  fi
  rm -rf "$TMP"
  return "$RC"
}

# 破坏动作（供 run_case 调用）
rm_f(){       rm -f "$1/40-git-repos.txt"; }
empty_sql(){  echo "-- empty dump" > "$1/11-newapi.sql"; }   # 非零字节但无结构
tamper_env(){ echo "SECRET_CHANGED" >> "$1/20-env-files.txt"; }
add_zero(){   : > "$1/99-empty-marker.txt"; }

case "${1:-}" in
  --self-test|selftest) self_test; exit $? ;;
  "") echo "用法：$0 <archive.tgz> | --self-test"; exit 2 ;;
  *)  verify "$1"; exit $? ;;
esac
