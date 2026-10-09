# 洪兄个人作品集全站 — UI/UX 设计方向（Phase 1 调研）

> 设计师：颜好看（UI/UX）｜日期：2026-10-09｜阶段：Phase 1 调研 / 设计方向
> 目标受众：澳门科技大学互动媒体艺术·游戏设计方向研究生（洪兄），中文国内受众
> 三大目标：毕业设计展示 / 校园大使 / 求职
> 设计基调：专业、克制、有设计感；面向游戏设计 / 互动媒体艺术，但必须商业级、可落地

---

## 一、联网调研摘要（真实站点 / 设计系统）

本轮调研覆盖 **游戏/数字艺术作品集平台、极简编辑风作品集、Awwwards 实验性作品集、2025–2026 网页设计趋势、SVG 图标库对比** 五类，共检索并阅读 14+ 来源，关键结论：

### 1.1 游戏 / 数字艺术作品集最佳实践（ArtStation / Behance / Juego Studios / Careerz Group）
- **作品优先**：首页只放 5 件最强作品，按实力排序而非时间；"如果访客只看一样，必须是你最好的"。
- **一致缩略图尺寸** 建立信任与专业感（"图像呈现的一致性建立信任"）。
- **项目页信息架构**：标题 + 简述 + 你的角色（团队项目必须标明个人贡献）+ 工具/技术 + 过程/迭代（sketch→blockout→final），案例用 **结果→目标→解决** 叙事。
- **移动优先**：招聘方大量在手机上浏览，响应式 + 无横向滚动是硬要求。
- **自有域名站 + 平台页互补**：自有站控制叙事与品牌，ArtStation/Behance 作行业曝光补充。

### 1.2 2025–2026 极简设计趋势（Perspecta / Webview / Enovtec / DigitalStudio / PixelGuest）
- **留白即叙事**：负空间引导视线、制造高级感，不是"空"。
- **排版即主角**：粗体大字号标题承担视觉重心（与图片/重动效剥离）。
- **中性色但有性格**：沙/石/鼠尾草/赤陶等暖中性 + 单个克制强调色（≤2 处/屏）。
- **微交互克制使用**：hover 变色、滚动淡入、图标过渡——增强人性但不喧嚣。
- **非对称 / 破网格**：有意不对称 + 错落卡片，比死板九宫格更有设计感（需保持潜在逻辑）。
- **暗色极简兴起**：暗背景让彩色作品"像画廊里的画一样跳出来"（重点参考点）。

### 1.3 具体作品集案例（DIOR / Bruno Simon / Hugo Dsgn / CUSP / Griflan）
- **DIOR 极简杂志风**：米白+黑+少量红，错落卡片而非九宫格 → "高级感来自克制，不是堆砌"。
- **Bruno Simon（创意开发）**：作品集本身就是作品，第一眼就呈现核心能力（3D 交互）。启发：**首页用真实作品预览代替口号大图**。
- **Hugo Dsgn（Plainthing）**：有趣排版 + 结构化网格 + 清晰案例叙事 → 个性与精致的平衡。
- **CUSP（Awwwards 2026 SOTD）**：实验性导航 + 意料之外的色彩组合 + 滚动触发动画，"大胆选择需完美执行"。

### 1.4 SVG 图标库对比（Lucide / Tabler / Heroicons / Phosphor / Iconify）
- **Lucide**：ISC 许可、24px 网格、2px 描边、圆角端点；shadcn/ui / Vercel / 现代 AI 工具默认图标集；视觉一致性最强（单一风格）。最契合"克制、干净、现代"的消费品/极简 UI。
- **Tabler**：5900+ 图标、更锐利、有 filled 变体、覆盖深；偏技术/后台密集界面。
- **结论**：本站调性为"专业克制 + 设计感 + 极简"，**锁定 Lucide**（与 shadcn/ui 默认一致，便于架构栈落地），尺寸 16/20/24px 全项目统一。

