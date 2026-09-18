# -*- coding: utf-8 -*-
"""github.com 的 git/网页端口在当前网络不可达，但 api.github.com 可达。
改用 Git Data API 提交：blob -> tree -> commit -> update-ref，保留历史、不 force。
用法：python verify/push_via_api.py
"""
import base64
import json
import subprocess
import urllib.error
import urllib.request

OWNER, REPO, BRANCH = "duyv0826", "portfolio", "main"
API = "https://api.github.com"


def token():
    return subprocess.run(["gh", "auth", "token"], capture_output=True, text=True,
                          check=True).stdout.strip()


def api(method, path, payload=None, tok=""):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(f"{API}{path}", data=data, method=method)
    req.add_header("Authorization", f"Bearer {tok}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise SystemExit(f"HTTP {e.code} {method} {path}: {e.read().decode('utf-8')[:400]}")


def main():
    tok = token()

    ref = api("GET", f"/repos/{OWNER}/{REPO}/git/ref/heads/{BRANCH}", tok=tok)
    base_sha = ref["object"]["sha"]
    base_commit = api("GET", f"/repos/{OWNER}/{REPO}/git/commits/{base_sha}", tok=tok)
    base_tree = base_commit["tree"]["sha"]
    print(f"远端 {BRANCH} 当前：{base_sha[:8]}  树：{base_tree[:8]}")

    files = subprocess.run(["git", "ls-files"], capture_output=True, text=True,
                           check=True).stdout.split()
    print(f"待提交文件：{len(files)}")

    tree = []
    for f in files:
        with open(f, "rb") as fh:
            raw = fh.read()
        blob = api("POST", f"/repos/{OWNER}/{REPO}/git/blobs",
                   {"content": base64.b64encode(raw).decode("ascii"),
                    "encoding": "base64"}, tok=tok)
        tree.append({"path": f.replace("\\", "/"), "mode": "100644",
                     "type": "blob", "sha": blob["sha"]})
        print(f"  blob {f} -> {blob['sha'][:8]} ({len(raw)}B)")

    new_tree = api("POST", f"/repos/{OWNER}/{REPO}/git/trees",
                   {"base_tree": base_tree, "tree": tree}, tok=tok)
    print(f"新树：{new_tree['sha'][:8]}")

    msg = ("作品集更新：端到端验证通过 + P0 真实素材修复 + CI 红线校验\n\n"
           "- 15 项 E2E 断言全绿（AC-01..AC-12 + P0 守卫 + 控制台零错误）\n"
           "- 清除编造外链（github.com/hongxiong 等）：GitHub 改真实账号 duyv0826，\n"
           "  邮箱改本人学生邮箱；小黑盒/知乎 URL 未验证，改 is-todo 占位不跳转\n"
           "- 署名统一为真实姓名「洪昺森」\n"
           "- 新增 CI：JS 语法 / JSON 可解析 / 无编造外链 / 无 emoji / 无外部依赖 / 图源合规\n"
           "- 新增 docs：DEPLOY_DECISION（Lighthouse 实况与死线）、export_manifest.sh、assets 投放清单")
    commit = api("POST", f"/repos/{OWNER}/{REPO}/git/commits",
                 {"message": msg, "tree": new_tree["sha"], "parents": [base_sha]}, tok=tok)
    print(f"新提交：{commit['sha'][:8]}")

    api("PATCH", f"/repos/{OWNER}/{REPO}/git/refs/heads/{BRANCH}",
        {"sha": commit["sha"]}, tok=tok)
    print(f"\n已更新 refs/heads/{BRANCH} -> {commit['sha']}")
    print(f"查看：https://github.com/{OWNER}/{REPO}/commit/{commit['sha']}")


if __name__ == "__main__":
    main()
