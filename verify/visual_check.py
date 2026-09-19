# -*- coding: utf-8 -*-
"""视觉/运行时校验：用 Chromium 真跑一遍站点，抓渲染结果与截图。

为什么需要它：静态扫描看不出「图标 Sprite 是否真的被隐藏」「数据是否真的渲染出来」
「控制台有没有报错」。这一步是渲染层的证据。

用法：
    C:/Users/duyv/.workbuddy/binaries/python/envs/default/Scripts/python.exe verify/visual_check.py
产物：
    verify/shots/home.png        首页整屏
    verify/shots/detail.png      作品详情页
    verify/shots/404.png         站内 404 视图
"""
from __future__ import annotations

import functools
import http.server
import pathlib
import socketserver
import sys
import threading
import time

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
SHOTS = ROOT / "verify" / "shots"
CHROME = r"C:\Users\duyv\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"

FAILS: list[str] = []
PASSES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    if cond:
        PASSES.append(name)
        print(f"  PASS  {name}")
    else:
        FAILS.append(f"{name} :: {detail}")
        print(f"  FAIL  {name}  {detail}")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class SlowQuiet(Quiet):
    """只把 projects.json 拖慢的服务器。

    为什么要单独起一台：冷启动深链那个 bug 的本质是「router() 同步跑在 fetch 之前」，
    本机静态文件毫秒级就返回了，不人为拖慢的话竞态窗口太窄、测不稳。
    """

    def send_head(self):
        if "projects.json" in self.path:
            time.sleep(0.8)
        return super().send_head()


