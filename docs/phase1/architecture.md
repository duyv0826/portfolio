# 洪兄作品集站点 · Phase 1 技术调研与架构文档

> 文档性质：**可执行的架构契约（living-spec）**。本文件是后续前端实现、数据填充、设计还原的唯一技术依据——实现与文档冲突时，先改本文档再改代码。
> 版本：`v0.1` · 状态：`Accepted` · 日期：2026-09-18 · 作者：首席架构师 高见远
> 适用阶段：MVP（零构建纯静态单页 + 详情页）。本阶段不含构建工具、不含框架、不含后端。

---

## 0. 引用知识库与本文档的取舍依据

本文档按团队标准知识库逐条对齐，以下条目直接塑造了后面的硬约束与验证步骤（路径为团队专家包内文件）：

| 知识库 | 本文档对应落点 |
|---|---|
| `01-standards/spec-as-contract.md` | 数据契约点名具体文件/字段（§5）；显式 out-of-scope（§11）；收尾端到端验证步骤（§9） |
| `01-standards/context-engineering.md` | 指令给在"恰当高度"：只钉死目标+约束+验收，不给脆弱流程；决策/文件清单外置成可寻址产物（即本文档），不靠会话记忆 |
| `01-standards/generated-code-failure-modes.md` | 已知坑内嵌为硬约束（§8）：XSS 注入、fetch 失败分支、图床外链失效、file:// 预览限制 |
| `architecture/mvp-stack.md` | 选型矩阵（§3）：零构建静态站归入"Landing/内容站"最快档，GitHub Pages 在部署推荐清单内 |
| `cost-models/development-costs.md` | 成本与周期（§10）：个人作品集≈落地页档，AI 辅助进一步压缩；零服务器/零 DB/零 AI API 隐性成本 |

---

## 1. 背景与目标（spec-as-contract §1）

**问题**：现有站点（`2026-09-07-08-00-56/作品集站点/`）是一张纯展示单页，作品仅有卡片 + 外链，无法展开"剧情树 / 开发笔记 / 媒体画廊"等深度内容。用户希望在不引入任何框架与构建工具的前提下，新增**单页内作品详情视图**，并保持"增删数据即改站点、不改代码"的数据驱动范式。

**成功长什么样**：
- 站点仍是**一个 `index.html`**，零构建、双击/托管即可用，GitHub Pages 一行配置托管。
- 列表页点击作品卡片 → 在**同一页面内**通过 `#work/<id>` hash 路由渲染详情视图，不新增 html 文件、不引入 JS 框架。
- 所有视觉值（颜色/间距/字号/圆角）走 Design Token；图标统一为 inline SVG；图片携带 `artist`/`source` 署名元数据。
- 真实画师授权图，本轮不填充 AI 图。

---

## 2. 技术约束清单（硬约束，出现即不合格）

> 以下约束由用户 P0 规则 + 现有代码审计共同得出。实现若违反任意一条，视为不合格交付。

| # | 约束 | 来源 | 违反示例（禁止） |
|---|---|---|---|
| C1 | 零构建、零框架、零运行时依赖；不得出现 `import`/`require`/`<script src=CDN>`/打包步骤 | 用户硬决策 | 引入 React/Vue、用 Vite、引 Tailwind CDN |
| C2 | 详情页用单页内 hash 路由 `#work/<id>`，不新增 `.html` 文件 | 用户硬决策 | 新建 `work.html`、`works/<id>.html` |
| C3 | 数据驱动：沿用 `fetch('projects.json')` + `fetch('gallery.json')`，列表/详情均从 JSON 渲染 | 用户硬决策 | 把作品写死进 HTML |
| C4 | **禁止 emoji 作图标**；锁定一套 inline SVG 图标集（统一描边风格，尺寸 16/20/24px） | P0 规则 | 用 🔗 ⭐ 📁 当图标；混用填充/描边风格 |
| C5 | **禁止硬编码颜色**；全部通过 Design Token（CSS 变量）引用 | P0 规则 | `color:#0e0f13`、`linear-gradient(...#222638...)` 直接写值 |
| C6 | **禁止 magic number**；间距/字号/圆角必须 token 化（CSS 变量 scale） | P0 规则 | `padding:120px 0`、`height:60px`、`border-radius:999px` 裸写 |
| C7 | 所有从 JSON 插值进 DOM 的文本/URL 必须 HTML 转义 + URL 校验（防 XSS / 属性逃逸） | generated-code-failure-modes §8 | 现有 `innerHTML = ...${p.title}...` 直接拼接（见 §8 已知坑 #1） |
| C8 | 图片须稳定来源；禁止依赖会失效的图床外链作为唯一来源 | memory + §7 | `img` 指向 COS/OSS 热链且未做 repo 镜像 |

