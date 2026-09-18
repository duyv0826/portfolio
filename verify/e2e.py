# -*- coding: utf-8 -*-
"""洪兄作品集静态站 · 端到端回归（Spec v1.0 §9 AC-01..AC-12）

运行前提：站点根目录已起 http://127.0.0.1:8080
用法：python verify/e2e.py
"""
import json
import re
import sys

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8080/"
RESULTS = []


def check(ac, name, ok, detail=""):
    RESULTS.append({"ac": ac, "name": name, "ok": bool(ok), "detail": detail})
    flag = "PASS" if ok else "FAIL"
    print(f"[{flag}] {ac} {name}" + (f" :: {detail}" if detail else ""))


def run(pw):
    browser = pw.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()

    console_errors = []
    dialogs = []
    external_reqs = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))
    page.on("request", lambda r: external_reqs.append(r.url)
            if r.url.startswith("http") and "127.0.0.1:8080" not in r.url else None)

    # ---------- 列表视图 ----------
    page.goto(BASE, wait_until="networkidle")

    hero_name = page.inner_text(".hero-title").strip()
    hero_lede = page.inner_text(".hero-lede").strip()
    preview_count = page.locator("#hero-preview li").count()
    cards = page.locator("#works-grid .work-card").count()
    check("AC-01", "首屏姓名+定位+>=3 作品预览",
          bool(hero_name) and bool(hero_lede) and preview_count >= 3 and cards >= 3,
          f"name={hero_name} preview={preview_count} cards={cards}")

    body_text = page.inner_text("body")
    check("AC-01", "首屏无占位欢迎句/无 emoji",
          ("Lorem" not in body_text) and (not re.search(r"[\U0001F300-\U0001FAFF]", body_text)),
          "占位句/emoji 均未出现")

    # ---------- 路由：点击进入详情 ----------
    page.click("#works-grid .work-card:has-text('抉择的房间') a")
    page.wait_for_timeout(300)
    url_after_click = page.url
    detail_visible = page.locator("#detail-view").is_visible()
    detail_title = page.inner_text(".detail-title").strip() if detail_visible else ""
    check("AC-02", "点击作品卡 -> #work/<id> 同页渲染详情",
          "#work/room-of-choice" in url_after_click and detail_visible and detail_title == "抉择的房间",
          f"url={url_after_click} title={detail_title}")

    # 外链 rel/target（AC-05）
    link = page.locator("#detail-view .detail-link").first
    if link.count():
        rel = link.get_attribute("rel") or ""
        tgt = link.get_attribute("target") or ""
        href = link.get_attribute("href") or ""
        check("AC-05", "详情外链新标签打开 + noopener",
              tgt == "_blank" and "noopener" in rel and "noreferrer" in rel and href.startswith("https://"),
              f"href={href} target={tgt} rel={rel}")
    else:
        check("AC-05", "详情外链新标签打开 + noopener", False, "未找到外链元素")

    # ---------- 刷新深链 ----------
    page.goto(BASE + "#work/room-of-choice", wait_until="networkidle")
    deep_ok = page.locator("#detail-view").is_visible() and \
        page.inner_text(".detail-title").strip() == "抉择的房间"
    check("AC-02", "刷新深链 #work/<id> 仍定位详情", deep_ok, "")

    # ---------- 未知 hash 回退 ----------
    page.goto(BASE + "#work/does-not-exist", wait_until="networkidle")
    nf = page.locator("#notfound-view").is_visible()
    check("AC-02", "未知 hash 回退 404 视图", nf, "")

    # ---------- AC-03 口径关系 ----------
    page.goto(BASE + "#work/qingluan-tingyu", wait_until="networkidle")
    rel_text = page.inner_text(".detail-relation").strip() if page.locator(".detail-relation").count() else ""
    check("AC-03", "《青峦·听雨》标注《澳里·光景》子项目", "澳里·光景" in rel_text, f"relation={rel_text}")

    # ---------- AC-04 图片占位接口 ----------
    ph = page.locator("#detail-view .thumb-ph").first
    ph_attrs = ph.evaluate("el => ({artist: el.dataset.artist, source: el.dataset.source})") if ph.count() else {}
    check("AC-04", "缺图时中性占位 + data-artist/data-source 接口",
          ph.count() > 0 and "artist" in ph_attrs and "source" in ph_attrs,
          json.dumps(ph_attrs, ensure_ascii=False))

    # ---------- AC-10 图标 ----------
    svg_use = page.locator("svg.icon use").count()
    check("AC-10", "图标均为 <svg><use> 引用", svg_use > 0, f"icon use count={svg_use}")

    # ---------- AC-07 零外部 JS/CSS ----------
    bad = [u for u in external_reqs if not ("fonts.googleapis.com" in u or "fonts.gstatic.com" in u)]
    check("AC-07", "无外部 JS/CSS 请求（Google Fonts 除外）", not bad, f"外链请求={bad[:3]}")

    # ---------- AC-06 移动端无横向溢出 ----------
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(BASE, wait_until="networkidle")
    overflow = page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    check("AC-06", "375px 视口无横向溢出", overflow <= 0, f"scrollWidth 溢出={overflow}px")
    page.set_viewport_size({"width": 1280, "height": 900})

    # ---------- AC-08 XSS 注入 ----------
    def tamper(route):
        payload = json.dumps([{
            "id": "xss", "title": "<img src=x onerror=alert(1)>",
            "tag": "<svg/onload=alert(2)>", "desc": "<script>alert(3)</script>",
            "img": "javascript:alert(4)", "link": "javascript:alert(5)",
            "year": "2026", "featured": True,
            "detail": {"overview": ["<img src=x onerror=alert(6)>"],
                       "links": [{"label": "x", "url": "javascript:alert(7)", "kind": "play"}]}
        }], ensure_ascii=False)
        route.fulfill(status=200, content_type="application/json; charset=utf-8", body=payload)

    page.route("**/projects.json", tamper)
    page.goto(BASE + "#work/xss", wait_until="networkidle")
    page.wait_for_timeout(500)
    injected_img = page.evaluate("() => !!document.querySelector('#detail-view img[src=\"x\"]')")
    js_links = page.evaluate(
        "() => Array.from(document.querySelectorAll('#detail-view a')).filter(a => (a.getAttribute('href')||'').toLowerCase().startsWith('javascript:')).length")
    raw_img = page.evaluate(
        "() => Array.from(document.querySelectorAll('#detail-view img')).filter(i => /^javascript:/i.test(i.getAttribute('src')||'')).length")
    check("AC-08", "JSON 注入不执行、不产生 javascript: 链接",
          not dialogs and not injected_img and js_links == 0 and raw_img == 0,
          f"dialogs={dialogs} 注入img={injected_img} js链接={js_links} js图片src={raw_img}")
    page.unroute("**/projects.json")

    # ---------- 真实素材红线：不得残留编造外链 ----------
    page.goto(BASE, wait_until="networkidle")
    hrefs = page.evaluate("() => Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'))")
    fake = [h for h in hrefs if "hongxiong" in (h or "").lower()]
    todos = page.locator(".is-todo").count()
    check("P0", "无编造外链（hongxiong.* 已清除）+ 未核实入口标记 is-todo",
          not fake and todos >= 2, f"残留假链={fake} 占位入口数={todos}")
    gh = [h for h in hrefs if "github.com" in (h or "")]
    check("P0", "GitHub 指向真实账号 duyv0826", gh and all("duyv0826" in h for h in gh), f"github 链接={gh}")

    # ---------- 控制台错误 ----------
    real_errors = [e for e in console_errors if "favicon" not in e.lower()]
    check("QA", "控制台零错误", not real_errors, f"errors={real_errors[:3]}")

    browser.close()


with sync_playwright() as pw:
    run(pw)

failed = [r for r in RESULTS if not r["ok"]]
print("\n==== 汇总 ====")
print(f"总计 {len(RESULTS)} 项，通过 {len(RESULTS) - len(failed)}，失败 {len(failed)}")
for f in failed:
    print(f"  FAIL {f['ac']} {f['name']} :: {f['detail']}")
sys.exit(1 if failed else 0)