---

## 二、对标品牌 / 设计语言（3 个主对标 + 1 个系统参考）

| 对标 | 类型 | 借鉴点（落地到本站） |
|------|------|----------------------|
| **DIOR 极简杂志风** | 奢侈品牌官网 | 大量留白、克制配色、错落卡片（非九宫格）、"高级感来自克制"。→ 首页作品区的呼吸感与排版秩序 |
| **ArtStation / Behance** | 游戏/数字艺术平台 | 作品优先（最强 5 件）、一致缩略图尺寸、项目页含 role/tools/process、移动优先。→ 作品列表与详情信息架构 |
| **Awwwards 实验性作品集（CUSP / Hugo Dsgn）** | 获奖个人站 | 第一眼呈现核心能力、结构化网格+有趣排版、克制微交互。→ 首页非对称 Hero 用真实作品预览，而非模板式大图/口号 |
| **shadcn/ui + Lucide**（系统参考） | 设计系统 | 干净的组件语言、可访问性基线、Token 化。→ 全站组件一致性与无障碍基础 |

**不直接照搬的反模式**：紫色→粉色渐变发光模板、emoji 图标、千篇一律"大标题+副标题+居中 CTA+抽象 3D"Hero、奶油/米色背景默认化。

---

## 三、设计方向

### 3.1 设计寄存器与三轴刻度
- **寄存器**：公共前台 = **Brand 寄存器**（设计即产品，求独特性）；CMS 后台 = **Product 寄存器**（求熟悉感/效率，Linear 式克制）。
- **三轴刻度**（默认，可微调）：
  - `DESIGN_VARIANCE = 6`（偏移：左对齐标题 + 非对称作品网格，移动端回退单列）
  - `MOTION_INTENSITY = 4`（克制：仅 hover/active/滚动淡入，无装饰性动画）
  - `VISUAL_DENSITY = 4`（日常应用模式：标准间距，画廊呼吸感）

### 3.2 配色基调（Light 为主，Gallery 暗舞台为辅）

**主色板 — "Gallery Paper"（浅色，默认主题）**

> 命名遵循 Tailwind v4 `@theme` 约定（`--color-*` → 自动生成 `bg-*`/`text-*`/`border-*` 工具类），与架构师 §10 约束一致；图标颜色经 `currentColor` 继承令牌，全站零硬编码色（唯一例外 `#fff`/`#000`）。**不使用任何渐变**——视觉层次靠中性色阶 + 单一品牌主色实现，规避紫→粉渐变套路。

| Token（CSS 变量） | 生成工具类 | 值 | 角色 |
|-------------------|-----------|-----|------|
| `--color-bg` | `bg-bg` | `#FCFCFD` | 页面背景（近白中性，**非奶油**，避 denylist） |
| `--color-surface` | `bg-surface` | `#FFFFFF` | 卡片/容器 |
| `--color-surface-warm` | `bg-surface-warm` | `#F4F4F5` | 三级表面/分区块 |
| `--color-fg` | `text-fg` | `#18181B` | 主文本（近黑墨色） |
| `--color-fg-2` | `text-fg-2` | `#3F3F46` | 次级文本 |
| `--color-muted` | `text-muted` | `#71717A` | 辅助文本 |
| `--color-meta` | `text-meta` | `#A1A1AA` | 元数据/三级前景 |
| `--color-border` | `border-border` | `#E4E4E7` | 默认边框 |
| `--color-border-soft` | `border-border-soft` | `#F4F4F5` | 内部行分隔 |
| `--color-accent` | `bg-accent`/`text-accent` | `#2B4ACB` | **品牌主色（深钴蓝，非 indigo-500、非紫粉）** |
| `--color-accent-hover` | `bg-accent-hover` | `#213AA6` | 悬停 |
| `--color-accent-active` | `bg-accent-active` | `#1A2F85` | 激活 |
| `--color-accent-on` | `text-accent-on` | `#FFFFFF` | accent 上前景 |

