# Spec · 洪兄作品集站点迭代 v1.0

> 生成日期：2026-09-18
> 基于：PRD v1.0（许清楚） + 架构文档 v0.1（高见远） + UI/UX 调研（颜好看） + 用户确认决策
> 状态：已确认（用户 2026-09-18 拍板强调色/字体/自动推进）
> 性质：团队内部契约——后续 Phase 2/3/4 以本文档为唯一依据，实现与文档冲突时先改本文档再改代码。

---

## 1. 产品定义

- **一句话描述**：澳门科技大学 互动媒体艺术·游戏设计方向研究生洪兄的个人作品集站点，零构建纯静态单页，数据驱动；去占位、提质、统一对外口径、接入真实画师授权图、新增单页内作品详情页。
- **目标用户**：招聘方/实习负责人、招生委员会/学术导师、小黑盒/知乎内容读者与合作方。
- **核心问题**：现有站点停在 AI 模板层（占位文案、疑似 AI 验证图、空图片位、前后口径不一致、引用已废弃 COS 脚本），无法体现真实能力。

## 2. MVP 范围（锁定——不在此列表的功能一律不做）

| 优先级 | 功能 | 验收标准摘要 | 来源 |
|--------|------|-------------|------|
| P0 | 去占位提质 | 全站文案真实中文、无模板默认句；消除渐变胶囊按钮/毛玻璃/光晕 hero/999px 圆角 | PRD 现状问题 1–3 |
| P0 | 统一对外口径 | 《澳里·光景》=学位作品；《青峦·听雨》=其可玩叙事子项目，卡片与详情页注明关系 | PRD 现状问题 5 |
| P0 | 真实图片填充 | 图片位预留 `artist`/`source` 元数据接口 + 中性占位；本轮不填 AI 图，待用户后续提供真实授权图 | PRD 现状问题 4 |
| P0 | 首页 Hero | 真实姓名+定位+首屏即见精选作品预览，无光晕/无欢迎句 | PRD G1 |
| P0 | 关于 About | 真实简介+学术/创作脉络+小黑盒/知乎外链 | PRD §6.1 |
| P0 | 精选作品网格 | 3–5 张强作品卡，含统一口径关系标注 | PRD G3 |
| P0 | 作品详情页 | 单页内 `#work/<id>` hash 路由渲染，含概述/角色贡献/设计过程/真实可玩外链/图片区 | PRD G2/G5 |
| P0 | 联系 Contact | 邮箱/小黑盒/知乎外链，rel=noopener | PRD §6.1 |
| P1 | 图库 Gallery | 真实画师授权图网格+`artist`/`source` 署名（本轮图源未到位则中性占位） | PRD §6.1 |

## 3. 明确不做（Out-of-Scope — 锁定）

| 不做的功能 | 原因 | 何时考虑 |
|------------|------|----------|
| 引入任何前端框架/构建工具/包管理器 | 用户零构建硬决策、成本归零 | 未来强 SEO/SSR 需求时（见 W1） |
| 新增独立 .html 详情文件 | hash 路由已满足 | — |
| 后端/数据库/CMS/评论/表单 | 纯静态展示站，无此类需求 | 业务需要时 |
| 填充任何 AI 生成图 | 洪兄 P0 美术红线明确反对 | 永远不做 |
| 图床热链作为唯一图片源 | memory 结论：外链会失效 | 永远不做 |
| 多语言/暗亮主题切换/搜索筛选 | MVP 7–15 条规模无需 | 内容增长后 |

## 4. 技术架构（锁定）

