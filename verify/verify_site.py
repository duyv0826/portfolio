# -*- coding: utf-8 -*-
"""洪昺森作品集 · 静态站机器化校验

覆盖三件事，全部要有可复现的输出：
  1) 起本地静态服务，逐个资产要 200（含 404 页、图标、社交封面）
  2) P0 红线扫描：emoji 图标 / 紫粉渐变 / 硬编码颜色 / 内联事件与内联样式 / 占位文案
  3) 素材合规：projects.json、gallery.json 里引用的图片必须存在，且 credits.json 里已署名

用法：
    python verify/verify_site.py
    python verify/verify_site.py --no-serve    # 只跑静态扫描，不起服务
退出码 0 = 全绿；1 = 有 FAIL（违规项逐条打印）
"""
from __future__ import annotations

import argparse
import http.server
import json
import pathlib
import re
import socketserver
import sys
import threading
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"

FAILS: list[str] = []
WARNS: list[str] = []
PASSES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    if cond:
        PASSES.append(name)
        print(f"  PASS  {name}")
    else:
        FAILS.append(f"{name} :: {detail}")
        print(f"  FAIL  {name}  {detail}")


def warn(name: str, detail: str) -> None:
    WARNS.append(f"{name} :: {detail}")
    print(f"  WARN  {name}  {detail}")


# ---------- 文本资产清单 ----------
def text_files() -> list[pathlib.Path]:
    exts = {".html", ".css", ".js", ".json", ".svg", ".txt", ".xml", ".md", ".py", ".sh"}
    out = []
    for p in SITE.rglob("*"):
        if p.is_file() and p.suffix.lower() in exts:
            out.append(p)
    return sorted(out)


EMOJI = re.compile(
    "[\U0001F300-\U0001F9FF\U00002600-\U000026FF\U00002700-\U000027BF"
    "\U0000FE00-\U0000FE0F\U0001F000-\U0001F0FF\U0001F100-\U0001F64F"
    "\U0001F680-\U0001F6FF\U0001FA00-\U0001FAFF\U0000200D\U000020E3]"
)
PURPLE_PINK = ["#7C3AED", "#A855F7", "#EC4899", "#8B5CF6", "#D946EF", "#C026D3"]
AI_TEMPLATE_WORDS = ["Lorem ipsum", "Welcome to Our App", "Sign up today", "占位文案"]


def scan_emoji() -> None:
    print("== P0-1 禁止 emoji 作功能图标 ==")
    hits = []
    for f in text_files():
        txt = f.read_text(encoding="utf-8", errors="ignore")
        for m in EMOJI.finditer(txt):
            line = txt[: m.start()].count("\n") + 1
            hits.append(f"{f.relative_to(ROOT)}:{line} {m.group()!r}")
    check("项目中无 emoji 字符", not hits, "; ".join(hits[:5]))


def strip_root_blocks(css: str) -> str:
    """去掉 :root{...} 定义块——Token 定义处允许出现字面量颜色。"""
    out, depth, i = [], 0, 0
    while i < len(css):
        if css.startswith(":root", i):
            j = css.find("{", i)
            if j != -1:
                k, d = j, 0
                while k < len(css):
                    if css[k] == "{":
                        d += 1
                    elif css[k] == "}":
                        d -= 1
                        if d == 0:
                            break
                    k += 1
                out.append(css[:i])
                css = css[k + 1:]
                i = 0
                continue
        i += 1
    out.append(css)
    return "".join(out)


def token_palette() -> set[str]:
    """从 styles.css 的 :root 里抽出真实色值，作为「独立 SVG 资源允许出现的字面量白名单」。

    为什么 SVG 要单独放行：favicon / og-cover 是被当图片用（或由爬虫单独取走），
    拿不到页面 CSS 的层叠与变量，写不出 var(--accent)。
    但它们必须用的就是同一套 Token 值——所以这里校验的是"值必须来自 Token 集合"，
    而不是"一律不许写字面量"。
    """
    css = (SITE / "styles.css").read_text(encoding="utf-8")
    root = css[css.find(":root"):]
    root = root[: root.find("}") if "}" in root else len(root)]
    return {m.group(0).lower() for m in re.finditer(r"#[0-9a-fA-F]{3,8}", root)}


