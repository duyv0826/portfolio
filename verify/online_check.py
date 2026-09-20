# -*- coding: utf-8 -*-
"""线上复验：冷启动深链 + 首页 + 图库占位 + 控制台清洁。

为什么单独一份：本地三层校验跑的是 127.0.0.1，
而真实现场是「别人从站外直接点开链接」——网络延迟、Pages 缓存都不一样。

用法：
    python verify/online_check.py
"""
from __future__ import annotations

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
