# 作品集静态站 · 端到端验证报告

- 日期：2026-09-19
- 对象：`2026-09-18-19-41-55`（零依赖纯静态版，暗色主题）
- 依据：`docs/spec/spec.md` §9 AC-01..AC-12 + §12 端到端验证步骤
- 环境：本地 `python -m http.server 8080`；Playwright + Chromium（headless）

## 结论

**15 项断言全部通过，0 失败。** 修复前暴露 1 类 P0 问题（编造外链），已修复并加回归守卫。

## 断言明细

| 编号 | 检查项 | 结果 | 实测 |
|---|---|---|---|
| AC-01 | 首屏姓名+定位+≥3 作品预览 | PASS | 洪昺森 / 预览 3 / 卡片 8 |
| AC-01 | 无占位欢迎句、无 emoji | PASS | — |
| AC-02 | 点击作品卡 → `#work/<id>` 同页渲染 | PASS | `#work/room-of-choice` |
| AC-02 | 刷新深链仍定位详情 | PASS | — |
| AC-02 | 未知 hash 回退 404 视图 | PASS | — |
| AC-03 | 《青峦·听雨》标注子项目口径 | PASS | 「《澳里·光景》可玩叙事子项目」 |
| AC-04 | 缺图占位含 `data-artist`/`data-source` | PASS | 属性存在，值为空 |
| AC-05 | 外链 `target=_blank` + `noopener noreferrer` | PASS | `duyv0826.github.io/room-of-choice/` |
| AC-06 | 375px 视口无横向溢出 | PASS | 溢出 0px |
| AC-07 | 无外部 JS/CSS（Google Fonts 除外） | PASS | 外链请求 0 |
| AC-08 | JSON 注入不执行、无 `javascript:` 链接 | PASS | 无弹窗、无注入 img、无 js 链接 |
| AC-10 | 图标均为 `<svg><use>` 引用 | PASS | 32 处 |
| P0 | 无编造外链 + 未核实入口标 `is-todo` | PASS | 残留假链 0，占位入口 4 |
| P0 | GitHub 指向真实账号 | PASS | `github.com/duyv0826`（HTTP 200 已核验） |
| QA | 控制台零错误 | PASS | 0 条 |

## 本轮修复（P0）

| 问题 | 根因 | 处理 |
|---|---|---|
| 联系方式全是编造外链（`github.com/hongxiong`、`hi@hongxiong.art`、小黑盒/知乎 `/u/hongxiong`） | 占位值被写成看似真实的 URL | GitHub 改 `duyv0826`（已核验 200）；邮箱改 `2260030089@student.must.edu.mo`；小黑盒/知乎 URL 未验证（`/u/<id>` 实测 404），改 `is-todo` 占位：虚线弱化 + 「待补链」标记，不跳转 |
| 署名回退成昵称「洪兄」 | 纯静态版未沿用旧版文案 | 统一为真实姓名「洪昺森」（title / meta / 品牌 / 首屏 / 页脚） |

## 复跑方式

```bash
cd <站点根> && python -m http.server 8080 --bind 127.0.0.1
python verify/e2e.py     # 需 playwright 环境
```

改 `projects.json` / `index.html` 后复跑即可，退出码非 0 即失败。

## 仍然开放（依赖洪兄提供，不可代填）

1. 小黑盒 / 知乎真实主页 URL → 填进 `index.html` 联系区与关于区，去掉 `is-todo`
2. 作品真实图（hero + 各封面）→ 落 `assets/`，填 `projects.json` 的 `img`/`artist`/`source`。详见 **`assets/README.md`**
3. `resume.pdf`、校园大使厂商与量化细节
4. 《澳里·光景》《青峦·听雨》可玩链接：Unity 项目未发布 web 版，暂留空（《抉择的房间》已有真实链接 `duyv0826.github.io/room-of-choice/`，200 已核验）

## 2026-09-19 追加核查（三路并行结果）

### ① 小黑盒主页 URL：未取到，维持占位

走已登录 profile（`heybox_id=81382527`，昵称「都督渡雨0v0」）两轮抓取，渲染出的都是落地页（锚点 4~7 个，全是下载/备案链接），登录态在 headless 下未生效，**未拿到个人主页 URL**。
按真实素材红线——不猜 URL 格式（`/u/<id>` 实测 404），`is-todo` 占位保留。

### ② Lighthouse 实例：已关机 + 已隔离，不是「还能续费」的状态

实测：状态 `SHUTDOWN`，最近操作 `IsolateInstances`（2026-09-17 隔离成功），到期 2026-09-15；ICMP 100% 丢包，22/80/443/3000/8080/8090 全不可达。
快照有 2 个（9/05、9/07，NORMAL）但**随实例释放同步删除**，不是保险。可续费找回窗口约到 **2026-10-02**。
完整时间线与建议见 **`docs/DEPLOY_DECISION.md`**。

### ③ 部署建议：静态站走 GitHub Pages，与 Lighthouse 解耦

站点是零依赖纯静态（无后端/无数据库），绑在一台包月云主机上性价比是反的。推荐 GitHub Pages（¥0，已有 `duyv0826.github.io` 在用），Lighthouse 单独按「要不要救数据」决策。

### 本轮新增文件

| 文件 | 用途 |
|---|---|
| `verify/e2e.py` | 端到端回归（15 项） |
| `verify/fetch_profile_links.py` / `fetch_profile_links2.py` | 小黑盒主页 URL 抓取（未取到） |
| `docs/DEPLOY_DECISION.md` | Lighthouse 实况 / 时间线 / 部署方案对比 |
| `assets/README.md` | 真实图片投放清单（坑位、命名、署名字段） |
