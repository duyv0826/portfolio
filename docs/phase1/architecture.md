# 洪兄作品集全站 · 架构调研与选型结论（Phase 1）

> 文档性质：Phase 1 独立技术调研交付物（自包含契约，供 PM 写 Spec、Designer 出视觉、Dev 落地实现）
> 作者：高见远（首席架构师） · 日期：2026-10-09
> 适用阶段：MVP（毕业设计展示 / 校园大使 / 求职三大目标，中文国内受众）

## 0.0 部署基线（Phase 2 补录 · 复用现有资源 · 不阻塞开发）

> 依据 `docs/decisions/OPEN-DECISIONS.md` 已裁定项：部署基线复用现有腾讯云资源，ICP 备案列入 Phase 4 并行任务 tracked，**不阻塞** Phase 2/3 开发。

- **计算**：腾讯云轻量应用服务器 Lighthouse（广州，实例 `lhins-78odvjjb`，2 核 2G）。
- **对象存储（图床）**：腾讯云 COS `imgbed` 存储桶 + CDN（作品图 / 头像 / 博客配图）。
- **ICP 备案**：作为 Phase 4 并行任务，记入 `docs/decisions/OPEN-DECISIONS.md`（当前为 OPEN 项，待用户续费实例并确认域名 / 备案现状后闭环）。开发期可用 `localhost` 自测，上线前完成备案绑定已备案域名 + HTTPS。
- 其余技术栈、版本锚定、认证方案、图标库均以本文 §1–§14 为准；部署基线不改动上述任何选型。

---

## 0. 引用知识库（门禁核验）

本文档产出前已读取以下团队知识库，结论受其约束：

- `references/01-standards/spec-as-contract.md` —— 规格须自包含、点名文件/接口、钉死版本、内嵌坑、带端到端验证。
- `references/01-standards/context-engineering.md` —— 上下文预算纪律：指令恰当高度、关键状态外置为可寻址产物。
- `references/01-standards/generated-code-failure-modes.md` —— 防幻觉依赖/接口、沉默逻辑错误、缺失系统上下文（权限/限额/合规）。
- `references/architecture/mvp-stack.md` —— MVP 选型矩阵基线（**已据国内部署现实做合规改写**，见 §6 说明）。
- `references/cost-models/development-costs.md` —— 开发成本与隐性成本（服务器/域名/备案/对象存储）。

---

## 1. 选型结论摘要（推荐方案 + 版本号）

**推荐方案 A（主推，全栈一体）：**

| 层 | 选型 | 锚定版本 |
|----|------|----------|
| 前端框架 | Next.js（App Router，SSR/SSG/ISR + Metadata API） | `next@^16.2`（≥16.2.11 安全补丁）；`react@^19.2` / `react-dom@^19.2` |
| 后端 API | Next.js Route Handlers（`app/api/**/route.ts`）+ Server Actions | 同 Next.js 运行时 |
| 样式系统 | Tailwind CSS（CSS-first，主题令牌，杜绝硬编码色） | `tailwindcss@^4` |
| ORM / 数据访问 | Prisma（schema-first + 迁移 + 类型安全） | `prisma@^7` / `@prisma/client@^7` / `@prisma/adapter-pg@^7` / `pg@^8` |
| 数据库 | PostgreSQL（关系型，作品/博客/留言/订阅强关联） | PostgreSQL 16.x（服务端）/ 驱动 `pg@^8` |
| 用户认证 | 自建 JWT：access 15min + refresh 7d，httpOnly Cookie | `jose@^5`（签名/校验，Edge 兼容）+ `bcryptjs@^2.4`（密码哈希） |
| 图标库（SVG，锁定） | **Lucide React**（内联 SVG、tree-shakable、`currentColor` 主题化） | `lucide-react@^1.0`（当前 1.x，已达 1.0） |
| 校验 | Zod（请求体/环境变量校验） | `zod@^3` |
| 部署平台 | 腾讯云轻量应用服务器（Lighthouse）+ Docker Compose；备选 CloudBase 云托管 | Docker `node:20-alpine` 运行时 |
| 对象存储（图床） | 腾讯云 COS 标准存储 + CDN（作品图/头像/博客配图） | `cos-nodejs-sdk-v5` 或 `@aws-sdk/client-s3`（S3 兼容） |
| 反向代理 / HTTPS | Caddy（自动 HTTPS）或 Nginx | `caddy:2` 镜像 |
| 语言 / 构建 | TypeScript + Turbopack | `typescript@^5.6` / `node@20` LTS |

