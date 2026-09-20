# -*- coding: utf-8 -*-
"""线上复验：冷启动深链 + 首页 + 图库占位 + 控制台清洁。

为什么单独一份：本地三层校验跑的是 127.0.0.1，
而真实现场是「别人从站外直接点开链接」——网络延迟、Pages 缓存都不一样。

用法：
    python verify/online_check.py
"""
from __future__ import annotations

import pathlib
import sys

from playwright.sync_api import sync_playwright

BASE = "https://duyv0826.github.io/portfolio"
CHROME = r"C:\Users\duyv\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"

OK = 0
BAD = 0


def rep(good: bool, name: str, detail: str = "") -> None:
    global OK, BAD
    print(("  PASS  " if good else "  FAIL  ") + name + (f"  {detail}" if detail else ""))
    if good:
        OK += 1
    else:
        BAD += 1


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME)

        # ---------- 冷启动深链：每条都开全新 page，等价于站外直接点开 ----------
        print("== 冷启动深链（站外直接点开） ==")
        for pid, kw in [("room-of-choice", "抉择"), ("aoli-guangjing", "澳里"),
                        ("game-design-matrix", "矩阵"), ("wuzhou-gamejam", "雾舟")]:
            pg = browser.new_page(viewport={"width": 1440, "height": 900})
            errs: list[str] = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            pg.goto(f"{BASE}/index.html#work/{pid}", wait_until="load")
            pg.wait_for_timeout(2200)
            title = (pg.locator("#detail-title").inner_text()
                     if pg.locator("#detail-title").count() else "(无)")
            nf = pg.locator("#notfound-view").count() and pg.locator("#notfound-view").is_visible()
            rep(kw in title and not nf and not errs,
                f"#work/{pid}", f"标题={title!r} 404={nf} 报错={errs[:1]}")
            pg.close()

        # ---------- 不存在的 id 必须落 404 ----------
        pg = browser.new_page()
        pg.goto(f"{BASE}/index.html#work/no-such-work", wait_until="load")
        pg.wait_for_timeout(2000)
        rep(pg.locator("#notfound-view").is_visible(), "不存在的 id 正确落 404")
        pg.close()

        # ---------- 简历（冷启动直接点开 #resume） ----------
        print("== 简历 ==")
        pg = browser.new_page(viewport={"width": 1440, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.goto(f"{BASE}/index.html#resume", wait_until="load")
        pg.wait_for_timeout(2200)
        nm = pg.locator("#resume-name").inner_text() if pg.locator("#resume-name").count() else "(无)"
        rep(nm == "洪昺森", "冷启动直接开 #resume 命中简历", f"标题={nm!r}")
        rep(pg.locator("#resume-view .resume-work").count() == 8,
            "简历列出 8 件作品", f"实得 {pg.locator('#resume-view .resume-work').count()}")
        rep(pg.locator("#resume-view .resume-print").count() == 1, "打印按钮存在")
        rep(pg.locator("#resume-view .resume-download").count() == 1, "下载 PDF 入口存在")

        # 静态快照必须真的能下：二进制最容易在部署链路里被悄悄搞坏
        import urllib.request  # noqa: E402
        try:
            with urllib.request.urlopen(BASE + "/resume.pdf", timeout=30) as r:
                raw = r.read()
                ctype = r.headers.get("Content-Type", "")
            local = pathlib.Path(__file__).resolve().parent.parent / "site" / "resume.pdf"
            same = local.exists() and raw == local.read_bytes()
            rep(ctype == "application/pdf" and len(raw) > 5000 and same,
                "线上 resume.pdf 可下载且与本地字节一致",
                f"类型={ctype} 大小={len(raw)} 一致={same}")
        except Exception as e:  # noqa: BLE001
            rep(False, "线上 resume.pdf 可下载且与本地字节一致", repr(e))
        rep(not errs, "简历控制台清洁", str(errs[:2]))

        pg.emulate_media(media="print")
        pg.wait_for_timeout(400)
        pr = pg.evaluate("""() => {
          const disp = s => { const e = document.querySelector(s);
            return e ? getComputedStyle(e).display : 'missing'; };
          return { header: disp('.site-header'), footer: disp('.site-footer'),
                   bg: getComputedStyle(document.body).backgroundColor };
        }""")
        rep(pr["header"] == "none" and pr["footer"] == "none" and pr["bg"] == "rgb(255, 255, 255)",
            "线上打印态正确（外壳消失 + 底色翻白）", str(pr))
        pg.emulate_media(media="screen")
        pg.screenshot(path="online_resume.png", full_page=False)
        pg.close()

        # ---------- 首页 ----------
        print("== 首页 ==")
        pg = browser.new_page(viewport={"width": 1440, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.goto(f"{BASE}/index.html", wait_until="load")
        pg.wait_for_timeout(1800)
        works = pg.locator("#works-grid > li").count()
        rep(works == 8, "首页渲染 8 件作品", f"实得 {works}")
        gi = pg.locator("#gallery-grid > li").count()
        ph = pg.locator("#gallery-grid .ph-mark").count()
        rep(gi == 6 and ph == 6, "图库 6 项全部以排版占位呈现（诚实、可见）",
            f"条目={gi} 占位={ph}")
        rep(pg.locator(".is-todo").count() == 0, "无「待补链」残留")
        rep(not errs, "首页控制台清洁", str(errs[:2]))
        pg.close()

        browser.close()

    print("")
    print(f"线上复验：{OK} 通过 / {BAD} 失败")
    return 0 if BAD == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
