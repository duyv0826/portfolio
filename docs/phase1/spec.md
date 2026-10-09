# 洪兄作品集全站 · 需求规格与 API 契约（Spec）

> 作者：许清楚（产品经理）
> 版本：v1.0（对齐架构文档 architecture.md）
> 日期：2026-10-09
> 配套文档：
> - `prd.md` —— 产品需求（用户画像、竞品、RICE、MVP 范围）
> - `architecture.md` —— 技术选型与版本锚定（技术栈以该文档 §4 为准，本 Spec 不重复钉版本，仅引用）
> 标准依据：团队规范 `spec-as-contract.md`（规格须自包含、点名接口、钉死版本、内嵌坑、带端到端验证）

---

## 0. 范围与对齐声明

- **本 Spec 性质**：PRD 的产品需求 → 开发落地的"契约"。技术栈、依赖版本、部署平台以 `architecture.md` 为准（版本见其 §4，落地须 `npm ci` 锁 `package-lock.json`）。
- **MVP 范围（来自 PRD + 主理人定义，已锁定）**：
  1. 展示前台：首页、作品列表与详情、博客列表与详情、关于页、订阅与留言表单
  2. CMS 后台：作品与博客文章的增删改查（需管理员登录）
  3. 访客订阅与留言：写入数据库，后台可查看
- **明确不做（引用 `architecture.md` §12，防镀金）**：多角色 RBAC、评论前台互动盖楼、全文搜索引擎、国际化/多语言、支付/电商、OAuth 登录、富文本可视化编辑器。本 Spec 严格遵守，不新增上述能力。
- **图标/配色/占位文案硬规则（P0，引用 architecture.md §9/§10）**：图标仅用 Lucide React SVG，禁止 emoji 图标；禁止硬编码颜色（颜色走 Tailwind `@theme` 令牌 / CSS 变量）；禁止紫粉渐变；禁止空洞占位文案（空状态须给引导动作，Loading 须真实骨架屏）。
- **待主理人拍板项（阻塞，见 §8）**：
  1. ICP 备案主体与域名/服务器归属（影响上线合规链路）。
  2. 作品版权结构化字段是否纳入首版（本 Spec §2 已按"纳入"建模；若否决，删除对应 4 个字段即可）。

---

## 1. 功能需求与验收（Given / When / Then）

### 1.1 展示前台
- Given 访客打开首页，When 页面加载完成，Then 3 秒内展示首屏（站长介绍 + 精选 3–5 作品 + 行动号召），文字为中文、无占位文案；首屏为 SSR/SSG 渲染（非白屏 CSR）。
- Given 访客进入作品列表，When 点击作品卡片，Then 跳转作品详情页并展示封面、图集、描述、标签；若已填版权字段则展示"素材来源/授权/署名"信息区。
- Given 访客进入博客列表，When 点击文章，Then 进入详情页渲染 Markdown 正文与发布时间（仅 published 状态可见）。
- Given 访客在关于页，When 浏览，Then 看到站长故事、技能与联系方式（邮箱/社交链接）。
- Given 访客在订阅表单输入合法邮箱并勾选同意，When 提交，Then 写入订阅表（同邮箱不重复）并返回成功提示；邮箱非法或未勾选同意时给出明确错误。
- Given 访客在留言表单填写姓名+内容并勾选同意，When 提交，Then 写入留言表并返回成功提示；触发速率限制（同 IP 60 秒 1 次）时返回限流提示。

### 1.2 管理员认证与 CMS 后台
- Given 未登录用户访问 `/admin` 或 `/api/admin/*`，When 尝试进入，Then 被重定向登录页 / 返回 401。
- Given 管理员用正确邮箱+密码登录，When 登录成功，Then 签发 access(15min)+refresh(7d) 双 httpOnly Cookie 并进入后台仪表盘。
- Given 管理员在后台创建/编辑/删除作品，When 提交，Then 数据库对应记录变更且前台列表/详情同步更新（删除为软删除，列表不显示）。
- Given 管理员创建/编辑/发布/删除博客文章，When 提交，Then 前台按 status（draft/published）正确呈现。
- Given 管理员查看订阅与留言列表，When 打开，Then 看到全部记录及提交时间，支持标记已读/删除。

### 1.3 通用
- Given 任意页面，When 在 375px 宽移动端访问，Then 布局不破版、可正常操作（响应式基线）。
- Given 任意写接口，When 触发，Then 经 Zod 校验 + 速率限制，防注入/XSS；错误返回结构化 `{code,data,message}`。

