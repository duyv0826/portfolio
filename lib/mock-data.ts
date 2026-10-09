import type { ProjectDetail, PostDetail, CommentListItem, SubscriptionListItem } from "./types";

/**
 * 本地开发数据源。
 *
 * 存在性理由：本机无 PostgreSQL 实例时，`npm run dev` / `npm run build` 仍需可运行、可评审。
 * DATABASE_URL 一旦配置，仓储层自动切到 Prisma 实现（见 lib/repo.ts）。
 *
 * P0 纪律：
 * - 内容为洪兄真实项目与方向，禁止 Lorem / "Welcome to" 式占位。
 * - 封面为仓库内自托管占位图（public/works/*.svg），禁图床外链、禁 AI 原创图冒充作品。
 */

const now = "2026-10-09T00:00:00.000Z";

export const mockProjects: ProjectDetail[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "the-room-of-choice",
    title: "抉择的房间",
    summary:
      "浏览器叙事游戏：以选择树驱动分支剧情，全部章节与结局通过纯配置扩展，引擎层对故事节点完全无知。",
    cover_image_url: "/works/cover-room-of-choice.svg",
    gallery_urls: [
      "/works/cover-room-of-choice.svg",
      "/works/cover-scavenger.svg",
      "/works/cover-aoli.svg",
    ],
    category: "游戏美术",
    tags: ["互动叙事", "分支结构", "TypeScript"],
    year: 2026,
    role: "独立开发 · 叙事设计 / 程序",
    material_source: "自绘与授权素材，见文末署名",
    license_type: "original",
    attribution: "占位封面为本地矢量版式框架，非成品美术",
    client_auth_status: "not-client",
    created_at: now,
    updated_at: now,
    content_md: `## 目标

把一个"叙事驱动的分支结构"做成可长期扩展的作品，而不是一次性写完就锁死的 Demo。

## 结果

引擎层 \`engine.js\` 对任何故事节点 ID 完全无知——新增章节、新增结局只需要改 \`config.js\`，不碰一行引擎代码。回归测试常绿的前提下，剧情树可以被反复追加。

## 解决

- **内容即配置**：章节、节点、分支、结局全部落在 \`config.js\`，引擎只负责读取与状态推进。
- **零耦合校验**：每次配置变更逐节点验证，并对内联 JS 跑语法校验，避免批量编辑静默丢失。
- **增量扩展**：每轮迭代只从"更深分支 / 更多章节 / 拓宽节点"里选一条推进，不并行改多件事。

> 团队项目必标个人贡献：本项目为独立完成，叙事设计、程序实现、UI 均为本人负责。`,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "stellar-scavenger",
    title: "星际拾荒者",
    summary:
      "Godot 接物类小游戏，围绕「拾取—负重—取舍」做核心循环，多轮迭代打磨手感与可玩性。",
    cover_image_url: "/works/cover-scavenger.svg",
    gallery_urls: ["/works/cover-scavenger.svg", "/works/cover-room-of-choice.svg"],
    category: "游戏美术",
    tags: ["Godot", "GDScript", "玩法迭代"],
    year: 2026,
    role: "独立开发 · 玩法设计 / 程序",
    material_source: "AI 占位贴图（后续替换为真实画师作品）",
    license_type: "ai-assisted",
    attribution: "占位贴图：AI 生成，正式版替换为画师作品",
    client_auth_status: "not-client",
    created_at: now,
    updated_at: now,
    content_md: `## 目标

做一个"接住 / 拾取"动作本身就有乐趣的小体量作品，而不是靠数值堆砌时长。

## 结果

核心循环收敛为「拾取 — 负重 — 取舍」：拾得越多移动越慢，玩家被迫主动放弃低价值目标，形成节奏起伏。

## 解决

- **负重即难度**：把资源管理与操作手感绑在同一个变量上，避免外挂难度曲线。
- **占位先行**：美术先用 AI 占位贴图把玩法跑通，确认手感后再替换为真实画师作品。
- **多轮迭代**：每轮只挑一个维度（趣味性 / 美观度 / 可玩性）深挖。`,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "aoli-lightscape",
    title: "澳里·光景",
    summary: "Unity 场景叙事项目，以光线与时间为线索组织空间体验。",
    cover_image_url: "/works/cover-aoli.svg",
    gallery_urls: ["/works/cover-aoli.svg"],
    category: "互动装置",
    tags: ["Unity", "场景叙事", "光照"],
    year: 2026,
    role: "独立开发 · 场景与交互",
    material_source: "原创场景搭建",
    license_type: "original",
    attribution: "自绘与授权素材",
    client_auth_status: "not-client",
    created_at: now,
    updated_at: now,
    content_md: `## 目标

让"光"成为叙事主语：玩家不是在看场景，而是在经历一天里光线的变化。

## 结果

空间被编排成若干时段切片，玩家移动时不只在换位置，也在换时间。

## 解决

- **时间驱动布光**：把光照参数与叙事进度绑定，而非静态烘焙。
- **留白优先**：场景密度刻意压低，把注意力留给光本身。`,
  },
];

