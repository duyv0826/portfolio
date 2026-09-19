#!/usr/bin/env bash
# ============================================================
# 一键回归：三层校验全跑一遍
#   1) 前端纯逻辑断言（Node vm，无浏览器）
#   2) 静态扫描 + 资产 200（Python，无浏览器）
#   3) 渲染层真跑 + 截图（Playwright + Chromium）
#
# 用法： bash verify/run_all.sh
# 退出码 0 = 三层全绿
# ============================================================
set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

NODE="/c/Users/duyv/.workbuddy/binaries/node/versions/22.22.2-3/node.exe"
PY="/c/Users/duyv/.workbuddy/binaries/python/envs/default/Scripts/python.exe"

fail=0

echo "########## 1/3 前端纯逻辑断言 ##########"
"$NODE" verify/app_logic.test.js || fail=1

echo ""
echo "########## 2/3 静态扫描 + 资产探测 ##########"
"$PY" verify/verify_site.py || fail=1

echo ""
echo "########## 3/3 渲染层校验 + 截图 ##########"
"$PY" verify/visual_check.py || fail=1

echo ""
if [[ "$fail" -eq 0 ]]; then
  echo "ALL GREEN ✅"
else
  echo "存在失败项 ❌（见上方明细）"
fi
exit "$fail"