**语义色（A2）**
| Token | 值 | 角色 |
|-------|-----|------|
| `--color-success` | `#16A34A` | 成功 / 已发布 |
| `--color-warn` | `#D97706` | 警告 / 草稿待审 |
| `--color-danger` | `#DC2626` | 错误 / 删除 |

**Gallery 暗舞台（C-extension 组件级令牌，仅作品详情页图片展台，非全站暗主题）**
| Token | 值 | 角色 |
|-------|-----|------|
| `--color-stage` | `#0B0B0C` | 近黑展台背景，框住艺术图 |
| `--color-stage-fg` | `#F4F4F5` | 展台上前景 / 说明文字 |

- 用途：作品详情页用近黑展台框住艺术图，让彩色作品"像画廊里的画一样跳出来"，是**有功能目的**的局部暗色，不是 AI 模板式全站暗模式。

**配色纪律**
- 中性色占 70–90%，强调色 ≤10% 且**每屏 ≤2 处可见使用**（仅 CTA、选中 Tab、关键数据）。
- 标题用深色中性（`--color-fg`），不用 accent。
- 温暖感由强调色 + 排版 + 真实作品图传达，**不靠背景色**（规避奶油背景 denylist）。
- **禁用任何渐变**；层次仅靠中性色阶与单一品牌主色 `--color-accent` 实现。

#### 3.2.1 `globals.css` @theme 落地片段（供架构师代码层强制约束）
```css
/* app/globals.css — Tailwind v4 @theme（设计令牌，唯一颜色真相源） */
@import "tailwindcss";

@theme {
  /* 中性色（A1-identity） */
  --color-bg: #FCFCFD;
  --color-surface: #FFFFFF;
  --color-surface-warm: #F4F4F5;
  --color-fg: #18181B;
  --color-fg-2: #3F3F46;
  --color-muted: #71717A;
  --color-meta: #A1A1AA;
  --color-border: #E4E4E7;
  --color-border-soft: #F4F4F5;

  /* 品牌主色（A1-identity） */
  --color-accent: #2B4ACB;
  --color-accent-hover: #213AA6;
  --color-accent-active: #1A2F85;
  --color-accent-on: #FFFFFF;

  /* 语义色（A2） */
  --color-success: #16A34A;
  --color-warn: #D97706;
  --color-danger: #DC2626;

  /* 暗舞台（C-extension，组件级） */
  --color-stage: #0B0B0C;
  --color-stage-fg: #F4F4F5;

  /* 字体（A1-identity；由 next/font 变量组合，详见 §3.3.1） */
  --font-display: var(--font-bricolage), var(--font-noto), sans-serif;
  --font-body: var(--font-inter), var(--font-noto), sans-serif;
  --font-mono: var(--font-jetbrains), var(--font-noto), monospace;

  /* 圆角 / 动效（A2，种子值，Phase 2 终定） */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 9999px;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion-fast: 150ms;
  --motion-base: 200ms;
}

/* 图标：经 currentColor 继承令牌，禁止写死 */
/* 例：<Camera className="text-fg" /> / <Camera className="text-muted" /> / <Camera className="text-accent" /> */
```
> 注：间距（4px 网格）、阴影层级、完整字阶/字距将在 Phase 2 `DESIGN.md` + `design-tokens.json` 终定；此处 @theme 已给出颜色与字体的强制基线，足够代码层先行约束。

### 3.3 字体方案

| 角色 | 字体 | 说明 |
|------|------|------|
| `--font-display` | **Bricolage Grotesque** + Noto Sans SC | 标题：有性格的编辑感无衬线，避开 Inter/Fraunces 等 monoculture 默认 |
| `--font-body` | **Inter** + Noto Sans SC | 正文：干净专业（Inter 仅作正文，不作"高级"展示体） |
| `--font-mono` | **JetBrains Mono** + Noto Sans SC | 元数据/标签/角色/工具/年份：暗示互动媒体·开发气质 |