**一句话结论：** Next.js 16 全栈单体（前端 + Route Handlers 后端 + Prisma + PostgreSQL）部署在**腾讯云轻量服务器 Docker**（或 CloudBase 云托管），国内部署、可备案、SSR/ISR 满足百度等国内搜索引擎 SEO，管理员用自建 JWT（15min access + 7d refresh）保护 CMS。

---

## 2. 技术选型对比矩阵（3 套完整方案）

评分 1–5，越高越优；运维复杂度反向（越低越好已折算为"运维友好度"高分）。

### 方案 A（推荐）：Next.js 16 全栈 + Prisma + PostgreSQL + 腾讯云

| 维度 | 前端 | 后端 | ORM | 数据库 | 部署 | 认证 | 国内部署友好 | SEO | MVP 速度 | 生态成熟 | 运维友好 | 成本 |
|------|------|------|-----|--------|------|------|------|-----|---------|---------|---------|------|
| 选型 | Next.js 16 | Route Handlers | Prisma 7 | PostgreSQL 16 | 腾讯云 Lighthouse / CloudBase | 自建 JWT(jose+bcryptjs) | 5 | 5 | 5 | 5 | 4 | 5 |
| 说明 | App Router 原生 SSR/SSG/ISR | 同仓 API，无跨服务调用 | schema 迁移友好 | 关系型契合内容站 | 备案可达、国内节点 | 精确匹配 15min/7d 规范 | 国内节点快、可备案 | Metadata+sitemap 完善 | 单仓单部署 | 文档丰富 | Docker 自管 PG 需备份 | 服务器≈¥100/年 |

### 方案 B：Next.js 16 前端 + FastAPI 后端 + PostgreSQL + 腾讯云（前后端分离）

| 维度 | 前端 | 后端 | ORM | 数据库 | 部署 | 认证 | 国内部署友好 | SEO | MVP 速度 | 生态成熟 | 运维友好 | 成本 |
|------|------|------|-----|--------|------|------|------|-----|---------|---------|---------|------|
| 选型 | Next.js 16 | FastAPI (Python) | SQLAlchemy 2 / Prisma | PostgreSQL 16 | Lighthouse 双容器 | JWT (python-jose+bcrypt) | 5 | 5 | 3 | 5 | 3 | 4 |
| 说明 | 同 A | 独立 Python 服务，更"标准全栈" | 双语言栈 | 同 A | 需编排两服务+网关 | 同规范 | 同 A | 同 A | 双栈认知负担 | 成熟 | 两服务运维更重 | 略高（多容器） |

### 方案 C：Nuxt 3（Vue 3）全栈 + Drizzle + PostgreSQL + 腾讯云（Vue 生态替代）

| 维度 | 前端 | 后端 | ORM | 数据库 | 部署 | 认证 | 国内部署友好 | SEO | MVP 速度 | 生态成熟 | 运维友好 | 成本 |
|------|------|------|-----|--------|------|------|------|-----|---------|---------|---------|------|
| 选型 | Nuxt 3 (Vue 3) | Nitro Server Routes | Drizzle | PostgreSQL 16 | Lighthouse / CloudBase | Nuxt Auth / 自建 JWT | 5 | 5 | 4 | 4 | 4 | 5 |
| 说明 | Vue 生态偏好者可选 | 同仓 API | 轻量 SQL-like | 同 A | 同 A | 亦可 jose+bcryptjs | 同 A | Nuxt SSR 友好百度 | 略低于 React 生态 | 国内 Vue 社区活跃 | 同 A | 同 A |

