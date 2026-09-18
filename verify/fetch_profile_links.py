# -*- coding: utf-8 -*-
"""用已登录的 Playwright profile 抓小黑盒真实个人主页 URL（只读，不发帖）。"""
import re
from playwright.sync_api import sync_playwright

PROFILE = r"C:\Users\duyv\WorkBuddy\2026-09-03-10-15-48\.xhhprofile2"
CAND = re.compile(r"(user|space|home|personal|u/|/bbs/link)", re.I)

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=PROFILE, headless=True,
        viewport={"width": 1280, "height": 900},
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()

    for url in ["https://www.xiaoheihe.cn/",
                "https://www.xiaoheihe.cn/creator/content_management/home?article_type=all"]:
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(2500)
        except Exception as e:
            print(f"[warn] {url} -> {type(e).__name__}")
            continue
        hrefs = page.evaluate(
            "() => Array.from(document.querySelectorAll('a[href]'))"
            ".map(a => [a.getAttribute('href'), (a.innerText||'').trim().slice(0,20)])")
        hits = [h for h in hrefs if CAND.search(h[0] or "")]
        print(f"\n=== {url} ===")
        print(f"title={page.title()!r} 锚点总数={len(hrefs)} 候选={len(hits)}")
        for h, t in hits[:25]:
            print(f"  {h}  |  {t}")

    # 登录态里的账号标识
    ids = ctx.cookies()
    for c in ids:
        if c["name"] in ("heybox_id", "user_id", "username", "nickname"):
            print(f"[cookie] {c['name']}={c['value']}")
    ctx.close()