**字体加载与 SEO（对接架构师 §6.3 / §11 百度约束，重要）**
- **Latin 三件套（Bricolage Grotesque / Inter / JetBrains Mono）**：在 Next.js 16 中用 `next/font/google` **自托管**，消除布局抖动（CLS=0）、不阻塞渲染，利好 Core Web Vitals（百度对 TTFB/CLS 敏感）。`next/font` 自动注入 CSS 变量并生成 `variable`，`<html>` 挂上即可。
  ```ts
  // app/fonts.ts（示例；variable 名须与 globals.css 的 --font-* 组合一致）
  import { Bricolage_Grotesque, Inter, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
  export const fBricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-bricolage", display: "swap" });
  export const fInter     = Inter({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-inter", display: "swap" });
  export const fJetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-jetbrains", display: "swap" });
  export const fNoto      = Noto_Sans_SC({ subsets: ["latin"], weight: ["400","500","700"], variable: "--font-noto", display: "swap" });
  ```
  > 组件只引用 `--font-display` / `--font-body` / `--font-mono` 令牌，不写字体名。`globals.css` 的 `--font-*` 由上方 `var(--font-…)` 组合（见 §3.2.1），实现"无布局抖动的字体令牌"。
- **Noto Sans SC 体量极大**：限定 `weight: ["400","500","700"]` 子集 + `display: "swap"`，防止首屏包体爆炸拖累 SEO；若仍偏重，中文可改走 CDN 异步子集，西文/数字仍自托管。
- **非 Next 上下文回退**：若某页面不走 Next 构建，可用下方 Google Fonts `@import`（仅兜底，生产优先 `next/font`）。

**Google Fonts @import（兜底，非 Next 场景）**
```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;700&display=swap');
```

**排版精规**
- 字重三级：400 正文 / 510 次标题 / 590 主标题。
- 字距：ALL CAPS ≥ 0.06em；标题负字距 -0.02em～-0.01em；正文 0。
- 字号阶梯：xs12 / sm14 / base16 / lg18 / xl20 / 2xl24 / 3xl32 / 4xl40（px）。
- 中文正文 16px / 行高 1.7；西文正文 16px / 行高 1.6。

### 3.4 风格方向（布局 / 栅格 / 留白 / 层次 / 动效）

- **首页 Hero（反模板）**：不做"大标题+副标题+居中 CTA+抽象 3D"。改为**左对齐身份陈述（姓名/方向/一句话定位，用 Bricolage 大字号）+ 右侧/下方真实精选作品预览网格（3–5 件最强）**，第一眼即呈现核心能力。
- **布局**：12 列栅格（gap 24px），桌面 max-w 1200px；有意非对称（标题左对齐、作品错落尺寸 4:3 与 16:9 混排），移动端 <768px 回退单列。
- **留白**：节区节奏 桌面 80 / 平板 48 / 手机 32px；作品区大留白建立画廊感。
- **层次**：中性色打底，accent 仅点睛；作品缩略图一致尺寸 + 轻微 hover 抬升（translateY -2px + 边框转 accent）建立信任。
- **动效**（MOTION=4，克制）：hover 变色/抬升 150ms、滚动淡入 200–300ms、焦点环可见；**必须支持 `prefers-reduced-motion`**；禁止弹跳缓动、禁止 >1s 动画。
- **作品详情页**：顶部近黑展台框主图（Gallery 暗舞台），下方结构化信息（角色/工具/年份/过程迭代图），案例用"结果→目标→解决"叙事。

### 3.5 图标系统（[锁] 已与架构师锁定）