---

## 3. 技术选型结论与对比（mvp-stack §）

### 3.1 候选方案矩阵

| 方案 | 描述 | 契合"零构建单页+详情页" | MVP 速度 | 部署 | 评分 |
|---|---|---|---|---|---|
| **A. 原生 HTML/CSS/JS 单页 + hash 路由**（选定） | 一个 `index.html`，内联 style/script，fetch JSON，JS 切视图 | ★★★★★ 天然契合 | ★★★★★ | GitHub Pages 零配置 | **9.2** |
| B. Astro 静态生成多页 | 每作品生成独立 html，SSG | ★★ 多页非单页，需构建 | ★★★★ | 任意静态托管 | 7.0 |
| C. Next.js SSG + 路由 | 文件路由 + 构建期预渲染 | ★★ 需 Node 构建链 | ★★★ | Vercel | 6.5 |

### 3.2 结论与理由

**选定方案 A：原生 HTML/CSS/JS 单页 + hash 路由。**

为什么该形态同时契合"零构建单页"与"详情页"双重要求：

1. **单页即零构建的天然载体**。一个 HTML 文件即可被 GitHub Pages 直接托管，无 `npm install`、无打包、无 CI 产物。详情页若用独立 html 文件（方案 B/C），要么需要构建生成、要么需要手写多份——都破坏"零构建"。
2. **hash 路由把"详情页"变成"同页内的一种视图状态"**，而非"一个新页面"。`location.hash` 变化 → JS 重渲染 `#detail` 容器，无导航、无新文档、无 404 风险（未知 hash 回退到列表）。这恰好在"零文件、零框架"前提下满足了"点开作品看详情"的需求。
3. **数据驱动复用同一套 fetch**。列表与详情读同一份 `projects.json`，详情只是对单条记录的展开渲染，不引入新数据源。
4. **成本归零**（development-costs §）：无服务器、无数据库、无 AI API 调用；托管免费；唯一可变成本是"真实画师授权图"的素材/授权预算，与架构无关。

> 反方考量（已否决）：方案 B/C 的 SSG 在"强 SEO / 每作品独立 URL / 社交分享卡片"上更强，但当前无此需求（见 §6 不可行警告），且会引入构建链，违背用户零构建硬决策。故不作为 MVP 选型。

---

## 4. 架构形态图（分层单页）