### 矩阵裁决

- **方案 B 的权衡**：前后端分离"更标准"，但带来双语言栈、双服务编排、跨域/CSRF 额外治理成本。对单人维护的作品集 MVP，收益不足以抵消复杂度（违反"不做过度设计"护栏）。
- **方案 C 的权衡**：若洪兄团队更熟 Vue 可采纳，但 React 生态（Next.js 16 + Prisma + Lucide）在国内招聘/作品集展示场景中认知度更高，且本架构文档已按 React 栈写死接口契约，切换需重做 §5/§9。
- **方案 A 胜出**：单仓单语言（TypeScript 全栈）、单部署单元、SSR/ISR 原生 SEO、Route Handlers 即后端、Prisma 迁移友好、国内部署可备案。最符合 MVP"快、稳、合规"三目标。

---

## 3. 推荐方案分层架构（ASCII）

```
┌─────────────────────────────────────────────────────────────┐
│  访客浏览器（国内）                                            │
│  首页 / 作品列表·详情 / 博客列表·详情 / 关于 / 订阅·留言表单    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS（Caddy 自动证书 / 腾讯云 SSL）
┌───────────────────────────┴─────────────────────────────────┐
│  腾讯云轻量应用服务器 (Lighthouse, Docker Compose)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js 16 容器 (output: 'standalone', node:20)      │   │
│  │   ├─ App Router 页面 (SSR/SSG/ISR)                    │   │
│  │   ├─ Route Handlers  /api/* (作品/博客/订阅/留言)     │   │
│  │   ├─ 中间件 middleware.ts (鉴权守卫 /admin, /api/admin)│  │
│  │   └─ Server Actions (CMS 写操作，受 auth() 保护)      │   │
│  └───────────────┬──────────────────────┬───────────────┘   │
│                  │ Prisma Client         │ 签名上传/读取      │
│  ┌───────────────┴────────┐   ┌──────────┴──────────────┐  │
│  │  PostgreSQL 16 容器     │   │  腾讯云 COS (图床) + CDN  │  │
│  │  projects/blog_posts/   │   │  作品图/头像/博客配图     │  │
│  │  comments/subscriptions │   └───────────────────────────┘  │
│  │  /admin_users           │                                  │
│  └────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
        │ 每日 pg_dump → 归档至 COS（备份，保留 7 天）
        ▼
   百度搜索资源平台：sitemap.xml 主动推送 + 移动适配
```

**数据流要点**
- 展示前台读取：博客/作品详情走 `generateStaticParams` + ISR（构建期预渲染，命中 CDN，百度抓取快）；列表页 SSR。
- 写操作（CMS / 订阅 / 留言）：`POST /api/*` → Zod 校验 → Prisma 写入 → 返回统一 `{code,data,message}`。
- 鉴权：管理员登录 `POST /api/auth/login` 签发 access(15min)+refresh(7d) 双 httpOnly Cookie；`middleware.ts` 校验 access，过期则用 refresh 静默续期。

---

## 4. 版本锚定清单（存在性已核验，防幻觉依赖）

> 以下版本均来自官方源/文档核验（2026-10 时点）。落地时 `npm ci` 必须锁 `package-lock.json`，禁止 `latest` 漂移。