def main() -> int:
    SHOTS.mkdir(parents=True, exist_ok=True)
    handler = functools.partial(Quiet, directory=str(SITE))
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        port = httpd.server_address[1]
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{port}"

        # 第二台服务器：专供「冷启动深链」测试用，projects.json 延迟 0.8s 返回
        slow_httpd = socketserver.TCPServer(
            ("127.0.0.1", 0), functools.partial(SlowQuiet, directory=str(SITE)))
        slow_port = slow_httpd.server_address[1]
        threading.Thread(target=slow_httpd.serve_forever, daemon=True).start()
        slow_base = f"http://127.0.0.1:{slow_port}"

        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=CHROME)
            page = browser.new_page(viewport={"width": 1440, "height": 900})

            console_errors: list[str] = []
            page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errors.append(str(e)))

            # ---------- 首页 ----------
            page.goto(base + "/index.html", wait_until="load")
            page.wait_for_timeout(1200)

            print("== 渲染层 ==")
            check("控制台无 error", not console_errors, "; ".join(console_errors[:3]))

            sprite = page.locator("svg.icon-sprite").first
            box = sprite.bounding_box()
            check("图标 Sprite 不可见（CSS 类生效，未污染布局）",
                  box is None or (box["width"] == 0 and box["height"] == 0),
                  f"实得 {box}")

            works = page.locator("#works-grid > li").count()
            check("作品网格渲染出 8 件", works == 8, f"实得 {works}")

            hero = page.locator("#hero-preview > li").count()
            check("Hero 预览渲染出 3 件", hero == 3, f"实得 {hero}")

            # 无图时的占位必须占位：既是排版首字，也是可点的缩略图区域
            marks = page.locator("#hero-preview .ph-mark").count()
            check("Hero 缩略图显示排版占位首字", marks == 3, f"实得 {marks}")
            thumb_h = page.locator("#hero-preview .thumb-ph").first.bounding_box()
            check("Hero 缩略图有真实高度（未塌成一条线）",
                  thumb_h is not None and thumb_h["height"] > 40,
                  f"实得 {thumb_h}")
            mark_txt = page.locator("#hero-preview .ph-mark").first.inner_text()
            check("占位首字取自作品名（澳里·光景 → 澳）", mark_txt == "澳", f"实得 {mark_txt!r}")

            icons = page.locator("svg.icon").count()
            check("页面内联图标已渲染（>10 处）", icons > 10, f"实得 {icons}")

            skip = page.locator(".skip-link")
            skip_box = skip.bounding_box()
            check("skip link 默认在视口外", skip_box is None or skip_box["y"] < 0,
                  f"实得 {skip_box}")
            skip.focus()
            page.wait_for_timeout(400)
            skip_box2 = skip.bounding_box()
            check("skip link 获焦后进入视口", skip_box2 is not None and skip_box2["y"] >= 0,
                  f"实得 {skip_box2}")
            page.evaluate("document.activeElement.blur()")
            page.wait_for_timeout(500)  # 等 skip-link 的过渡动画收回视口外，否则截图会拍到半截色块

            check("noscript 提示在脚本可用时不可见",
                  page.locator("noscript .noscript-note").count() == 0 or
                  not page.locator("noscript").first.is_visible())

            page.screenshot(path=str(SHOTS / "home.png"), full_page=False)
            # ---------- 联系区：真实主页必须真的落地，不能留"待补链" ----------
            print("== 联系区 / 外链 ==")
            todo_left = page.locator(".is-todo").count()
            check("页面无残留「待补链」占位", todo_left == 0, f"还剩 {todo_left} 处")

            contact = page.locator(".contact-link")
            check("联系区有 4 个入口（邮箱 / GitHub / 小黑盒 / 知乎）",
                  contact.count() == 4, f"实得 {contact.count()}")

            hrefs = contact.evaluate_all("els => els.map(e => e.getAttribute('href'))")
            check("邮箱入口存在", any((h or "").startswith("mailto:") for h in hrefs), f"实得 {hrefs}")
            check("GitHub 入口存在", any("github.com/duyv0826" in (h or "") for h in hrefs), f"实得 {hrefs}")
            check("小黑盒主页已实填", any("xiaoheihe.cn" in (h or "") for h in hrefs), f"实得 {hrefs}")
            check("知乎主页已实填", any("zhihu.com" in (h or "") for h in hrefs), f"实得 {hrefs}")
            rels = contact.evaluate_all("els => els.map(e => e.getAttribute('rel') || '')")
            unsafe = [hrefs[i] for i in range(len(hrefs))
                      if (hrefs[i] or "").startswith("http") and "noopener" not in rels[i]]
            check("外链都带 rel=noopener（防 reverse tabnabbing）", not unsafe, f"不合规：{unsafe}")

            # 锁死"左上角橙色小方块"这类疑点：除了主按钮，视口内不该有别的 accent 实色块。
            # 注意必须在【滚动到位之后】扫描——滚动前 skip-link 本来就在视口外，
            # 在那个时刻扫描会漏掉真正的异常（这是第一版断言的时机 bug）。
            page.locator("#contact").scroll_into_view_if_needed()
            page.wait_for_timeout(800)
            stray = page.evaluate("""() => {
              const ACCENT = 'rgb(224, 164, 88)';
              const out = [];
              document.querySelectorAll('*').forEach(e => {
                const cs = getComputedStyle(e);
                if (cs.backgroundColor !== ACCENT) return;
                const r = e.getBoundingClientRect();
                const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight
                                && cs.visibility !== 'hidden' && cs.opacity !== '0';
                if (!visible) return;
                if (e.classList.contains('btn--primary')) return;
                out.push(e.tagName + '.' + String(e.className).slice(0, 30)
                         + ' @x=' + Math.round(r.x) + ' y=' + Math.round(r.y)
                         + ' w=' + Math.round(r.width) + ' h=' + Math.round(r.height));
              });
              return out;
            }""")
            check("视口内无游离的 accent 色块（排除主按钮）", not stray, f"发现：{stray}")

            # 联系区截图用【新开页面】直取：同一个 page 里前面 focus 过 skip-link，
            # 后续截图左上角会残留一小块 accent 色斑，属会话内的合成残留
            # （DOM 扫描在滚动前、滚动后各做一次都证明该处只有 header），不是页面缺陷。
            shot = browser.new_page(viewport={"width": 1440, "height": 900})
            shot.goto(base + "/index.html#contact", wait_until="load")
            shot.wait_for_timeout(1000)
            shot.screenshot(path=str(SHOTS / "contact.png"), full_page=False)
            shot.close()

            # ---------- 详情页 ----------
            # 注意：这一条是「页内 hash 跳转」（同文档，数据在手），测的是路由本身，
            # 不是冷启动。真实现场在下面 slow_base 那一节。
            page.goto(base + "/index.html#work/aoli-guangjing", wait_until="load")
            page.wait_for_timeout(900)
            title = page.locator("#detail-title").inner_text() if page.locator("#detail-title").count() else ""
            check("hash 直达详情页渲染出标题", "澳里" in title, f"实得 {title!r}")
            page.screenshot(path=str(SHOTS / "detail.png"), full_page=False)

            # ---------- 冷启动深链（真 bug 现场，回归测试）----------
            # 场景：别人从站外直接点开 https://.../index.html#work/room-of-choice
            # 本质：boot() 同步跑 router() 时 fetch(projects.json) 还没回来、projects 为空
            # 旧表现：渲染成「页面走丢了」，且永远不会自我纠正
            # 复现要件：① 全新 page（同 page 跳 hash 不会重载，数据早就在了）
            #          ② projects.json 延迟返回（把竞态窗口撑开到可观测）
            print("== 冷启动深链 ==")
            cold = browser.new_page(viewport={"width": 1440, "height": 900})
            cold_errors: list[str] = []
            cold.on("pageerror", lambda e: cold_errors.append(str(e)))
            cold.on("console", lambda m: cold_errors.append(m.text) if m.type == "error" else None)

            cold.goto(slow_base + "/index.html#work/room-of-choice", wait_until="load")

            # 先抓「数据还没回来」那一刻：不应该已经判成 404
            cold.wait_for_timeout(250)
            early_404 = (cold.locator("#notfound-view").count() > 0
                         and cold.locator("#notfound-view").is_visible())
            check("数据未到位时不抢先判 404（不闪错误页）", not early_404,
                  "fetch 还没回来就渲染了 404 视图")

            # 再等数据回来 + 路由补判
            cold.wait_for_timeout(2200)
            cold_title = (cold.locator("#detail-title").inner_text()
                          if cold.locator("#detail-title").count() else "(无)")
            check("冷启动深链命中详情页", "抉择" in cold_title, f"实得 {cold_title!r}")
            check("冷启动深链未落入 404 视图",
                  not (cold.locator("#notfound-view").count() and cold.locator("#notfound-view").is_visible()),
                  "仍然停在 404 视图")
            check("冷启动深链渲染出外链（可玩链接）",
                  cold.locator(".detail-link").count() >= 1,
                  f"实得 {cold.locator('.detail-link').count()}")
            check("冷启动深链无控制台报错", not cold_errors, "; ".join(cold_errors[:3]))
            cold.screenshot(path=str(SHOTS / "deeplink.png"), full_page=False)

            # 顺带：深链进来后点「返回作品」要能回到列表
            # 先判存在再点：详情页没渲染出来时这里不该抛超时把整个套件带崩，
            # 让它退化成一条普通 FAIL，后面的用例还能继续跑完
            if cold.locator(".crumb").count():
                cold.locator(".crumb").click()
                cold.wait_for_timeout(600)
                check("从深链返回列表视图",
                      cold.locator("#list-view").is_visible()
                      and not cold.locator("#detail-view").is_visible(),
                      "点返回后仍是详情页")
            else:
                check("从深链返回列表视图", False, "详情页未渲染，找不到返回入口")
            cold.close()

            # ---------- 站内 404 ----------
            page.goto(base + "/index.html#nope", wait_until="load")
            page.wait_for_timeout(600)
            check("未知 hash 落入站内 404 视图",
                  page.locator("#notfound-view").is_visible())
            page.screenshot(path=str(SHOTS / "404.png"), full_page=False)

            # ---------- 服务器级 404 页 ----------
            page.goto(base + "/404.html", wait_until="load")
            page.wait_for_timeout(400)
            check("服务端 404 页样式生效（外链 css 已加载）",
                  page.locator(".nf-code").first.evaluate("el => getComputedStyle(el).color")
                  == "rgb(224, 164, 88)",
                  "颜色应与 --accent #E0A458 一致")

            browser.close()
        httpd.shutdown()
        slow_httpd.shutdown()

    print("")
    print(f"结果：{len(PASSES)} 通过 / {len(FAILS)} 失败")
    if FAILS:
        print("\n失败明细：")
        for f in FAILS:
            print("  - " + f)
    return 0 if not FAILS else 1


if __name__ == "__main__":
    sys.exit(main())