```
┌──────────────────────────────────────────────────────────────┐
│  GitHub Pages (静态托管, HTTPS, 免费)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  index.html  (单文件, 零构建)                            │  │
│  │                                                          │  │
│  │  ┌─ <head> ──────────────────────────────────────────┐ │  │
│  │  │ Design Tokens (:root CSS 变量: 颜色/间距/字号/圆角) │ │  │
│  │  │ Inline SVG Sprite (<svg><symbol> 图标定义区)       │ │  │
│  │  │ 组件样式 (token 化, 无裸值)                         │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─ <body> 视图层 (由 hash 切换) ────────────────────┐ │  │
│  │  │  #list-view   列表/图库/关于/联系 (默认)           │ │  │
│  │  │  #detail-view 作品详情 (#work/<id> 时渲染)        │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─ <script> 逻辑层 (原生 JS, 无模块打包) ───────────┐ │  │
│  │  │  DataLayer   fetch(projects.json/gallery.json)    │ │  │
│  │  │  Router      hashchange → 解析 #work/<id>         │ │  │
│  │  │  Render      列表卡 / 详情视图 (转义后插值)        │ │  │
│  │  │  Icon        <use href="#icon-x"> 引用 sprite     │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│     ↑ 静态消费                                                  │
│  assets/covers/*  assets/gallery/*  (repo 内稳定图片源)        │
└──────────────────────────────────────────────────────────────┘
```

分层原则（context-engineering：恰当高度，不写死脆弱流程）：逻辑层只暴露"职责 + 验收"，具体实现交给实现者；视图层与数据层通过 JSON Schema 契约解耦（§5）。

---

## 5. 数据契约（spec-as-contract：点名文件 + 接口形状）

> 契约即规格。下列字段为**新增/扩展**的最小集，旧字段保留以兼容现有 7 条数据。实现者须严格按 JSON Schema 校验。

### 5.1 `projects.json`（v2，扩展自现有 v1）

现有 v1 字段：`title, tag, desc, img, link`（无 `id`）。v2 在保留全部 v1 字段基础上扩展：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | **是** | kebab-case slug，全局唯一，作 `#work/<id>` 路由键。例：`room-of-choice` |
| `title` | string | 是 | 作品名（卡片 + 详情标题） |
| `tag` | string | 否 | 分类标签 |
| `desc` | string | 否 | 卡片短描述 |
| `img` | string | 否 | 封面图路径（repo 相对或稳定 https），空串=用字母占位 |
| `artist` | string | 否 | 封面图授权画师/作者，用于署名 |
| `source` | string | 否 | 封面图来源/许可链接，空串=自绘 |
| `link` | string | 否 | 旧版单一外链（保留兼容）；新结构建议用 `detail.links` |
| `featured` | boolean | 否 | 是否精选（默认 false） |
| `detail` | object | 否 | 详情页内容（hash 路由渲染）；缺省则详情视图退化为"大图+desc+link" |
| `detail.overview` | string\|string[] | 否 | 概述长文（数组=多段） |
| `detail.storyTree` | array | 否 | 剧情树/分支结构（仅叙事类）；每节点 `{id,label,children?}` |
| `detail.devNotes` | string[] | 否 | 开发笔记条目 |
| `detail.media` | array | 否 | 媒体列表；项 `{type:'image'|'video', url, caption?, artist?, source?}` |
| `detail.links` | array | 否 | 外链集合；项 `{label, url, kind?}`（kind: play/doc/source） |