| 包 | 版本 | 作用 | 核验来源 |
|----|------|------|----------|
| `next` | `^16.2`（必须 ≥16.2.11 含 2026-07 安全补丁） | 框架 | nextjs.org blog（July 2026 Security Release 给出 16.2.11 Active LTS） |
| `react` / `react-dom` | `^19.2` | UI | Next 16 依赖 React 19.2 |
| `typescript` | `^5.6` | 类型 | 配合 Next 16 |
| `tailwindcss` | `^4` | 样式（CSS-first `@theme`） | Tailwind v4 已 GA |
| `prisma` / `@prisma/client` | `^7` | ORM（7.x 稳定，2025-11 GA；8 仍 RC 不采用） | prisma.io release-status |
| `@prisma/adapter-pg` | `^7` | PG 驱动适配（Prisma 7 默认 driver adapter） | prisma.io 类型安全对比（7.10.0 用 adapter-pg） |
| `pg` | `^8` | Node PostgreSQL 驱动 | npm |
| `zod` | `^3` | 请求/环境变量校验 | npm |
| `jose` | `^5` | JWT 签发/校验（Edge 兼容，Auth.js 内核同款） | authjs.dev / npm |
| `bcryptjs` | `^2.4` | 密码哈希（纯 JS，无原生编译，Docker/arm 友好） | npm |
| `lucide-react` | `^1.0`（当前 1.x，周期约 1.16） | **SVG 图标库（锁定）** | lucide.dev（v1 已达 1.0） |
| `cos-nodejs-sdk-v5` | `^2`（或 `@aws-sdk/client-s3@^3` S3 兼容） | COS 对象存储上传 | 腾讯云 / AWS SDK |
| `caddy` | `:2` | 反向代理 + 自动 HTTPS | caddyserver.com |
| `node` | `20` LTS（Docker `node:20-alpine`） | 运行时 | Next 16 需 Node ≥20 |

**依赖硬约束（来自 `generated-code-failure-modes`）：**
- 新增依赖必须能解析真实版本；`npm ci` 失败即门禁不过（拦截幻觉 import）。
- 禁止在代码中 `import` 任何未列入上表的包；图标**只允许** `lucide-react`，禁止任何 emoji 字符充当图标。
- Prisma 7 须显式使用 driver adapter（`@prisma/adapter-pg` + `pg`），否则连接池/Edge 行为不符预期。

---

## 5. 核心功能技术可行性验证

| 功能 | 可行性 | 实现路径 | 风险/注意 |
|------|--------|----------|-----------|
| CMS 作品/博客 CRUD | 可行 | `Server Actions` 或 `Route Handlers`（POST/PUT/PATCH/DELETE `/api/admin/*`）+ Prisma `upsert`/`delete`；列表用 `getMany` | 写操作全部经 `auth()` 守卫；软删除用 `deleted_at` |
| 访客订阅入库 | 可行 | `POST /api/subscribe` → Zod 校验 email → Prisma `subscriptions.upsert`（同邮箱不重复） | 需《个人信息保护法》明示同意 + 隐私政策链接（合规） |
| 访客留言入库 | 可行 | `POST /api/contact` → Zod 校验 name/email/message → `comments` 插入；后台列表可查看/标记已读 | 防垃圾：基础速率限制（每 IP 60s 1 次）+ 服务端校验，MVP 不做验证码（避免外部依赖） |
| 管理员认证与权限 | 可行 | `POST /api/auth/login`：bcryptjs 校验 → `jose` 签 access(15min)+refresh(7d) 双 httpOnly Cookie；`middleware.ts` 保护 `/admin`、`/api/admin/*` | refresh 轮转；服务端 `AUTH_SECRET` 强随机；登出双 Cookie 清除 |
| 国内搜索引擎 SEO | 可行 | Next.js `generateMetadata`（title/description/OG）+ `app/sitemap.ts` + `robots.ts` + JSON-LD 结构化数据；详情页 ISR | 必须 SSR/SSG（百度对纯 CSR 抓取差）；提交百度搜索资源平台 sitemap + 主动推送 |
| 图片图床稳定性 | 可行 | 作品图/头像上传至 COS（服务端签名直传或后端中转），URL 存库；COS + CDN 国内稳定 | 禁止把图塞 PostgreSQL；COS Bucket 私有 + CDN 回源，签名读 |

**结论：三条核心需求（展示前台 / CMS 后台 / 订阅留言）+ 管理员认证，在当前技术栈下 100% 可实现，无不可行项。**