export const mockPosts: PostDetail[] = [
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "config-driven-narrative-engine",
    title: "把叙事引擎写成对故事无感的机器",
    excerpt:
      "做《抉择的房间》时定下的一条硬约束：引擎层不允许出现任何故事节点 ID。它带来的收益远超当初预期。",
    cover_image_url: null,
    tags: ["游戏设计", "架构"],
    status: "published",
    published_at: "2026-09-28T00:00:00.000Z",
    created_at: now,
    updated_at: now,
    content_md: `分支叙事最容易踩的坑，是引擎和内容互相渗透：写着写着，\`engine.js\` 里出现了 \`if (node === 'ch3_bad_end')\` 这种代码。第一次很省事，第三次就没人敢动剧情了。

## 硬约束

\`\`\`text
config.js  = 内容（章节 / 节点 / 分支 / 结局）
engine.js  = 机制（读取 / 推进 / 存档）
engine.js 内禁止出现任何故事节点 ID
\`\`\`

## 收益

第一，**扩展不恐惧**。加一章不需要读懂引擎，只需要按格式写配置。

第二，**回归有基线**。引擎无感知，意味着测试可以只覆盖机制本身，剧情改动不触碰测试。

第三，**协作可扩展**。真要找人写剧情时，对方不需要碰代码。

## 代价

配置格式要一开始就设计得够用，中途改格式比改代码更痛。所以宁可前期多花半天定类型，也别边写边补。`,
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "ai-placeholder-art-workflow",
    title: "先用 AI 占位图，再用真人画作：一条务实的美术流程",
    excerpt:
      "在《星际拾荒者》里我明确不把 AI 生成图当成品。占位图是脚手架，不是交付物。",
    cover_image_url: null,
    tags: ["美术流程", "Godot"],
    status: "published",
    published_at: "2026-10-02T00:00:00.000Z",
    created_at: now,
    updated_at: now,
    content_md: `我对 AI 生成图的态度很直接：**可以占位，不能冒充**。

## 为什么还要用

玩法验证阶段，美术是最后一个变量。如果先花三周画图再发现手感不对，成本全沉没。用占位图把循环跑通，是更便宜的顺序。

## 边界在哪

- 占位图不进正式包。
- 作品集里如果出现 AI 图，必须显式标注 \`ai-assisted\`，这是我在数据结构里直接做成了字段的原因。
- 最终视觉目标是真实画师作品，占位只是时间差。

## 落地方式

数据结构那一层先留出位置：\`material_source\`、\`license_type\`、\`attribution\`、\`client_auth_status\` 四个字段，让"这张图从哪来、能不能用、要不要署名"在系统里就有答案，而不是靠记忆。`,
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "on-portfolio-site-decisions",
    title: "自建作品集站点：三个绕不开的现实约束",
    excerpt: "备案、SEO、图床。决定技术栈的从来不是喜好，是这三件事。",
    cover_image_url: null,
    tags: ["Web", "备案"],
    status: "draft",
    published_at: null,
    created_at: now,
    updated_at: now,
    content_md: `（草稿整理中）

国内做个人站，选型其实是被三个约束反推出来的：域名必须能备案、页面必须能被百度抓、图片必须有稳定源。任何一条不满足，站点就只能存在于自己的浏览器里。`,
  },
];

export const mockComments: CommentListItem[] = [
  {
    id: "77777777-7777-4777-8777-777777777777",
    name: "示例访客",
    email: "visitor@example.com",
    message: "《抉择的房间》的配置驱动思路很有参考价值，想请教分支数据结构怎么设计的。",
    type: "message",
    read_at: null,
    consent_at: now,
    created_at: now,
    updated_at: now,
  },
];

export const mockSubscriptions: SubscriptionListItem[] = [
  {
    id: "88888888-8888-4888-8888-888888888888",
    email: "reader@example.com",
    name: null,
    source: "首页",
    consent_at: now,
    created_at: now,
    updated_at: now,
    unsubscribed_at: null,
  },
];