- **库：Lucide React（`lucide-react@^1.0`，ISC 许可）** — 架构师 §9 已锁定，全站只此一家；内联 SVG、`currentColor` 主题化、tree-shakable。24px 网格、2px 描边、圆角端点，视觉一致性最强。
- **尺寸**：16px（行内）/ 20px（按钮内）/ 24px（独立图标）全项目统一。
- **禁用**：任何 emoji 字符充当功能图标/装饰/状态指示；混用多套图标库。
- **主题化**：图标颜色经 `currentColor` 继承令牌（如 `text-fg` / `text-muted` / `text-accent`），不写死。
- **可访问性**：装饰图标加 `aria-hidden="true"`；图标按钮必须有 `aria-label`。

### 3.6 图片与素材规范（P0 #6 硬约束）

- **所有展示图必须为洪兄本人真实作品**（游戏美术/互动媒体项目），**注明作品名 + 作者 ID（洪兄）**；**禁止 AI 生成原创图**冒充作品。
- **稳定来源**：图片随项目仓库打包（/public/works/...）或对象存储，**禁止图床外链**（会失效）。CMS 上传即落本地/存储。
- **占位策略（MVP 期）**：用洪兄真实作品缩略图；若暂缺，使用**带清晰标注的占位框（作品名+尺寸+©洪兄）**，绝不用 Lorem/抽象图充数。
- 缩略图统一比例（4:3）与懒加载 + 渐显；WebP/AVIF 格式。

---

## 四、P0 绝对规则自检

| # | 规则 | 本方案处置 |
|---|------|-----------|
| 1 | 禁 emoji 功能图标 | [通过] 锁定 Lucide SVG，16/20/24px 统一 |
| 2 | 禁紫→粉渐变主视觉 | [通过] accent = 深钴蓝 #2B4ACB，无紫粉渐变/发光/毛玻璃套路 |
| 3 | 禁空洞占位文案 | [通过] 用真实身份/作品信息，禁 "Welcome to"/"Lorem" |
| 4 | 禁硬编码颜色 | [通过] 全部经 Design Token 引用（除 #fff/#000） |
| 5 | 禁千篇一律 Hero | [通过] 首页用真实精选作品预览 + 左对齐身份陈述，非模板大图 |
| 6 | 图片真实+标注作者+稳定源 | [通过] 洪兄真实作品 + 作者 ID + 仓库/存储，禁图床外链/AI 原创图 |

---

## 五、与架构师对齐结论（Phase 1 → Phase 2 衔接，已全部确认）

1. **图标库锁定 [通过]**：Lucide React（`lucide-react@^1.0`）。架构师 §9 已锁定，与本站一致；全站仅此一家，禁 emoji。
2. **技术栈锁定 [通过]**：Next.js 16（App Router）+ Tailwind CSS v4（`@theme` CSS-first）+ Prisma 7 + PostgreSQL 16 + 自建 JWT；部署腾讯云 Lighthouse/CloudBase。Token 已映射为 `@theme` CSS 变量（§3.2.1），前端仅引用令牌。
3. **暗舞台范围 [通过]**：仅作品详情页用 Gallery 暗舞台（`--color-stage`/`--color-stage-fg`），不做全站暗主题，规避 AI 暗模板。
4. **P0 硬约束已并入设计系统**：禁硬编码色（例外 `#fff`/`#000`）、禁紫→粉渐变（本站零渐变，层次靠中性色阶 + 单一品牌主色）、禁空洞占位（加载用真实骨架屏、空状态给引导动作）。

> 下一步（Phase 2）：产出完整 `DESIGN.md`（9 节）+ `design-tokens.json` + `design-tokens.css` + Tailwind config，并将 §3.2.1 的 @theme 基线扩展为完整令牌（间距/阴影/字阶/字距/动效）。

---

> 下一步（Phase 2）：基于本方向与架构师锁定栈，产出完整 `DESIGN.md`（9 节）+ `design-tokens.json` + `design-tokens.css` + Tailwind config。