---

## 6. 国内部署与合规（重点论证）

### 6.1 部署平台选择（关键：Vercel 不可用）

- **Vercel 已被排除**：官方明确"在中国大陆没有服务器或 CDN 节点，无法保证大陆内的可用性与性能"；`*.vercel.app` 默认域名遭 GFW DNS 污染直接超时，自定义域名 CNAME 中继方案（enhanced-FaaS-in-China）每 40 分钟刷新 IP、三大运营商表现不一，仅适合玩具项目，**不满足作品集求职/校园大使的生产级可用性与 SEO**。故否决 Vercel/Netlify 海外方案。
- **CloudBase 云托管（备选）**：官方文档确认 Next.js 14/15/16 为一等公民，原生支持 SSR/SSG/ISR/API Routes/Middleware，通过 `output:'standalone'` + 多阶段 Dockerfile 部署，镜像可落境内、域名可备案、与云数据库/对象存储内网互通。DX 略低于 Vercel，但合规可达。
- **腾讯云轻量应用服务器 Lighthouse（主推，成本最优）**：
  - 新用户价：2核2G ≈ ¥68–99/年；4核4G ≈ ¥88–109/年（2026 采购季实测）。
  - 单台跑 Docker Compose：Next.js + PostgreSQL + Caddy，全自管、国内节点、备案可达。
  - MVP 年成本 ≈ 服务器 ¥100 + COS ¥10–50 + 域名 ¥50–80 ≈ **¥160–240/年**（远低于 `development-costs` 隐性成本上限 ¥500/月，因新用户折扣）。

### 6.2 ICP 备案（强制，须尽早启动）

- 触发：域名解析到**中国大陆服务器**前必须 ICP 备案，否则无法开通访问。
- 流程：域名实名 → 准备云资源（Lighthouse/CloudBase）→ 腾讯云备案小程序填主体/服务信息 → 人脸核身 → 腾讯云初审(1–2 天) → 工信部短信核验(24h 内) → 管局审核(≤20 工作日，广东 8–15 工作日)。
- **行动建议**：备案与开发**并行启动**（开发第 1 周即提交备案），避免上线等备案 1–3 周空窗。个人备案一个订单最多 1 个网站。
- 公安联网备案：部分省份 ICP 通过后 30 日内需公安备案（ advisory，Phase 2 提醒）。

### 6.3 对象存储图床稳定性

- 腾讯云 COS 标准存储 + CDN：国内多节点、稳定、按量计费（轻量对象存储大陆 10GB 套餐 ≈ ¥9.9/年）。
- 上传：管理员在 CMS 上传图片 → 后端用 `AUTH_SECRET` + COS 临时密钥生成**签名直传 URL**（或后端中转写 COS），杜绝把图二进制写进 PostgreSQL（违反性能/容量纪律）。
- 读取：图片 URL 经 CDN 域名返回前端；Bucket 私有 + CDN 回源鉴权。

### 6.4 合规（来自 `generated-code-failure-modes` 系统上下文清单）

- 个人信息：订阅/留言收集 email/姓名 → 需隐私政策页 + 勾选明示同意（《个人信息保护法》第 13/17 条），否则为合规缺失。
- HTTPS 强制（Caddy 自动证书 / 腾讯云免费证书）。
- 后台 `/admin` 必须鉴权，禁止未授权访问写接口（缺失系统上下文 = 不合格）。

> 对 `mvp-stack.md` 的合规改写说明：原矩阵把内容平台推荐为 `Nuxt + FastAPI + PostgreSQL + MeiliSearch` 并隐含 Vercel 出海部署；本结论在**国内部署合规**约束下，将部署层改写为腾讯云（Lighthouse/CloudBase）并保留 PostgreSQL，搜索引擎改百度/必应而非仅 Google，属对知识库基线的必要覆盖，非冲突。

---

## 7. 数据库 Schema 初步设计（ER，MVP）