---

## 2. 数据实体契约（Entity Contract）

> 表名蛇形复数；每表含 `id`(UUID)、`created_at`、`updated_at`(timestamptz, UTC)；软删除 `deleted_at`；外键显式。图片 URL 存字符串（COS CDN 地址），数组类用 `jsonb`。与 `architecture.md` §7 对齐；标注 ※ 为本 Spec 在 PRD 基础上向主理人建议、待确认项。

### 2.1 projects（作品）—— 前台核心
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| slug | text | UNIQUE, URL-safe, 必填 | 详情页路由 |
| title | text | 必填 | 作品标题 |
| summary | text | 必填 | 列表摘要 |
| cover_image_url | text | 必填 | 封面（COS CDN） |
| gallery_urls | jsonb | 可空 | 图集 URL 数组 |
| category | text | 可空 | 分类（如"游戏美术/关卡设计"） |
| tags | jsonb | 可空 | 标签数组 |
| content_md | text | 必填 | Markdown 正文 |
| year | int | 可空 | 创作年份 |
| role | text | 可空 | 担任角色 |
| material_source | text | 可空 ※待确认 | 素材来源说明（游戏设计版权刚需） |
| license_type | enum | 可空 ※待确认 | original / cc0 / cc-by / commercial / client-owned / ai-assisted |
| attribution | text | 可空 ※待确认 | 第三方素材署名 |
| client_auth_status | enum | 可空 ※待确认 | not-client / authorized / pending |
| created_at / updated_at | timestamptz | | UTC |
| deleted_at | timestamptz | 可空 | 软删除 |

### 2.2 blog_posts（博客）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| slug | text | UNIQUE, 必填 | |
| title | text | 必填 | |
| excerpt | text | 可空 | 列表摘要 |
| cover_image_url | text | 可空 | |
| content_md | text | 必填 | Markdown 正文 |
| tags | jsonb | 可空 | |
| status | enum | published / draft | 默认 draft |
| published_at | timestamptz | 可空 | 发布时间（UTC） |
| created_at / updated_at | timestamptz | | |
| deleted_at | timestamptz | 可空 | 软删除 |

### 2.3 subscriptions（订阅）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| email | text | UNIQUE, 必填 | 同邮箱不重复（upsert） |
| name | text | 可空 | |
| source | text | 可空 | 来源标记（如"首页/博客"） |
| consent_at | timestamptz | 建议新增 ※ | 明示同意时间（PIPL 留痕） |
| created_at / updated_at | timestamptz | | |
| unsubscribed_at | timestamptz | 可空 | 退订时间 |

### 2.4 comments（留言）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| name | text | 必填 | |
| email | text | 必填 | |
| message | text | 必填 | |
| type | enum | message / subscribe_note | 便于分别治理 |
| read_at | timestamptz | 可空 | 后台标记已读 |
| consent_at | timestamptz | 建议新增 ※ | 明示同意时间（PIPL 留痕） |
| created_at / updated_at | timestamptz | | |

### 2.5 admin_users（管理员）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | |
| email | text | UNIQUE, 必填 | 登录账号 |
| password_hash | text | 必填 | bcryptjs 哈希 |
| name | text | 可空 | 展示名 |
| created_at / updated_at | timestamptz | | |

---

## 3. API 契约

### 3.1 统一响应信封
所有接口返回统一结构（引用 `architecture.md` §8）：

```json
{ "code": 0, "data": {}, "message": "" }
```
- `code = 0` 表示成功；非 0 为错误码。
- 校验失败时 `data` 可携带字段级错误对象，`message` 为中文可读说明。

### 3.2 错误码约定
| code | 含义 | HTTP | 说明 |
|------|------|------|------|
| 0 | 成功 | 200 | |
| 400 | 参数校验失败 | 400 | Zod 校验未过，`data` 含字段错误 |
| 401 | 未认证 / 凭证错误 | 401 | 登录失败或访问受保护接口未带有效 Cookie |
| 403 | 无权限 | 403 | 预留（单管理员场景少用） |
| 404 | 资源不存在 | 404 | slug/id 不存在 |
| 429 | 请求过于频繁 | 429 | 订阅/留言 每 IP 60 秒 1 次 |
| 500 | 服务器错误 | 500 | 未预期异常 |

### 3.3 端点清单（基于 `architecture.md` §8 扩展，供架构师扩成 openapi.yaml）