**JSON Schema 草案（draft-07）**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "projects.json v2",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "title"],
    "additionalProperties": true,
    "properties": {
      "id": { "type": "string", "pattern": "^[a-z0-9][a-z0-9-]*$" },
      "title": { "type": "string", "minLength": 1 },
      "tag": { "type": "string" },
      "desc": { "type": "string" },
      "img": { "type": "string" },
      "artist": { "type": "string" },
      "source": { "type": "string" },
      "link": { "type": "string", "format": "uri" },
      "featured": { "type": "boolean" },
      "detail": {
        "type": "object",
        "properties": {
          "overview": { "oneOf": [ { "type": "string" }, { "type": "array", "items": { "type": "string" } } ] },
          "storyTree": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "label"],
              "properties": {
                "id": { "type": "string" },
                "label": { "type": "string" },
                "children": { "type": "array" }
              }
            }
          },
          "devNotes": { "type": "array", "items": { "type": "string" } },
          "media": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type", "url"],
              "properties": {
                "type": { "type": "string", "enum": ["image", "video"] },
                "url": { "type": "string" },
                "caption": { "type": "string" },
                "artist": { "type": "string" },
                "source": { "type": "string" }
              }
            }
          },
          "links": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["label", "url"],
              "properties": {
                "label": { "type": "string" },
                "url": { "type": "string", "format": "uri" },
                "kind": { "type": "string", "enum": ["play", "doc", "source"] }
              }
            }
          }
        }
      }
    }
  }
}
```

**迁移**：现有 7 条数据补 `id`（取 title 拼音/英文 slug）；无 `detail` 的作品详情视图自动降级，不阻断。

### 5.2 `gallery.json`（v2，扩展署名元数据）

现有 v1：`{url, name}`。v2 增加 `artist`/`source`：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `url` | string | 是 | 图片路径（repo 相对或稳定 https） |
| `name` | string | 是 | 显示名 |
| `artist` | string | 否 | 画师/作者署名 |
| `source` | string | 否 | 来源/许可链接 |

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "gallery.json v2",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["url", "name"],
    "additionalProperties": false,
    "properties": {
      "url": { "type": "string" },
      "name": { "type": "string" },
      "artist": { "type": "string" },
      "source": { "type": "string" }
    }
  }
}
```

---

## 6. 不可行 / 局限警告（必须写进规格的坑）

| # | 警告 | 触发条件 | 当前是否适用 | 若发生须如何 |
|---|---|---|---|---|
| W1 | **强 SEO / SSR 需求** → 当前架构不成立，须迁移 SSG（方案 B/C） | 未来要求搜索引擎收录每作品独立页、社交分享卡片、per-page canonical | **否**（个人作品集通常不需） | 改架构为 Astro/Next SSG，预渲染详情页 |
| W2 | **hash 路由对 SEO/分享的局限**：`#work/<id>` 不被爬虫视为独立 URL；外部直接深链无法定位；无独立 canonical/OG | 任何依赖"作品页被搜索引擎/微信卡片正确抓取"的场景 | 部分（分享链接可用但 OG 图不会随作品变） | 同 W1，或接受"列表页 OG + 详情仅站内可达" |
| W3 | **GitHub Pages 无服务端重写**：未知路径不会回退到 index.html——但本方案是单页 + hash，hash 段不请求服务端，故无需 SPA fallback；仅需提供 `404.html` | 任何非 hash 的深链 | 否 | 维持 hash 路由即可规避 |
| W4 | **file:// 本地双击预览失效**：浏览器安全策略禁止 `file://` 下 `fetch` 本地 JSON | 实现者本地直接双击 `index.html` 验证 | 调试期易踩 | 用 `python -m http.server` 起本地静态服务预览（现有代码已提示） |

---

## 7. 图片资源策略（C8 展开：图床外链失效）

**memory 结论：图床外链（COS/OSS/第三方图床热链）会失效**——防盗链、桶删除/欠费、域名变更都会导致"某天全站图变灰"，且不可预警。

**稳定来源策略（按优先级）**：

1. **首选：图片入库（repo 内 `assets/`）**。GitHub Pages 随仓库永久托管，git 版本化、零外链、离线可活。封面与 gallery 图建议落 `assets/covers/`、`assets/gallery/`。`img`/`url` 填 repo 相对路径（如 `assets/covers/room-of-choice.jpg`）。
2. **次选：画师稳定授权 https 直链**（带书面授权），并在 JSON 记 `artist`/`source` 备查；仍建议关键封面在 repo 镜像一份以防原链失效。
3. **禁止**：把图床热链作为唯一来源且不镜像（违反 C8）。

> 现有 `create_cos_buckets.py --gallery` 流水线生成的外链 gallery.json **建议退役或改为"生成后落库"**——若保留图床，须同时把图 commit 进 repo 作为稳定副本。本轮不填充 AI 图（用户硬决策）。

---

## 8. 已知坑内嵌为硬约束（generated-code-failure-modes §8）