> 表名蛇形复数；每表含 `id`(UUID)、`created_at`、`updated_at`；软删除 `deleted_at`；外键显式。

```
admin_users(id, email UNIQUE, password_hash, name, created_at, updated_at)
projects(id, slug UNIQUE, title, summary, cover_image_url, gallery_urls jsonb,
         category, tags jsonb, content_md, year, role,
         material_source,                                              -- 素材来源说明（可空，游戏设计版权刚需）
         license_type[original/cc0/cc-by/commercial/client-owned/ai-assisted],  -- 可空
         attribution,                                                  -- 第三方素材署名（可空）
         client_auth_status[not-client/authorized/pending],           -- 可空
         created_at, updated_at, deleted_at)
blog_posts(id, slug UNIQUE, title, excerpt, cover_image_url, content_md,
           status[published/draft], published_at, created_at, updated_at, deleted_at)
comments(id, name, email, message, type[message/subscribe_note], read_at,
         consent_at,                                                  -- 明示同意时间(PIPL 留痕)，可空
         created_at, updated_at)            -- 留言（订阅另表，便于分别治理）
subscriptions(id, email UNIQUE, name, source, consent_at,             -- 明示同意时间(PIPL 留痕)，可空
              created_at, updated_at, unsubscribed_at)
```

- 索引：`projects.slug`、`blog_posts.slug`、`blog_posts.status+published_at`、`subscriptions.email`、`comments.read_at`。
- 图片 URL 存字符串（COS CDN 地址），`gallery_urls`/`tags` 用 `jsonb`（PostgreSQL 原生）。
- MVP 不建复合索引，查询慢再加（避免过早优化）。
- 新增可空字段 `material_source` / `license_type` / `attribution` / `client_auth_status`（projects）与 `consent_at`（subscriptions / comments）均为可空，MVP 阶段不建专用索引；后续按查询模式再加。

---

## 8. API 端点清单（初步，供 PM 写 OpenAPI 契约）

统一响应：`{ "code": 0, "data": {}, "message": "" }`（`code` 非 0 为错误码）。

| Method | Path | 鉴权 | 说明 |
|--------|------|------|------|
| POST | `/api/auth/login` | 否 | 管理员登录，签发 access+refresh 双 Cookie |
| POST | `/api/auth/logout` | 是 | 清除双 Cookie |
| POST | `/api/auth/refresh` | refresh Cookie | 静默续期 access |
| GET | `/api/projects` | 否 | 作品列表（分页 `?page&limit&category`） |
| GET | `/api/projects/:slug` | 否 | 作品详情 |
| POST | `/api/admin/projects` | 管理员 | 新建作品 |
| PUT | `/api/admin/projects/:id` | 管理员 | 更新作品 |
| DELETE | `/api/admin/projects/:id` | 管理员 | 软删除 |
| GET | `/api/posts` | 否 | 博客列表（仅 published） |
| GET | `/api/posts/:slug` | 否 | 博客详情 |
| POST/PUT/DELETE | `/api/admin/posts[/:id]` | 管理员 | 博客 CRUD |
| POST | `/api/subscribe` | 否 | 访客订阅（Zod 校验 email） |
| POST | `/api/contact` | 否 | 访客留言 |
| GET | `/api/admin/comments` | 管理员 | 留言/订阅后台查看 |

> 端点前缀含版本：MVP 单体用 `/api/*`（无多版本压力）；若后续拆微服务再上 `/api/v1`。

---

## 9. 锁定的 SVG 图标库（P0 硬规则落地）

