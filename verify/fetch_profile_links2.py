# -*- coding: utf-8 -*-
"""第二遍：等 SPA 渲染完，全量 dump 锚点 + 找「主页」入口。只读。"""
from playwright.sync_api import sync_playwright

PROFILE = r"C:\Users\duyv\WorkBuddy\2026-09-03-10-15-48\.xhhprofile2"

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=PROFILE, headless=True,
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()

    for url in ["https://www.xiaoheihe.cn/creator/content_management/home?article_type=all",
                "https://www.xiaoheihe.cn/"]:
        print(f"\n=== {url} ===")
        try:
            page.goto(url, wait_until="networkidle", timeout=45000)
        except Exception as e:
            print(f"[warn] goto: {type(e).__name__}")
        page.wait_for_timeout(6000)
        print("title=", repr(page.title()))
        hrefs = page.evaluate(
            "() => Array.from(document.querySelectorAll('a[href]'))"
            ".map(a => [a.getAttribute('href'), (a.innerText||'').trim().slice(0,24)])")
        print("锚点总数:", len(hrefs))
        for h, t in hrefs:
            print(f"  {h}  |  {t}")
        # 页面里出现「主页」字样的文本
        txts = page.evaluate(
            "() => Array.from(document.querySelectorAll('*'))"
            ".filter(e => e.children.length===0 && /主页|个人页|我的主页/.test(e.textContent||''))"
            ".map(e => (e.textContent||'').trim().slice(0,30))")
        print("含『主页』文本:", txts[:10])
    ctx.close()