| 层 | 技术 | 实际版本/状态 | 锁定原因 |
|----|------|--------------|----------|
| 前端 | 原生 HTML/CSS/JS | 无框架（零构建） | 用户硬决策；GitHub Pages 直接托管 |
| 样式 | CSS 变量 Design Token | 内联 `:root` 于 index.html `<head>` | 消除 magic number（C6） |
| 图标 | inline SVG 描边图标 | 1.5px 描边 / currentColor / 16·20·24px | 禁 emoji 图标（C4） |
| 数据 | `fetch` 静态 JSON | `projects.json` v2 + `gallery.json` v2 | 数据驱动、增删不改代码（C3） |
| 路由 | hash 路由 | `#work/<id>`，无框架 | 详情页=同页视图状态（C2） |
| 部署 | GitHub Pages | 仓库根即发布目录 | 免费、HTTPS、零运维 |
| 字体 | Google Fonts CDN | Inter / Noto Sans SC / JetBrains Mono + `font-display:swap` | 用户 2026-09-18 确认 |

## 5. 数据契约（锁定——开发时以此为唯一依据）

静态资源即"API"：`GET /projects.json`、`GET /gallery.json`，由前端 `fetch` 消费。

### 5.1 `projects.json` v2

必填：`id`（kebab slug，路由键）、`title`。其余可选。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 全局唯一 kebab-case，如 `room-of-choice` |
| `title` | string | 作品名 |
| `tag` | string | 分类标签 |
| `desc` | string | 卡片短描述 |
| `img` | string | 封面路径（repo 相对或稳定 https），空串=中性占位 |
| `artist` | string | 封面授权画师 |
| `source` | string | 封面来源/许可链接，空串=自绘 |
| `link` | string | 旧版单一外链（保留兼容） |
| `featured` | boolean | 是否精选 |
| `detail` | object | 详情内容；缺省则详情视图退化 |
| `detail.overview` | string\|string[] | 概述长文 |
| `detail.storyTree` | array | 剧情树 `{id,label,children?}` |
| `detail.devNotes` | string[] | 开发笔记 |
| `detail.media` | array | 媒体 `{type:'image'|'video', url, caption?, artist?, source?}` |
| `detail.links` | array | 外链 `{label, url, kind?:'play'|'doc'|'source'}` |

### 5.2 `gallery.json` v2

必填：`url`、`name`。可选 `artist`、`source`。

> 迁移：现有 7 条数据补 `id` 即可，无 `detail` 者详情视图自动降级。

## 6. 数据库表清单

无（纯静态，无后端、无数据库）。

## 7. 页面清单（锁定）

| 页面/视图 | 路由 | 核心组件 | 对应数据 | 设计 Token 主题 |
|----------|------|----------|----------|----------------|
| 首页（Hero+关于+精选网格） | `#/` 默认 | Hero 排版区、About、Works Grid | projects.json(featured) | 画廊式暗色编辑排版 |
| 作品详情 | `#work/<id>` | 大图主导、元信息侧栏、上一件/下一件 | projects.json[detail] | 同首页 |
| 图库 | `#gallery`（或同页区块） | justified/masonry 网格 + 灯箱 | gallery.json | 同首页 |
| 联系 | 同页区块 `#contact` | 外链列表 | — | 同首页 |
| 404 | `404.html` | 回首页提示 | — | 同首页 |

## 8. 设计 Token（锁定）

> 全部来自设计师 uiux.md，已并入用户决策。强调色与字体加载已确认。

- **背景阶梯**：`--bg #0C0C0E` → `--surface-1 #16161A` → `--surface-2 #1F1F24`
- **文本**：`--fg #ECECEE` / `--fg-2 #A6A6AE` / `--fg-3 #6C6C74`
- **强调色（已确认）**：`--accent #E0A458` / `--accent-hover #EAB873` / `--accent-soft rgba(224,164,88,0.14)`（每屏≤2处）
- **边框/占位**：`--border #2A2A30` / `--placeholder #1A1A1F`（中性实色，非渐变）
- **间距（4px 网格语义化）**：`--space-1..10` = 4/8/12/16/24/32/40/64/80/120px
- **圆角（去 999px）**：`--radius-none 0` / `sm 2` / `md 4` / `lg 8` / `xl 12`
- **字号（语义 rem）**：xs 12 / sm 14 / base 16 / md 18 / lg 20 / xl 24 / 2xl 30 / 3xl 46 / 4xl 64(clamp 移动端 2.5rem)
- **字体（已确认 Google Fonts CDN）**：`--font-display/body: Inter, Noto Sans SC, system-ui`；`--font-mono: JetBrains Mono, Space Mono, ui-monospace`
- **动效（无弹跳）**：`--motion-fast 120ms` / `--motion-base 200ms`；ease `cubic-bezier(0.22,0.61,0.36,1)`
- **焦点环**：`--focus-ring: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent)`
- **容器**：`--container-max 1200px` / `--container-gutter 24px`；断点 640/768/1024
- **图标系统（锁定）**：inline SVG 描边，1.5px / currentColor / 24 网格，按场景 16/20/24px。必需 15 枚：`arrow-right` `arrow-left` `external` `edit` `close` `menu` `mail` `gamepad` `image` `tag` `play` `chevron` `arrow-up` `github` `link`。装饰图标 `aria-hidden`，功能按钮配 `aria-label`。