| # | 失效模式 | 本项目具体表现 | 纠偏纪律（实现必做） |
|---|---|---|---|
| 1 | **沉默逻辑错误 / XSS 注入**（极高） | 现有 `innerHTML = ...${p.title}...` 与 `style="background-image:url('${p.img}')"` 直接拼接 JSON 值；若数据含 `<script>` 或 `'`)]" ` 即注入/属性逃逸 | 所有 JSON 值进 DOM 前 `escapeHTML()`；URL 进 `url()`/`href` 前 `escapeAttr()` 并校验协议为 `http(s)`/相对；详情渲染统一经转义层 |
| 2 | Happy-path 偏差 | 只渲染成功数据，忽略 fetch 4xx/网络断/JSON 解析错/空数组 | 每个 fetch 必须含 `.catch` + 空态文案 + 解析用 `try/catch JSON.parse`；缺 `img` 用字母占位；`<img>` 加 `onerror` 降级 |
| 3 | 幻觉依赖 | 实现者为"方便"引入 CDN 库/框架 | 硬约束 C1：零依赖；任何 `import`/CDN `<script>` 视为不合格，破坏零构建保证 |
| 4 | 缺失系统上下文 | GitHub Pages 仅 HTTPS → `http://` 图片被混合内容拦截；未设 CSP | 图片 URL 强制 https 或 repo 相对（C8）；不在零构建前提下强行加 CSP（可后续） |
| 5 | 性能盲区 | 详情页一次性加载全部 media 大图 | 列表/详情图加 `loading="lazy"`；详情 media 仅在进入 `#work/<id>` 后渲染；MVP 规模 <50 条无需分页 |

---

## 9. 验收标准 + 端到端验证步骤（spec-as-contract §4）

**验收（可判定）**：
- [ ] 单 `index.html` 通过 `python -m http.server` 打开，列表与图库从 JSON 渲染；浏览器 Network 无外部 JS/CSS 请求（零依赖，C1）。
- [ ] 点击作品卡 → URL 变 `#work/<id>`，同页渲染详情；刷新该 URL 仍定位到详情（W4 用 http 预览）；未知 hash 回退列表。
- [ ] 任意 JSON 字段注入 `<img src=x onerror=alert(1)>` 类值，页面不执行、仅作文本显示（C7/#1）。
- [ ] 全局 grep 源码：无裸色值（如 `#0e0f13`）、无裸间距/字号/圆角像素（如 `120px`/`60px`/`999px`），仅 Design Token 引用（C5/C6）。
- [ ] 全站图标均为 `<svg><use href="#icon-...">` 引用 sprite，无 emoji 字符（C4）。
- [ ] 所有图片路径为 repo 相对或 https，无图床热链独占（C8）。

**端到端验证步骤（实现收尾必跑）**：
1. `cd <站点根> && python -m http.server 8080`，浏览器开 `http://localhost:8080`。
2. 核心成功流：列表出现 7 条作品 → 点"抉择的房间" → `#work/room-of-choice` 渲染详情（overview + media + links）→ 浏览器后退回列表。
3. 关键错误流：临时把 `projects.json` 改成非法 JSON → 页面显示"加载失败"文案而非白屏；恢复后正常。
4. XSS 流：在 `projects.json` 某条 `title` 写入 `<svg/onload=alert(1)>`，刷新 → 不弹窗，文本原样显示。
5. 安全扫描：对 `index.html` 跑 `grep -nE '#[0-9a-f]{3,6}|[0-9]+px'`（应仅命中 token 定义区 `:root` 与 SVG 属性，业务样式零命中）。

---

## 10. 成本与周期（development-costs §）

| 项 | 估算 | 说明 |
|---|---|---|
| 实现周期 | 1–2 周（AI 辅助可压至 3–5 天） | 个人作品集≈落地页档（0.5 人月基线） |
| 托管 | ¥0 | GitHub Pages 免费，HTTPS 自带 |
| 服务器/DB | ¥0 | 纯静态，无后端 |
| AI API | ¥0 | 本轮不接 AI |
| 设计资源 | 图标 ¥0（inline SVG 自维护）；画师授权图按素材计 | 真实画师授权为唯一可变成本 |