**认证（无版本前缀，单体 `/api/*`）**
| Method | Path | 鉴权 | 请求体 | 成功响应 / 错误 |
|--------|------|------|--------|----------------|
| POST | `/api/auth/login` | 否 | `{email, password}` | 200 设 access+refresh 双 httpOnly Cookie，`data:{user:{id,name,email}}`；401 凭证错误 |
| POST | `/api/auth/logout` | 是 | — | 200 清除双 Cookie |
| POST | `/api/auth/refresh` | refresh Cookie | — | 200 静默续期 access；401 refresh 失效 |

**作品（公开读）**
| Method | Path | 鉴权 | 请求 | 成功 / 错误 |
|--------|------|------|------|------------|
| GET | `/api/projects?page&limit&category` | 否 | query: limit 默认 20 上限 50 | 200 `data:{items:[...], page, limit, total}` |
| GET | `/api/projects/:slug` | 否 | — | 200 作品详情；404 |

**作品（管理员写）**
| Method | Path | 鉴权 | 请求体（Zod） | 成功 / 错误 |
|--------|------|------|---------------|------------|
| POST | `/api/admin/projects` | 管理员 | `{slug,title,summary,cover_image_url, gallery_urls?,category?,tags?,content_md,year?,role?, material_source?,license_type?,attribution?,client_auth_status?}` | 201 已创建；400 校验失败；401 |
| PUT | `/api/admin/projects/:id` | 管理员 | 同上（部分更新） | 200 已更新；404 |
| DELETE | `/api/admin/projects/:id` | 管理员 | — | 200 软删除；404 |

**博客（公开读）**
| Method | Path | 鉴权 | 请求 | 成功 / 错误 |
|--------|------|------|------|------------|
| GET | `/api/posts?page&limit` | 否 | 仅返回 published | 200 `data:{items,page,limit,total}` |
| GET | `/api/posts/:slug` | 否 | — | 200 详情；404 |

**博客（管理员写）**
| Method | Path | 鉴权 | 请求体（Zod） | 成功 / 错误 |
|--------|------|------|---------------|------------|
| POST | `/api/admin/posts` | 管理员 | `{slug,title,excerpt?,cover_image_url?,content_md,tags?,status,published_at?}` | 201；400；401 |
| PUT | `/api/admin/posts/:id` | 管理员 | 部分更新 | 200；404 |
| DELETE | `/api/admin/posts/:id` | 管理员 | — | 200 软删除；404 |

**访客互动（合规：必须含 consent=true）**
| Method | Path | 鉴权 | 请求体（Zod） | 成功 / 错误 |
|--------|------|------|---------------|------------|
| POST | `/api/subscribe` | 否 | `{email, name?, source?, consent:true}` | 200 写入/已存在不重复（upsert）；400 缺同意或邮箱非法；429 |
| POST | `/api/contact` | 否 | `{name, email, message, consent:true}` | 200 已提交；400；429 |

**后台查看**
| Method | Path | 鉴权 | 请求 | 成功 / 错误 |
|--------|------|------|------|------------|
| GET | `/api/admin/comments?type&page&limit` | 管理员 | type=message | 200 留言列表 |
| GET | `/api/admin/subscriptions?page&limit` | 管理员 | — | 200 订阅列表 |

---

## 4. 合规要求（PIPL + ICP）

### 4.1 个人信息保护（依据 `architecture.md` §6.4）
- 订阅/留言表单**必须**展示隐私政策页链接，并设"我已阅读并同意隐私政策"勾选项；后端仅在 `consent=true` 时受理，否则 400。
- 建议入库记录 `consent_at`（见 §2.3/§2.4 ※），作为明示同意留痕；隐私政策页须说明收集字段（email/姓名/留言内容）、用途、存储与删除方式。
- 全站 HTTPS 强制（Caddy 自动证书 / 腾讯云免费证书）。

### 4.2 ICP 备案（依据 `architecture.md` §6.2，高风险）
- 域名解析至中国大陆服务器前必须完成 ICP 备案，否则无法开通访问。
- **备案与开发并行启动**：开发第 1 周即提交备案（域名实名 → 云资源 → 腾讯云备案小程序 → 人脸核身 → 初审(1–2天) → 工信部短信核验(24h) → 管局审核≤20 工作日，广东 8–15 工作日）。
- 个人备案单订单仅 1 个网站；页面页脚须展示 ICP 备案号并链接工信部查询。
- 本 Spec 在 §6 排期中将"备案"单列为一个并行工作流，避免上线空窗 1–3 周。

---

## 5. SEO 验收（依据 `architecture.md` §5/§11）