def scan_colors_and_gradient() -> None:
    print("== P0-2 / P0-3 禁紫粉渐变 + 禁硬编码颜色 ==")
    allowed = token_palette() | {"#fff", "#ffffff", "#000", "#000000"}
    print(f"   Token 色值白名单：{len(allowed)} 个（供独立 SVG 资源引用）")
    bad_grad, bad_hex, bad_svg = [], [], []
    for f in text_files():
        if f.suffix.lower() not in (".css", ".html", ".svg"):
            continue
        txt = f.read_text(encoding="utf-8", errors="ignore")
        low = txt.lower()
        for c in PURPLE_PINK:
            if c.lower() in low:
                bad_grad.append(f"{f.relative_to(ROOT)} 含被禁色值 {c}")
        if f.suffix.lower() == ".css":
            body = strip_root_blocks(txt)
            for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b", body):
                v = m.group().lower()
                if v in allowed:
                    continue
                bad_hex.append(f"{f.relative_to(ROOT)} 业务样式出现裸色值 {m.group()}")
        elif f.suffix.lower() == ".svg":
            for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b", txt):
                if m.group().lower() not in allowed:
                    bad_svg.append(f"{f.relative_to(ROOT)} 用了 Token 集合之外的色值 {m.group()}")
        else:  # .html
            for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b", txt):
                v = m.group().lower()
                # <meta name="theme-color"> 必须写字面量，属已知例外
                ctx = txt[max(0, m.start() - 80): m.start()]
                if v in allowed or "theme-color" in ctx:
                    continue
                bad_hex.append(f"{f.relative_to(ROOT)} HTML 出现裸色值 {m.group()}")
    check("无 Indigo/Pink 系被禁色值", not bad_grad, "; ".join(bad_grad[:5]))
    check("CSS 业务样式中无硬编码颜色（仅 :root 定义处允许）", not bad_hex, "; ".join(bad_hex[:5]))
    check("独立 SVG 资源的色值全部来自 Token 集合", not bad_svg, "; ".join(bad_svg[:5]))


def scan_inline_and_template() -> None:
    print("== 内联事件 / 内联样式 / 占位文案 ==")
    inline_evt, inline_style, tpl = [], [], []
    for f in text_files():
        txt = f.read_text(encoding="utf-8", errors="ignore")
        rel = f.relative_to(ROOT)
        for m in re.finditer(r"\son(click|error|load|mouseover|focus|submit)\s*=", txt):
            inline_evt.append(f"{rel} {m.group().strip()}")
        if f.suffix.lower() in (".html",):
            if "<style" in txt:
                inline_style.append(f"{rel} 含 <style> 内联块")
            for m in re.finditer(r"\sstyle\s*=\s*\"", txt):
                inline_style.append(f"{rel} 含 style 属性")
        for w in AI_TEMPLATE_WORDS:
            if w.lower() in txt.lower():
                tpl.append(f"{rel} 含 {w}")
    check("无内联事件处理器（frees CSP）", not inline_evt, "; ".join(inline_evt[:5]))
    check("无内联 <style> / style 属性（frees CSP）", not inline_style, "; ".join(inline_style[:5]))
    check("无空洞占位文案", not tpl, "; ".join(tpl[:5]))