## 9. 验收标准（EARS 格式，锁定——QA 测试依据）

| 编号 | 功能 | EARS 验收标准 | 优先级 |
|------|------|--------------|--------|
| AC-01 | 首屏 | When 首页渲染完成，系统**必须**立即展示姓名+定位+≥3 作品预览，且无占位欢迎句、无紫粉渐变、无 emoji 图标 | P0 |
| AC-02 | 详情路由 | When 点击作品卡，系统**必须**将 URL 变为 `#work/<id>` 并在同页无刷新渲染详情；刷新该 URL 仍定位详情；未知 hash 回退列表 | P0 |
| AC-03 | 口径关系 | When 详情页为《青峦·听雨》，系统**必须**标注「《澳里·光景》可玩叙事子项目」 | P0 |
| AC-04 | 图片占位 | If 图片未提供，系统**必须**显示中性占位且 DOM 含 `data-artist`/`data-source` 接口（值为空，非 AI 图） | P0 |
| AC-05 | 可玩外链 | When 访客点击外链图标，系统**必须**在新标签打开真实网页游戏（`rel="noopener noreferrer"`），不破坏当前单页 | P0 |
| AC-06 | 跨端布局 | While 在 iOS/Android 微信内置浏览器与 Chrome/Safari/Firefox 最新两版，系统**必须**正常布局、无横向溢出、可点击 | P0 |
| AC-07 | 零依赖 | Given 构建部署后，When 检查 Network，系统**必须**无外部 JS/CSS 请求（除 Google Fonts） | P0 |
| AC-08 | XSS 防护 | If 任意 JSON 字段含 `<img src=x onerror=alert(1)>` 类值，系统**必须**仅作文本显示、不执行 | P0 |
| AC-09 | 去魔法数 | When 全局 grep 业务样式，系统**必须**无裸色值/裸间距/裸圆角像素（仅 `:root` 定义区可命中） | P0 |
| AC-10 | 图标规范 | While 全站图标，系统**必须**均为 `<svg><use href="#icon-...">` 引用，无 emoji 字符 | P0 |
| AC-11 | 图源稳定 | Given 图片资源，系统**必须**为 repo 相对或 https，无图床热链独占 | P0 |
| AC-12 | 图库署名 | When 图库渲染真实图，系统**必须**带 `artist`/`source` 署名条 | P1 |

## 10. 边界与约束

- 空状态：图片未提供→中性占位+元数据接口；作品<3→网格自适应不显空卡。
- 错误状态：外链失效→详情标注「外链暂不可用」不崩溃；hash 非法→回退首页提示。
- 加载状态：图片 `loading="lazy"` + 渐显；首屏不依赖大图。
- 兼容：Chrome/Safari/Firefox 最新两版 + 移动端微信浏览器；无横向溢出。
- 预览：本地须 `python -m http.server` 起服务（file:// 下 fetch 被拦，W4）。
- 性能：LCP < 2.5s；图片懒加载；核心流程零外部失效脚本。

## 11. 内嵌已知坑（来自项目记忆与架构审计）