- **库名：Lucide React**（https://lucide.dev），当前 1.x 稳定线。
- **安装依赖**：`npm install lucide-react`（锁定 `lucide-react@^1.0`）。
- **用法**：内联 SVG 组件，`<Camera />` 渲染 `<svg>`，`currentColor` 继承文字色，可用 `size`/`strokeWidth` 定制；tree-shakable 仅打包用到的图标。
- **主题化**：图标颜色**不写死**，由 Tailwind 令牌 / CSS 变量（`var(--color-fg)`）经 `currentColor` 控制，满足"禁止硬编码颜色"约束。
- **禁止项（违反即退回）**：
  - 禁止任何 emoji 字符（如游戏手柄 / 火箭 / 信封等 Unicode 符号）充当功能图标或装饰。
  - 禁止混用多套图标库（仅 `lucide-react` 一家）。
  - 禁止用 emoji 做导航/分类/状态指示。

---

## 10. 技术约束清单（P0 规则全量落地）

1. **图标**：仅 `lucide-react` SVG；禁止 emoji 图标。
2. **配色**：禁止硬编码颜色（唯一例外 `#fff`/`#000`）；所有颜色走 Tailwind `@theme` 令牌或 CSS 变量（如 `--color-bg`、`--color-fg`、`--color-accent`）；由 Designer 在 `globals.css` 定义令牌，前端仅引用令牌。
3. **渐变**：**禁止紫→粉渐变方案**；如需视觉层次用单色阶/中性色阶或品牌主色（取自洪兄个人标识，由 Designer 定，须为 CSS 变量）。
4. **占位文案**：禁止空洞占位（如"暂无内容"须给出引导动作；Loading 须有真实骨架屏而非转圈占位）。
5. **认证**：所有 `/admin`、`/api/admin/*` 必须鉴权；未登录访问返回 401/重定向登录。
6. **依赖**：`package-lock.json` 锁定；`npm ci` + `tsc --noEmit` + `next lint` 为 CI 门禁，拦截幻觉依赖与静默缺失 import。
7. **数据**：图片走 COS，不进 PostgreSQL；写接口 Zod 校验；分页必带 `limit`（默认 20，上限 50）。
8. **合规**：HTTPS 强制；订阅/留言须隐私政策 + 明示同意；上线前完成 ICP 备案。

---

## 11. 不可行 / 高风险警告

- **备案时间窗（高风险）**：未备案域名无法解析到国内服务器，须开发启动即并行备案，否则上线延迟 1–3 周。→ 已列入 §6.2 行动建议。
- **Vercel 国内不可用（已规避）**：勿因 DX 便利回退至 Vercel，会直接破坏国内访问与百度 SEO。
- **Prisma 7 driver adapter 写法变更（中风险）**：7.x 默认走 `@prisma/adapter-pg`，旧 `prisma@6` 直连写法不兼容；须按 7.x 文档写 `prisma/client` 扩展 adapter，否则运行时连接失败（已写入 §4 硬约束）。
- **COS 跨域（中风险）**：若采用浏览器直传，须配置 Bucket CORS 白名单（仅放生产域名），否则上传被拦。
- **百度抓取纯 CSR 差（中风险）**：详情/列表页必须 SSR/ISR，不可用纯客户端渲染。

---

## 12. 明确不做（out-of-scope，防镀金 / 范围蔓延）

- 不做多用户/多角色 RBAC（仅单一管理员，JWT 足够）。
- 不做评论公开展示与盖楼（留言仅入库后台查看，MVP 不前台渲染互动）。
- 不做全文搜索引擎（MeiliSearch/ES）：MVP 用 PostgreSQL `ILIKE`/列表筛选，数据量 < 1 万条足够。
- 不做国际化/多语言（中文国内受众）。
- 不做支付/电商/会员体系。
- 不做 CMS 富文本可视化编辑器（MVP 用 Markdown 文本域 + 预览，降低复杂度）。
- 不做第三方 OAuth 登录（仅邮箱+密码管理员凭证）。

---

## 13. 已知坑（内嵌为硬约束，来自 `generated-code-failure-modes`）