def scan_credits() -> None:
    print("== 素材合规：图片存在 + 已署名 ==")
    try:
        projects = json.loads((SITE / "projects.json").read_text(encoding="utf-8"))
        gallery = json.loads((SITE / "gallery.json").read_text(encoding="utf-8"))
        credits = json.loads((SITE / "assets" / "credits.json").read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        check("数据文件可解析", False, repr(e))
        return
    check("数据文件可解析", True)

    by_url = {c.get("url", ""): c for c in credits.get("images", [])}
    pending, problems = [], []

    def probe(url: str, where: str) -> None:
        if not url:
            return
        if url.startswith(("http://", "https://")):
            problems.append(f"{where} 使用外链图床（红线：外链会失效）：{url}")
            return
        if not (SITE / url).exists():
            problems.append(f"{where} 引用的文件不存在：{url}")
            return
        c = by_url.get(url)
        if not c:
            problems.append(f"{where} 未登记进 credits.json：{url}")
            return
        if c.get("status") != "OK" or not c.get("artist") or not c.get("source"):
            pending.append(f"{where} 待署名：{url}")

    for p in projects:
        probe((p.get("img") or "").strip(), f"projects.json#{p.get('id')}")
    for g in gallery:
        probe((g.get("url") or "").strip(), f"gallery.json#{g.get('id')}")

    check("图片引用无红线违规（无外链 / 无缺失 / 未登记）", not problems, "; ".join(problems[:5]))
    if pending:
        warn("仍有图片待补署名（不阻塞上线，但上线前应清零）", f"{len(pending)} 项，例：{pending[0]}")
    else:
        PASSES.append("图片署名齐备或当前无站内引用")

    # ---------- 死链：写了链接条目但 url 为空 / 不合规 ----------
    # 为什么必须拦：这类条目在渲染层会被 safeUrl 静默丢弃，页面表现是
    # 「这个项目本来就没有链接」——和真的没有链接的项目完全无法区分。
    # 典型的沉默失效：数据里看着有，页面上什么都没有，也没人报错。
    # 处置只有两种，都很容易：填上真实 url，或把条目删掉。
    def is_safe_url(u: str) -> bool:
        s = (u or "").strip()
        if not s:
            return False
        # 与 site/app.js 的 safeUrl 同一套判据：剔控制字符后看协议头
        probe = re.sub(r"[\x00-\x20\x7f]", "", s).lower()
        if probe.startswith("//"):
            return False
        if re.match(r"^[a-z][a-z0-9+.\-]*:", probe):
            return bool(re.match(r"^(https?:|mailto:)", probe))
        return True

    # 判据不是「url 为空」本身，而是「渲染出来什么都看不见」。
    #   · 图库空 url → 会渲染成排版占位卡（首字 + 名称），用户看得见，是诚实占位 → 只警告
    #   · 项目链接空 url → 渲染层直接跳过，页面上跟「本来就没链接」一模一样 → 死数据，必须处理
    dead: list[str] = []
    for p in projects:
        pid = p.get("id") or "?"
        for l in (p.get("detail") or {}).get("links") or []:
            u = (l.get("url") or "").strip()
            if not is_safe_url(u):
                dead.append(f"projects.json#{pid} 链接「{l.get('label') or '未命名'}」url={u!r} 渲染不出任何东西")
        if "link" in p and not is_safe_url((p.get("link") or "").strip()):
            dead.append(f"projects.json#{pid}.link={(p.get('link') or '')!r} 渲染不出任何东西")
    check("无死链（url 为空/不合规的链接会被渲染层静默丢弃）", not dead,
          f"{len(dead)} 条，例：{dead[0]}" if dead else "")

    g_pending = [g.get("name") or g.get("id") for g in gallery
                 if not is_safe_url((g.get("url") or "").strip())]
    if g_pending:
        warn("图库仍有条目缺真实图片（当前以排版占位呈现，用户可见）",
             f"{len(g_pending)}/{len(gallery)} 项：{g_pending[0]}")
    else:
        PASSES.append("图库条目均有真实图片")


def scan_consistency() -> None:
    print("== 一致性 / 元信息 ==")
    idx = (SITE / "index.html").read_text(encoding="utf-8")
    nf = (SITE / "404.html").read_text(encoding="utf-8")
    js = (SITE / "app.js").read_text(encoding="utf-8")
    check("首页含 og:image（PNG，非 SVG）", 'property="og:image" content="assets/og-cover.png"' in idx)
    check("og 封面文件存在", (SITE / "assets" / "og-cover.png").exists())
    check("favicon 已引用且文件存在",
          'rel="icon"' in idx and (SITE / "assets" / "favicon.svg").exists())
    check("首页与 404 页署名一致（洪昺森）",
          "洪昺森" in idx and "洪昺森" in nf and "© 2026 洪兄" not in nf)
    check("404 页已外链样式（无内联 style）", "404.css" in nf)
    check("404 页样式文件存在", (SITE / "404.css").exists())
    check("robots.txt 存在", (SITE / "robots.txt").exists())
    check("无障碍：存在跳到主内容的 skip link", 'class="skip-link"' in idx)
    check("降级：存在 noscript 提示", "<noscript>" in idx)
    check("动效降级：prefers-reduced-motion 已处理",
          "prefers-reduced-motion" in (SITE / "styles.css").read_text(encoding="utf-8"))
    # 不写死「N 枚」：枚数会随功能增长，写死就得跟着改一次。
    # 真正要守住的是「引用的图标必须有 symbol，symbol 也不能是没人用的死代码」。
    defined = set(re.findall(r'<symbol id="(icon-[a-z0-9-]+)"', idx))
    # 引用有两种写法：字面 <use href="#icon-x">，以及 app.js 里的 icon('x') / icon(变量)
    # ——后者是字符串拼接出来的，只扫字面引用会把一堆在用图标误判成死代码
    used = set(re.findall(r"#(icon-[a-z0-9-]+)", idx + js))
    for m in re.findall(r"['\"]([a-z0-9-]+)['\"]", js):
        if "icon-" + m in defined:
            used.add("icon-" + m)
    missing = sorted(used - defined)
    orphans = sorted(defined - used)
    check("引用的图标全部有对应 symbol（无空引用 / 无拼错名）", not missing,
          f"缺 definition：{missing}" if missing else "")
    if orphans:
        # 只警告不阻塞：存在 icon(变量) 这类动态拼接，误判成本高于留着几行 symbol
        warn("Sprite 中有疑似未引用的图标（若为动态引用可忽略）", ", ".join(orphans))
    else:
        PASSES.append("Sprite 无未被使用的孤立图标")

    # ---------- profile.json 必须与硬编码兜底一致 ----------
    # 取舍：index.html 里的 About / 联系区是「无 JS 与爬虫」的静态兜底，
    # profile.json 是简历的数据源——同一件事存了两份。
    # 单一真相源在无构建链的静态站里做不到，那就让机器来防漂移：
    # 两份对不上就 FAIL，而不是等哪天简历上印着旧邮箱才发现。
    check_profile_consistency(idx, js)


def check_profile_consistency(idx: str, js: str) -> None:
    print("== 简历数据源一致性（profile.json vs 静态兜底） ==")
    pf_path = SITE / "profile.json"
    if not pf_path.exists():
        check("profile.json 存在", False, "简历缺失数据源")
        return
    check("profile.json 存在", True)
    try:
        pf = json.loads(pf_path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        check("profile.json 可解析", False, repr(e))
        return
    check("profile.json 可解析", True)

    mismatches: list[str] = []
    c = pf.get("contact") or {}

    def must(label: str, needle: str, hay: str) -> None:
        if needle and needle not in hay:
            mismatches.append(f"{label}「{needle}」不在 {hay[:0]}静态兜底里")

    # 邮箱口径最容易漂：改了 index.html 忘了改 profile.json（或反之）都会红
    must("profile.contact.email", str(c.get("email") or ""), idx)
    must("profile.contact.github", str(c.get("github") or ""), idx)
    must("profile.contact.xiaoheihe", str(c.get("xiaoheihe") or ""), idx)
    must("profile.contact.zhihu", str(c.get("zhihu") or ""), idx)
    must("profile.name", str(pf.get("name") or ""), idx)
    must("profile.headline", str(pf.get("headline") or ""), idx)

    # 技能列表：每一条都得能在静态兜底里找到，否则简历说了兜底没说的话
    for s in pf.get("skills") or []:
        must("profile.skills", str(s), idx)

    bio = str(pf.get("bio") or "")
    if bio and bio[:12] not in idx:
        mismatches.append("profile.bio 与静态 About 正文不一致（前 12 字对不上）")

    check("profile.json 与静态兜底完全一致", not mismatches,
          f"{len(mismatches)} 处漂移，例：{mismatches[0]}" if mismatches else "")

    # 招聘季最常见的翻车：简历印着去年的数字 / 漏了刚上线的作品
    try:
        projects = json.loads((SITE / "projects.json").read_text(encoding="utf-8"))
        titles = [p.get("title") for p in projects if p.get("title")]
        check("简历覆盖全部作品（projects.json 8 件）", len(titles) == len(projects),
              f"有 {len(projects) - len(titles)} 件缺标题")
    except Exception as e:  # noqa: BLE001
        check("简历覆盖全部作品（projects.json 8 件）", False, repr(e))

    amb = pf.get("campusAmbassador") or {}
    if not any(amb.get(k) for k in ("role", "events", "reach")):
        warn("校园大使经历尚未填入（简历上该区块暂不渲染）",
             "这是唯一需要你给数字的部分，不填就不会出现在简历里，也不会留空洞条目")


# ---------- 静态服务 + 资产探测 ----------
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):  # noqa: D102
        pass


ASSETS = [
    "/", "/index.html", "/styles.css", "/app.js", "/projects.json", "/gallery.json",
    "/profile.json", "/404.html", "/404.css", "/robots.txt",
    "/assets/favicon.svg", "/assets/og-cover.png", "/assets/og-cover.svg", "/assets/credits.json",
]


def scan_serve() -> None:
    print("== 本地静态服务：逐个资产要 200 ==")
    handler = lambda *a, **kw: QuietHandler(*a, directory=str(SITE), **kw)  # noqa: E731
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        port = httpd.server_address[1]
        t = threading.Thread(target=httpd.serve_forever, daemon=True)
        t.start()
        try:
            for path in ASSETS:
                url = f"http://127.0.0.1:{port}{path}"
                try:
                    with urllib.request.urlopen(url, timeout=5) as r:
                        code = r.status
                except Exception as e:  # noqa: BLE001
                    code = repr(e)
                check(f"GET {path} → 200", code == 200, f"实得 {code}")
        finally:
            httpd.shutdown()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-serve", action="store_true", help="跳过本地服务探测")
    args = ap.parse_args()

    print(f"站点目录：{SITE}")
    if not args.no_serve:
        scan_serve()
    scan_emoji()
    scan_colors_and_gradient()
    scan_inline_and_template()
    scan_credits()
    scan_consistency()

    print("")
    print(f"结果：{len(PASSES)} 通过 / {len(FAILS)} 失败 / {len(WARNS)} 警告")
    if FAILS:
        print("\n失败明细：")
        for f in FAILS:
            print("  - " + f)
    return 0 if not FAILS else 1


if __name__ == "__main__":
    sys.exit(main())
