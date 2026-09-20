# -*- coding: utf-8 -*-
"""生成可下载的 resume.pdf，并给源数据打指纹。

为什么要指纹：静态 PDF 从生成那一刻起就开始过期，
而我们对简历的承诺是「和作品集同源、永不漂移」。
这里把 profile.json / projects.json 的 sha256 记进 resume.fingerprint.json，
verify_site.py 每次跑都会比对——源数据一改，校验就喊「PDF 已过期，跑我重建」。
不靠人记着。

用法：
    python verify/make_resume_pdf.py
产物：
    site/resume.pdf               可直接丢给招聘方的 A4 文件
    site/resume.fingerprint.json  源数据指纹（别手改）
"""
from __future__ import annotations

import functools
import hashlib
import http.server
import json
import pathlib
import socketserver
import sys
import threading
import time
import datetime

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
CHROME = r"C:\Users\duyv\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"

SOURCES = ["profile.json", "projects.json"]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def fingerprint() -> dict:
    out = {}
    for name in SOURCES:
        raw = (SITE / name).read_bytes()
        out[name] = hashlib.sha256(raw).hexdigest()[:16]
    return out


def main() -> int:
    handler = functools.partial(Quiet, directory=str(SITE))
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        port = httpd.server_address[1]
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{port}"

        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=CHROME)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            errors: list[str] = []
            page.on("pageerror", lambda e: errors.append(str(e)))

            page.goto(base + "/index.html#resume", wait_until="load")
            page.wait_for_timeout(2000)

            title = page.locator("#resume-name").inner_text()
            n = page.locator("#resume-view .resume-work").count()
            if "洪昺森" not in title or n != 8:
                print(f"FAIL  简历未正确渲染：标题={title!r} 作品数={n}")
                return 1
            if errors:
                print(f"FAIL  控制台报错：{errors[:3]}")
                return 1

            page.emulate_media(media="print")
            page.wait_for_timeout(500)
            out = SITE / "resume.pdf"
            # print_background=False：纸就该是白的，别把深色底也打出来
            page.pdf(path=str(out), format="A4", print_background=False,
                     margin={"top": "16mm", "bottom": "16mm",
                             "left": "14mm", "right": "14mm"})
            browser.close()
        httpd.shutdown()

    size = out.stat().st_size
    if size < 5000:
        print(f"FAIL  PDF 过小（{size} 字节），多半是白页")
        return 1

    meta = {
        "generated_from": {k: fingerprint()[k] for k in SOURCES},
        "generated_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        "note": "源数据（profile.json / projects.json）任一变动后，此 PDF 即过期；"
                "跑 python verify/make_resume_pdf.py 重新生成。",
    }
    (SITE / "resume.fingerprint.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"OK    {out.name}  {size // 1024} KB")
    for k, v in meta["generated_from"].items():
        print(f"      指纹 {k}: {v}")
    print("      resume.fingerprint.json 已写入")
    return 0


if __name__ == "__main__":
    sys.exit(main())