- **渲染方式**：作品/博客详情页必须 SSR/ISR（构建期预渲染 + CDN），列表页 SSR；禁止纯客户端渲染（百度对纯 CSR 抓取差）。
- **Metadata**：`generateMetadata` 输出每页 `title` / `description` / OpenGraph；详情页附 JSON-LD 结构化数据（作品/文章 schema）。
- **收录入口**：提供 `app/sitemap.ts`（`/sitemap.xml`）与 `robots.ts`（`/robots.txt`）；上线后提交百度搜索资源平台 sitemap + 主动推送。
- **验收**：`view-source` 详情页含 `<title>`/`<meta description>`/JSON-LD；百度 UA `curl` 抓取详情页返回 200 且含正文。

---

## 6. 排期 / 里程碑（含备案并行工作流）

| 周次 | 开发工作流 | 备案/合规并行工作流 |
|------|-----------|--------------------|
| W1 | 立项；数据模型与 API 契约定稿；Next.js 16 脚手架 + Prisma + PostgreSQL 起库；登录接口 | 域名实名 + 准备云资源 + 提交 ICP 备案 |
| W2 | 展示前台：首页 / 作品列表·详情 / 博客列表·详情 / 关于页（SSR/ISR） | 备案初审 + 人脸核身 + 工信部短信核验 |
| W3 | CMS 后台：作品/博客 CRUD + 管理员认证中间件 | 管局审核（等待） |
| W4 | 订阅/留言表单 + 后台查看 + 隐私政策页 + 合规同意 | 备案下发号，配置页脚备案号 |
| W5 | SEO（sitemap/robots/Metadata/JSON-LD）+ Docker 部署 + 端到端验收 | 备案完成，绑定已备案域名 + HTTPS，公安备案提醒 |

---

## 7. 内嵌坑与端到端验证（引用 `architecture.md` §13/§14）

**高发坑（写接口时重点防）**
- 权限取反：中间件未登录访问 `/admin`、`/api/admin/*` 必须 401/重定向，不得放行。
- 时区：`published_at` 存 UTC `timestamptz`，展示转东八区。
- 订阅重复：同邮箱用 `upsert`，不新增行。
- 分页 off-by-one：`limit` 默认 20 上限 50，页码从 1 起。
- COS 跨域：浏览器直传须配置 Bucket CORS 白名单（仅生产域名）。
- next/image 自托管：Lighthouse Docker 部署保留默认优化（须正确 COPY `.next/static` 与 `public/`），避免 404。
- 图标约束：全局 grep 确认无 emoji 作图标、仅 `lucide-react` import、无硬编码 hex（除 `#fff`/`#000`）、无紫粉渐变。

**端到端验证清单**
1. 本地 `npm ci && npx prisma migrate dev && npm run dev` → 首页/作品/博客/关于正常渲染（确认 SSR/SSG 非白屏 CSR）。
2. 订阅/留言提交 → 查 `subscriptions`/`comments` 入库；同邮箱订阅不新增行。
3. 登录正确凭证 → 拿双 Cookie；错误凭证 401；`/api/admin/projects` 未带 Cookie 401。
4. CMS 建作品 → 前台出现；DELETE 后软删除生效（列表不显）。
5. `/sitemap.xml`、`/robots.txt` 可访问；`view-source` 详情页含 title/description/JSON-LD。
6. `docker compose up` 于 Lighthouse → 绑定已备案域名 + HTTPS → 国内三网手机打开正常；百度 UA `curl` 详情页 200 且含正文。

---

## 8. 开放问题 / 待主理人决策（阻塞项）

1. **部署与备案归属**：域名/服务器由谁提供？备案主体是否为洪兄本人（个人备案）？—— 决定 §4.2 与 §6 合规链路能否闭环。
2. **作品版权结构化字段是否纳入首版**：PRD 强烈建议纳入（面向游戏设计求职的差异化），但 `architecture.md` §7 的 `projects` 当前未含这 4 个字段。本 Spec §2.1 已按"纳入"建模并标注 ※；若主理人否决，删除 4 字段即可，并请架构师同步更新 `architecture.md` §7 与后续 openapi.yaml。
3. **consent_at 留痕字段**：建议订阅/留言表新增 `consent_at`（PIPL 明示同意留痕），请架构师一并确认是否纳入 schema。

> 其余所有技术细节（版本、部署、认证实现、图标库）均以 `architecture.md` 为唯一权威，本 Spec 不与之冲突，仅在产品需求层做契约化收口。