---

## 11. 本次不做（out-of-scope，防镀金）

- 不引入任何框架 / 构建工具 / 包管理器（C1）。
- 不新增独立 `.html` 详情文件（C2）。
- 不做 SSR / SSG / 强 SEO 优化（见 W1）。
- 不接后端、不用数据库、不做评论/表单提交。
- 不填充 AI 生成图（用户硬决策）；不内置图床上传脚本（C8 优先 repo 入库）。
- 不做多语言、不做暗/亮主题切换（Design Token 已预留，但本轮不实现切换逻辑）。
- 不做搜索/筛选（MVP 7–15 条无需）。

---

## 12. 文件结构草案（零构建约束）

```
作品集站点/                      # GitHub Pages 仓库根（零构建，根即发布）
├── index.html                   # 唯一页面：tokens + svg sprite + 视图层 + script 逻辑层（内部分层见下）
├── 404.html                     # 未知路径兜底（单页，body 提示回首页）
├── projects.json               # 数据契约 v2（§5.1）
├── gallery.json                # 数据契约 v2（§5.2）
├── assets/
│   ├── tokens.css              # 【可选拆出】Design Token 定义(:root 变量)；或内联进 index.html <head>
│   ├── icons.svg               # 【可选】inline SVG sprite 文件；或内联进 index.html
│   ├── covers/                 # 作品封面（repo 稳定源，C8）
│   │   └── room-of-choice.jpg
│   └── gallery/                # 图库原图（repo 稳定源 + artist/source 元数据）
│       └── style_verify_realphoto.png
└── docs/
    └── phase1/
        └── architecture.md      # 本文档
```

**`index.html` 内部分层（单文件但逻辑分区，满足"零构建+可维护"）**：

```
<head>
  ├─ <style> :root { /* Design Tokens: --color-*, --space-*, --fs-*, --radius-* */ }
  │          组件样式（全部引用 token，无裸值）
  ├─ <svg style="display:none"> <symbol id="icon-arrow-right">…</symbol> … </svg>  # 图标 sprite 区
</head>
<body>
  ├─ #list-view   列表/图库/关于/联系（默认可见）
  ├─ #detail-view 作品详情容器（默认隐藏，hash 命中时填充）
  └─ <script>
       const Tokens = {...}                 # 可选：运行期读 token（一般 CSS 侧完成）
       const Icons  = { arrowRight:'#icon-arrow-right', ... }  # 图标名→sprite id 映射
       async function loadData() { fetch + try/catch + 空态 }   # DataLayer
       function router() { 解析 location.hash → renderList / renderDetail }  # Router
       function renderDetail(id) { 查 projects.json → 转义插值 → 填充 #detail-view }  # Render
       function escapeHTML(s){...} escapeAttr(s){...}           # 安全层（C7）
       window.addEventListener('hashchange', router); router();
     </script>
```

**零构建约束重申**：仓库根直接作为 GitHub Pages 发布目录；无 `package.json`、无 `dist/`、无 CI 构建步骤。`assets/` 内图片经 git 提交即上线，无需上传脚本。

---

## 13. ADR 索引（决策留痕）

- **ADR-001 采用零构建原生单页 + hash 路由**：契合零构建单页 + 详情页双重要求，成本归零。（§3）
- **ADR-002 图片入库 repo 而非图床热链**：规避外链失效，稳定可版本化。（§7, C8）
- **ADR-003 全部视觉值 token 化 + inline SVG 图标**：满足 P0 三条硬约束，去魔法数/硬编码色/emoji。（C4/C5/C6）

---

*文档结束。实现冲突时先更新本文档（living-spec），再改代码；新坑回写 §8。*