1. **沉默逻辑错误高发区**：分页 off-by-one、时区（`published_at` 须 `timestamptz` 存 UTC，展示转东八区）、订阅同邮箱重复插入（用 `upsert`）、权限取反（中间件 `await auth()` 未登录须 401 而非放行）。
2. **幻觉依赖**：`lucide-react` 图标名以官方为准（如 `Github` 已改名 `Github` 不变，但 `Grid`→`LayoutGrid`、`Tool`→`Wrench` 等历史改名须核对），禁止凭记忆拼写。
3. **N+1 查询**：作品列表带分类/标签时，用 Prisma `include` 一次性取，避免循环查库。
4. **next/image 自托管**：若选 CloudBase 云函数部署须 `images.unoptimized:true`（见官方文档坑）；Lighthouse Docker 部署可保留默认优化（需 `.next/static` 正确 COPY）。
5. **standalone 漏 COPY**：Dockerfile 必须 COPY `.next/static` 与 `public/`，否则 CSS/图片 404（CloudBase 官方文档明确标注为最常见疏漏）。
6. **NEXT_PUBLIC_* 是构建期注入**：改环境变量须重新 build，不能靠重启服务生效；secret 绝不进 `NEXT_PUBLIC_`。

---

## 14. 端到端验证步骤（收尾即验收）

1. **本地**：`npm ci && npx prisma migrate dev && npm run dev` → 访问 `http://localhost:3000`，首页/作品列表/博客列表/关于页正常渲染（确认是 SSR/SSG，非白屏 CSR）。
2. **订阅/留言**：前台提交订阅与留言 → 查 PostgreSQL `subscriptions`/`comments` 表确认入库；重复同邮箱订阅不新增行（upsert 验证）。
3. **管理员认证**：`POST /api/auth/login` 正确凭证 → 拿到 access+refresh 双 Cookie；访问 `/admin` 正常；错误凭证 → 401；`/api/admin/projects` 未带 Cookie → 401。
4. **CMS 写**：登录后 `POST /api/admin/projects` 建作品 → 前台作品列表/详情出现；`DELETE` 后软删除生效（列表不显）。
5. **SEO**：`/sitemap.xml`、`/robots.txt` 可访问；`view-source` 详情页含 `<title>`/`<meta description>`/JSON-LD。
6. **部署**：`docker compose up` 于 Lighthouse → 绑定已备案域名 + HTTPS → 国内手机网络（电信/联通/移动）打开正常；`curl` 百度 UA 抓取详情页返回 200 且含正文。
7. **图标约束核验**：全局 grep 确认无 emoji 字符作图标、仅 `lucide-react` import、无硬编码 hex（除 `#fff`/`#000`）、无紫粉渐变。

---

## 15. ADR 摘要（选型决策记录，落地时写入 `docs/decisions/`）

- **ADR-001**：采用 Next.js 16 全栈单体（而非前后端分离 / Nuxt）。理由：单仓单语言、单部署、SSR/ISR 原生 SEO、国内部署可备案。后果：+运维简单 / -无独立后端服务伸缩性（MVP 不需要）。
- **ADR-002**：部署落腾讯云（Lighthouse Docker 主推，CloudBase 云托管备选），否决 Vercel。理由：Vercel 无大陆节点破坏国内访问与 SEO。后果：+合规可达、成本低 / -DX 略低于 Vercel。
- **ADR-003**：自建 JWT 认证（jose+bcryptjs，access15min+refresh7d），而非 Auth.js v5。理由：精确匹配规范、无 beta 歧义、无 Edge 配置拆分负担。后果：+可控 / -需自写续期与登出逻辑。
- **ADR-004**：图标锁定 Lucide React（SVG），禁 emoji。理由：P0 规则；SVG 可主题化、tree-shakable。后果：+统一视觉 / -不可用 emoji 快速占位。
- **ADR-005**：数据库 PostgreSQL + Prisma 7（driver adapter），图床走 COS。理由：关系型契合内容站；COS 国内稳定。后果：+数据一致 / -需自管 PG 备份（已规划 pg_dump→COS）。

---

> 本文件为可寻址交付产物（活规格）：实现中发现冲突须**先改本文件再改代码**，决策留痕于 §15。
