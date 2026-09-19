# -*- coding: utf-8 -*-
"""把 og-cover.svg 栅格化为 og-cover.png。

社交平台（X / Facebook / 微信 / 微博）不认 SVG 的 og:image，
所以这里用 Playwright 视口截图产出 PNG，作 HTML 里的实际引用对象。

运行：
    C:/Users/duyv/.workbuddy/binaries/python/envs/default/Scripts/python.exe render_og.py
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

SITE = pathlib.Path(__file__).resolve().parent.parent / "site"
SRC = SITE / "assets" / "og-cover.svg"
DST = SITE / "assets" / "og-cover.png"

HTML = """<!DOCTYPE html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:#0C0C0E}
img{display:block;width:1200px;height:630px}</style>
</head><body><img src="og-cover.svg" onerror="document.title='IMG_ERROR'"></body></html>"""


def main() -> int:
    if not SRC.exists():
        print("FAIL: 源文件不存在", SRC)
        return 1
    (SITE / "assets" / "_og_preview.html").write_text(HTML, encoding="utf-8")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Users\duyv\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
        )
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        # 必须用 file:// 打开同目录预览页，否则相对路径取不到 SVG
        page.goto((SITE / "assets" / "_og_preview.html").as_uri(), wait_until="load")
        page.wait_for_timeout(600)
        if page.title() == "IMG_ERROR":
            print("FAIL: SVG 加载失败")
            browser.close()
            return 1
        # 视口截图（非 full_page，避免字体加载导致的超时）
        page.screenshot(path=str(DST))
        browser.close()
    (SITE / "assets" / "_og_preview.html").unlink(missing_ok=True)
    print("OK ->", DST, DST.stat().st_size, "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