| 坑 | 技术栈指纹 | 根因 | 修法 |
|----|------------|------|------|
| XSS/属性逃逸 | 原生 JS innerHTML | 现有 `innerHTML=...${p.title}...` 与 `url('${p.img}')` 直拼 JSON | 统一 `escapeHTML()` + `escapeAttr()` 并校验协议为 http(s)/相对 |
| fetch 失败分支缺失 | 原生 fetch | 只渲染成功数据 | 每 fetch 含 `.catch` + 空态 + `try/catch JSON.parse`；`<img onerror>` 降级 |
| 图床外链失效 | 任意图床热链 | 防盗链/桶删除/域名变更 | 图片入库 repo `assets/`（C8）；真实画师授权 https 直链须 repo 镜像 |
| 幻觉依赖 | 零构建 | 实现者引 CDN 库/框架"图方便" | 硬约束 C1：任何 import/CDN script 视为不合格 |
| 混合内容 | GitHub Pages HTTPS | http:// 图片被拦截 | 图片 URL 强制 https 或 repo 相对 |

## 12. 端到端验证步骤（Spec 锁定最后一项）

```bash
# 1. 本地预览（必须，file:// 下 fetch 失效）
cd <站点根> && python -m http.server 8080
# 浏览器开 http://localhost:8080

# 2. 核心成功流
# 列表出现 8 件作品 → 点「抉择的房间」→ #work/room-of-choice 渲染详情（overview+media+links）→ 后退回列表

# 3. 关键错误流
# 临时把 projects.json 改非法 JSON → 页面显示「加载失败」文案而非白屏；恢复后正常

# 4. XSS 流
# 在某条 title 写 <svg/onload=alert(1)> → 刷新不弹窗，文本原样显示

# 5. 安全扫描
# grep -nE '#[0-9a-f]{3,6}|[0-9]+px' index.html → 仅命中 :root 与 SVG 属性，业务样式零命中
```

## 13. 变更记录

| 日期 | 变更内容 | 原因 | 影响范围 |
|------|----------|------|----------|
| 2026-09-18 | 初版 Spec v1.0 基于三文档生成 | Phase 1 三文档确认 | 全站 |
| 2026-09-19 | 收尾加固（不改范围）：① 去内联 `style` 与 `onerror`，改用 CSS 类 + 事件委托，使站点可在严格 CSP（无 `unsafe-inline`）下运行；② `safeUrl` 判据改为协议头黑名单 → 修复站内相对路径被误杀（图片永不显示）；③ `parseHash` 对畸形 `%` 转义做 try/catch，修复导航白屏；④ 补 OG/Twitter/theme-color/favicon/robots/skip-link/noscript；⑤ 无图时以「作品名首字」排版占位，替代塌陷空白；⑥ 404 页样式外链化；⑦ 首页与 404 署名统一为「洪昺森」 | 收尾与部署打包 | index.html / app.js / styles.css / 404.html / 404.css / assets / verify |

| 2026-09-19（第二批） | 素材收敛：① 小黑盒 / 知乎主页链接核实后实填（原「待补链」占位全部清除，连带清理 `.is-todo` 死代码）；② `projects.json` 为「游戏设计内容矩阵」补 `detail.links`（双平台主页）；③ 澄清《抉择的房间》可玩地址**此前已存在且存活**（`duyv0826.github.io/room-of-choice/`，HTTP 200），撤回站内重复副本以保单一真相源；④ `nginx.conf` 的 favicon 规则改为任意层级匹配；⑤ 渲染层新增 7 项外链断言（含 rel=noopener 与游离色块扫描） | 用户追问素材阻塞项后的收敛动作 | index.html / projects.json / styles.css / deploy/nginx.conf / verify/visual_check.py |

**变更归类**：小改（未新增 API / 未新增表 / 影响页面 = 1 个静态页 + 404 页 / 未改核心流程），按 Spec §13 约定直接更新留痕，不走回 Phase 0。

---

*实现冲突时先更新本文档（living-spec），再改代码；新坑回写 §11。*
