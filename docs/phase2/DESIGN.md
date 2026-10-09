# 洪兄个人作品集全站 — DESIGN.md（Phase 2 设计系统）

> 设计师：颜好看（UI/UX）｜日期：2026-10-09｜阶段：Phase 2 设计细化／落地设计系统
> 基于：PRD + `docs/phase1/uiux.md`（设计方向已收口）+ 架构师锁定栈 Next.js 16 / Tailwind v4 `@theme` / Lucide React
> 三轴刻度：DESIGN_VARIANCE = 6（偏移）／ MOTION_INTENSITY = 4（克制）／ VISUAL_DENSITY = 4（日常应用）
> 寄存器：公共前台 = **Brand**（求独特性）／ CMS 后台 = **Product**（求熟悉感，Linear 式克制）

---

## 1. Visual Theme & Atmosphere（视觉主题与氛围）

- **主题关键词**（5 个）：克制、画廊感、编辑秩序、互动媒体气质、专业可信
- **氛围描述**：浅色"Gallery Paper"为主，大面积近白中性背景让真实作品像画廊里的画一样跳出来；排版承担视觉重心（Bricolage Grotesque 大字号标题），单一深钴蓝强调色点睛；作品详情页用近黑"Gallery Stage"框住主图。整体不是"AI 模板感"，而是有性格的编辑式极简。
- **对标品牌**（3 个）：DIOR 极简杂志风（留白与克制配色）、ArtStation / Behance（作品优先的信息架构）、shadcn/ui + Lucide（干净组件语言与无障碍基线）。实验性参考：Awwwards 作品集（CUSP / Hugo Dsgn）的非对称网格与克制微交互。
- **不使用任何渐变**：视觉层次仅靠中性色阶 + 单一品牌主色 `--color-accent` 实现，从根上规避紫→粉渐变发光套路。

---

## 2. Color Palette & Roles（色彩与角色）

> 命名遵循 Tailwind v4 `@theme` 约定（`--color-*` → 自动生成 `bg-*`/`text-*`/`border-*` 工具类）。图标颜色经 `currentColor` 继承令牌，全站零硬编码色（唯一例外 `#FFFFFF`/`#000000`）。

### A1-identity（页面级强制）
| Token | 工具类 | 值 | 角色 |
|---|---|---|---|
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

### A2-semantic（语义色）
| Token | 值 | 角色 |
|---|---|---|
| `--color-success` | `#16A34A` | 成功 / 已发布 |
| `--color-warn` | `#D97706` | 警告 / 草稿待审 |
| `--color-danger` | `#DC2626` | 错误 / 删除 |

### C-extension（组件级，仅作品详情暗展台）
| Token | 值 | 角色 |
|---|---|---|
| `--color-stage` | `#0B0B0C` | 近黑展台背景，框住艺术图 |
| `--color-stage-fg` | `#F4F4F5` | 展台上前景 / 说明文字 |

### 配色纪律
- 中性色占 70–90%，强调色 ≤10% 且**每屏 ≤2 处可见使用**（仅 CTA、选中 Tab、关键数据）。
- 标题用深色中性（`--color-fg`），**不用 accent 上色**。
- 温暖感由强调色 + 排版 + 真实作品图传达，**不靠背景色**（规避奶油背景 denylist）。
- **禁用任何渐变**；层次仅靠中性色阶与单一品牌主色实现。
- 来源：`references/design-systems/color-palettes.md` 第 10 套「个人作品集单色」的近白变体 + 本站自定义深钴蓝 accent（非其默认蓝）。

---

## 3. Typography（排版）

### 字体配对（避开 Inter/Fraunces 等 monoculture 默认）
| 角色 | 字体 | 说明 |
|---|---|---|
| 标题 `--font-display` | **Bricolage Grotesque** + Noto Sans SC | 有性格的编辑感无衬线，建立视觉重心 |
| 正文 `--font-body` | **Inter** + Noto Sans SC | 干净专业（Inter 仅作正文，不作"高级"展示体） |
| 元信息 `--font-mono` | **JetBrains Mono** + Noto Sans SC | 角色/工具/年份/标签，暗示互动媒体·开发气质 |

### Google Fonts @import（放 globals.css 顶部，`display=swap`）
```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;700&display=swap');
```
> 生产建议：用 `next/font/google` 自托管 Bricolage/Inter/JetBrains Mono；Noto Sans SC 体积大，仅按需子集化或单独 `<link>` 预连接。

### 字号阶梯（8 级，px + rem）
| 用途 | token | px | rem |
|---|---|---|---|
| 标签/徽章 | `--text-xs` | 12 | 0.75 |
| 辅助文字/按钮 | `--text-sm` | 14 | 0.875 |
| 正文基准 | `--text-base` | 16 | 1 |
| 三级标题 | `--text-lg` | 18 | 1.125 |
| 二级标题 | `--text-xl` | 20 | 1.25 |
| 一级标题 | `--text-2xl` | 24 | 1.5 |
| Hero 副标题 | `--text-3xl` | 32 | 2 |
| Hero 主标题 | `--text-4xl` | 40 | 2.5 |

### 字重三级
| 级别 | 值 | 用途 |
|---|---|---|
| Read | 400 | 正文、描述 |
| Emphasize | 510 | 按钮文字、表格表头、小标题 |
| Announce | 590 | 大标题、强调、CTA |

### 行高 / 字距
- 行高：Hero/大标题 `1.15`（tight）、中标题 `1.3`（snug）、西文正文 `1.6`（normal）、**中文正文 `1.7`（relaxed）**。
- 字距：ALL CAPS ≥ `0.08em`（caps）；标题负字距 `-0.02em`（display）／ 次标题 `-0.01em`（tight）；正文 `0`。
- 配对来源：`references/design-systems/typography-pairings.md` 第 5 套「Minimal Swiss」的极简思路 + 本站自定义 display 字体（Bricolage 替代 Inter 作标题，拉开层级）。

---

## 4. Components（组件规范）

> 全部状态覆盖：Default / Hover / Focus-visible / Active / Disabled / Loading。错误与空状态见 §5 与 §8。图标均 Lucide，尺寸 16（行内）/ 20（按钮内）/ 24（独立）。禁 emoji。

### 4.1 按钮 Button
| 变体 | 背景 | 文字 | 边框 | 悬停 | 激活 |
|---|---|---|---|---|---|
| Primary | `bg-accent` | `text-accent-on` | 无 | `bg-accent-hover` | `bg-accent-active` |
| Secondary | 透明 | `text-fg` | `1px border-border` | `bg-surface-warm` | `bg-surface-warm` |
| Ghost | 透明 | `text-fg-2` | 无 | `bg-surface-warm` | `bg-surface-warm` |
| Destructive | `bg-danger` | `#FFFFFF` | 无 | 深 8% | 深 14% |

- 尺寸：高度 40px，内边距 0 16px；图标按钮 40×40（Lucide 20px）。大号 Hero CTA 高度 48px。
- 圆角 `radius-md`(10px)；字重 Emphasize(510)；字号 sm(14) 或 base(16)。
- 焦点：`focus-visible` 用 `--shadow-focus`（accent 派生 3px 环）。
- Loading：右侧 Lucide `Loader2`（20px，`animate-spin`）替代文字，禁用按钮态。
- 触控目标 ≥44×44px（移动端可整行拉伸）。

### 4.2 输入框 Input / Textarea
- 背景 `bg-surface`，边框 `1px border-border`，圆角 `radius-sm`(6px)，文字 `text-fg`，占位 `text-meta`。
- 焦点：`border-accent` + `--shadow-focus`；**移除默认 outline**。
- 错误：`border-danger` + `--shadow-focus` 改用 danger 派生环；错误文案 `text-danger` sm，置于字段下方（近字段，非顶部）。
- 禁用：`bg-surface-warm` + `text-meta` + `cursor-not-allowed`。
- 必填标记用 `text-danger` 星号 + `aria-required`。

### 4.3 卡片 Card
- 背景 `bg-surface`，`1px border-border`，圆角 `radius-md`(10px) 或 `radius-lg`(14px，大卡)。
- **默认无外阴影**（`--shadow-flat`），靠 1px 边框分层（反"幽灵卡片"：禁止同元素同时出现 1px 边框 + blur≥16px 阴影）。
- 作品卡 hover：`translateY(-2px)`（150ms）+ 边框转 `border-accent`（替代左条纹/发光）。
- 选中态：`--shadow-ring` + `border-accent`。

### 4.4 导航 Navigation
- **顶部导航（桌面）**：sticky，`bg-bg`/`backdrop` 半透 + `border-b border-border`；左侧品牌字标（Bricolage），中部链接（首页/作品/博客/关于），右侧 CTA「联系我」(`btn-primary` 小号) + 社交图标（Lucide Github/LinkedIn/20px，`text-muted` hover `text-fg`）。
- **移动端（<768px）**：sticky 顶栏 + 右侧 Lucide `Menu`（24px）切换下拉面板（从顶部滑下，`z-sticky`）；面板内竖排链接 + CTA。关闭用 `X`（24px，`aria-label="关闭菜单"`）。
- 选中链接：`text-fg` + 底部 `2px` accent 下划线；未选中 `text-muted` hover `text-fg`。
- 后台导航见 §10.9（Product 寄存器，左侧 Sidebar）。

### 4.5 表格 Table（仅 /admin）
- 容器 `bg-surface` + `border-border` + `radius-md`；表头 `text-muted` + 字重 Emphasize + `border-b border-border`；行 `border-b border-border-soft`，hover `bg-surface-warm`。
- 表头 sticky（`position: sticky; top: 0; bg-surface; z-dropdown`）。
- 单元格内状态用 Badge（见下）；操作列图标按钮（Lucide `Pencil`/`Trash-2`/`Eye`，20px），`aria-label` 必填。

### 4.6 表单 Form
- 可见 `<label>` 关联每个字段（`htmlFor`/`id`），标签 `text-fg-2` sm Emphasize。
- Helper text `text-meta` xs；Error 近字段 `text-danger` sm。
- 实时校验（onBlur/onChange），错误用 `aria-describedby` + `aria-invalid`。
- 多步表单用进度指示（步骤点 + 进度条）。

### 4.7 空状态 Empty State
- 居中：Lucide `ImageOff`/`Inbox`/`FileText`（24px，`text-meta`）+ 标题（`text-fg` lg Emphasize）+ 引导文案（`text-muted` sm）+ 主操作按钮（`btn-primary`）。
- 背景可用 `bg-surface-warm` 或留白；**绝不用 Lorem/抽象图充数**。

### 4.8 状态徽章 Badge / 标签 Tag
- 胶囊 `radius-pill`，内边距 2px 10px，字号 xs，`letter-spacing: caps`(0.08em)，UPPERCASE 或首字母大写。
- 语义：已发布 `bg-success/10 text-success`、草稿 `bg-warn/10 text-warn`、删除/错误 `bg-danger/10 text-danger`；中性标签 `bg-surface-warm text-fg-2`。
- 注：`/10` 表示用 color-mix 10% 透明度派生（令牌内已定义浅底思路，前端用 `color-mix(in srgb, var(--color-success) 10%, transparent)`）。

### 4.9 Toast / 弹窗 Modal
- **Toast**：固定右下（`z-toast`），`bg-surface` + `border-border` + `--shadow-raised` + `radius-md`；左置状态图标（Lucide `Check`/`AlertTriangle`/`X`，20px，`text-success`/`text-warn`/`text-danger`）+ 文案；自动消失 4s，可手动 `X` 关闭；入场 `translateY`+fade 200ms。
- **Modal**：遮罩 `bg-fg/40`（color-mix 40% 透明）+ 居中 `bg-surface` + `border-border` + `--shadow-raised` + `radius-lg`；焦点 trap + `Esc` 关闭 + 点击遮罩关闭；标题 `text-fg` xl Announce，内容 `text-muted`；`z-modal`。

### 4.10 图标 Icon（Lucide 锁定）
- 库：Lucide React（`lucide-react`），全站唯一；内联 SVG、`currentColor` 主题化、tree-shakable；24px 网格、2px 描边、圆角端点。
- 尺寸：16（行内/标签）/ 20（按钮内）/ 24（独立图标），全项目统一。
- 装饰图标 `aria-hidden="true"`；图标按钮必须有 `aria-label`。
- **禁用**：任何 emoji 字符作功能图标/装饰/状态指示；混用多套图标库。

---

## 5. Layout & Spacing（布局与间距）

- **间距基准**：4px 网格 → `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80px`（token `--space-*`）。
- **圆角阶梯**：sm(6) / md(10) / lg(14) / pill(9999)。**卡片 ≤14px，禁 ≥24px 过度圆角。**
- **栅格**：12 列，`gap: 24px`（`--space-6`）；桌面 `max-w` 1200px（`--container-max`），`gutter` 24px。
- **节区节奏（section-y）**：桌面 80 / 平板 48 / 手机 32px。作品区大留白建立画廊感。
- **非对称（VARIANCE=6）**：标题左对齐；作品网格有意错落（4:3 与 16:9 混排尺寸）；移动端 <768px 回退单列。
- **容器工具类**：`.container-page`（`max-w-1200 + mx-auto + px-6`）。

---

## 6. Depth & Elevation（深度与阴影）

- **三级层级**：`--shadow-flat`(none) / `--shadow-ring`(1px 边框环) / `--shadow-raised`(blur≤12px 的轻抬升)。
- 卡片默认靠边框分层，**不用外阴影堆叠**；仅在 hover/modal/toast 用 `--shadow-raised`（blur 上限 12px，规避"幽灵卡片"）。
- **z-index**：base(0) / dropdown(1000) / sticky(1100) / modal(1200) / toast(1300)。
- 毛玻璃/blur：**仅作品详情暗展台**可作功能性半透遮罩，其余不作装饰性玻璃。

---

## 7. Do's & Don'ts（设计守则）

### 应该做的
1. 用真实洪兄作品图作主视觉与缩略图，统一 4:3 比例 + 懒加载 + 渐显。
2. 标题用 Bricolage 大字号承担视觉重心，配负字距。
3. 每屏 accent 仅 ≤2 处（CTA / 选中 Tab / 关键数据）。
4. 作品卡 hover 用「轻微抬升 + 边框转 accent」建立信任，而非发光/渐变。
5. 空状态给「图标 + 引导文案 + 主操作」，而非空白或 Lorem。
6. 所有交互组件支持键盘可达 + 可见焦点环 + `prefers-reduced-motion`。
7. 后台走 Linear 式克制（surface-warm 分区 + 表格 + 状态 Badge）。

### 禁止做的
1. 禁 emoji 作功能图标（仅 Lucide 16/20/24px）。
2. 禁紫→粉渐变 / 发光边框 / 装饰性毛玻璃（三位一体 AI 模板）。
3. 禁空洞占位（"Welcome to" / "Lorem ipsum" / 抽象 3D 大图 Hero）。
4. 禁硬编码颜色（组件内一律 Token，例外仅 `#FFFFFF`/`#000000`）。
5. 禁千篇一律 Hero（首页用真实精选作品预览 + 左对齐身份陈述）。
6. 禁侧条纹边框（>1px 彩色左边框作卡片强调）、禁渐变文字、禁过度圆角(≥24px)。
7. 禁图床外链 / AI 原创图冒充作品；图片必须洪兄真实作品 + 作者 ID + 稳定源。
8. 禁奶油/米色背景默认化（温暖感靠 accent + 排版 + 作品图，不靠背景色）。

---

## 8. Responsive & Accessibility（响应式与无障碍）

### 响应式断点（mobile-first）
| 断点 | 宽度 | 布局策略 |
|---|---|---|
| 手机 | <640px | 单列；顶栏 + Menu 下拉；CTA 底部 sticky bar |
| 平板 | 640–1024px | 双列；侧边留白收窄 |
| 桌面 | ≥1024px | 12 列网格；max-w 1200；非对称作品网格 |
| 大屏 | ≥1280px | 完全展开 |

- 导航：桌面顶部横栏；移动端 Menu 抽屉（§4.4）。
- 触摸目标：最小 44×44px。
- 图片：`<img loading="lazy">` + `srcset`(WebP/AVIF) + 渐显；展台主图优先加载。

### 无障碍（WCAG 2.1 AA 基线）
- 对比度：正文 `text-fg #18181B` on `bg-bg #FCFCFD` ≈ 16:1（远超 4.5:1）；`text-muted #71717A` on `#FCFCFD` ≈ 4.6:1（达标）；`text-meta #A1A1AA` 仅用于非必要元数据（避免用于正文）。accent `#2B4ACB` on `#FCFCFD` ≈ 6.3:1（CTA 达标）。
- 键盘：所有可交互元素可达；`focus-visible` 焦点环（§4/§ CSS）。
- 图标按钮 `aria-label`；装饰图标 `aria-hidden`。
- 表单 `label`/`aria-invalid`/`aria-describedby`；错误文案可读。
- 图片 `alt`（作品名 + 作者）；装饰图 `alt=""` + `aria-hidden`。
- 动效：全站支持 `prefers-reduced-motion`（§ CSS media query 已降级）。
- 5 态覆盖（列表/表单）：Loading（骨架屏）/ Empty（引导）/ Error（具体错误 + 重试）/ Populated（完整展示）/ Edge（超长标题截断 `line-clamp`、零结果、超大数据分页）。

---

## 9. Agent Implementation Guide（实现指南）

### 9.1 Tailwind v4 @theme（直接贴入 globals.css）
见同目录 `tailwind-theme.css`（含 `@theme` 令牌 + `@layer components` 组件基 + reduced-motion 降级）。颜色/字体/圆角/动效与 `uiux.md §3.2.1` 完全一致。

### 9.2 CSS 变量（:root 源）
见同目录 `design-tokens.css`（含 reset 基线、`focus-visible`、`prefers-reduced-motion`）。`design-tokens.json` 为其机器可读镜像。

### 9.3 框架特定提示（Next.js 16 / App Router）
- 字体：用 `next/font/google` 自托管 `Bricolage_Grotesque` / `Inter` / `JetBrains_Mono`；暴露 CSS 变量（`--font-display` 等）注入 `:root`。Noto Sans SC 体积大，建议单独 `<link rel="preconnect">` + 子集化或仅中文路由加载。
- 图标：`import { Menu, Search, Image as ImageIcon } from 'lucide-react'`，统一 `size={16|20|24}` + `className="text-*"`，禁止 emoji。
- 图片：存 `/public/works/*`（仓库）或对象存储；`next/image` 配 `sizes` + `placeholder="blur"`（真实作品缩略图，非 AI 图）。
- 状态：`loading.tsx` 骨架屏、`error.tsx` 错误边界、`not-found.tsx` 空/404。

### 9.4 已知坑提醒（来自 Phase 1 + 反模式）
1. 组件内**禁止**写死 hex；一律 `bg-*`/`text-*`/`border-*` 令牌类或 `var(--color-*)`。
2. 禁止紫→粉渐变 / 发光 / 装饰玻璃（本站零渐变）。
3. 禁止 emoji 图标；Lucide 唯一。
4. 移动端必须无横向滚动；`<meta viewport>` 存在。
5. 图片稳定源，禁图床外链；禁 AI 原创图充作品。
6. 暗舞台 `--color-stage` **仅作品详情页**用，不做全站暗主题。

---

## 10. 页面设计提示词 / 实现要点（供前端照做）

> 各页面给出：路由 / 寄存器 / 布局 / 核心组件+状态 / 交互→反馈 / 响应式 / 动效 / 实现要点。

### 10.1 首页 Home `/`
- **寄存器**：Brand。**布局**：非对称——左列（≈5/12）左对齐身份陈述，右列（≈7/12）真实精选作品预览网格（3–5 件最强，4:3 与 16:9 错落）；下方一排导航式入口（作品/博客/关于）。
- **反模板 Hero（P0 #5）**：不做"大标题+副标题+居中 CTA+抽象 3D"。左对齐：`洪兄`(Bricolage 4xl Announce) + 一行定位「澳门科技大学 · 互动媒体艺术 / 游戏设计研究生」(mono sm `text-muted`) + 一句价值陈述「用互动叙事与游戏美术，把抽象概念变成可玩的体验」(fg-2 lg)。右侧/下方直接放真实作品缩略图（第一眼呈现核心能力）。
- **核心组件**：IdentityBlock（文字）、WorkPreviewCard × N（图 + 标题 + 角色标签 + 年份 mono）、SectionLink。
- **状态**：作品为空 → 占位框（作品名+尺寸+©洪兄，禁 Lorem）；加载 → 骨架卡。
- **响应式**：<768px 单列，身份陈述在上、作品网格 1 列（或 2 列密排）。
- **动效（MOTION=4）**：作品卡 hover 抬升 + 边框转 accent（150ms）；滚动淡入（200ms，stagger）；支持 reduced-motion。
- **实现要点**：首屏无 3+ 链接分流；主 CTA「查看作品」滚动锚定到作品区；缩略图 `next/image` 4:3 统一 + 懒加载 + 渐显；作者 ID「©洪兄」标注于卡片角（mono xs `text-meta`）。

### 10.2 作品列表 Works `/works`
- **寄存器**：Brand。**布局**：页头（左对齐标题「作品」+ 筛选/分类 chips：全部/游戏美术/互动装置/课程项目）+ 作品网格（错落 2–3 列，gap 24px）。
- **核心组件**：FilterChips（多选，选中态 `bg-accent text-accent-on`）、WorkCard（缩略图 4:3 + 标题 Bricolage lg + 角色/年份 mono + hover 抬升）、Pagination（Edge：超长列表分页，禁无限长）。
- **状态**：Loading（骨架网格）/ Empty（`ImageOff` 图标 + 「还没有公开作品」+ 引导）/ Error（`AlertTriangle` + 重试按钮）/ Edge（标题 `line-clamp-2`）。
- **响应式**：桌面 3 列 → 平板 2 列 → 手机 1 列；chips 横向滚动。
- **动效**：筛选切换内容淡入 150ms；卡片 hover 同首页。
- **实现要点**：筛选是客户端状态（URL query 同步）；缩略图一致尺寸建立信任；每张卡显示「个人贡献」标签（团队项目必标）。

### 10.3 作品详情 Work Detail `/works/[slug]`
- **寄存器**：Brand。**暗舞台（C-extension）**：顶部近黑 `--color-stage` 展台框主图（`bg-stage text-stage-fg`），让彩色作品跳出来——**有功能目的的局部暗色，非全站暗主题**。
- **布局**：展台主图（全宽，max-h 70vh，`object-contain` 居中 + 周围留黑） → 结构化信息区（`bg-bg`）：标题 Bricolage 2xl + 一句话概述 + 元信息行（角色/工具/年份，mono） → 案例叙事「结果 → 目标 → 解决」三块（Editorial 风格，留白充足） → 过程迭代图（sketch→blockout→final，缩略图网格） → 相关作品。
- **核心组件**：StageImage（暗展台）、MetaRow、NarrativeBlock、ProcessGallery、RelatedWorks。
- **状态**：主图加载 → 暗底骨架；图片缺失 → 暗底占位框（作品名+©洪兄）；过程图空 → 提示「迭代记录整理中」。
- **响应式**：展台主图移动端高度自适应；信息区单列；过程图 2–3 列。
- **动效**：主图入场淡入（200ms）；过程图 hover 轻微放大（150ms）；reduced-motion 降级。
- **实现要点**：**作者 ID「©洪兄」固定标注**于展台右下角（mono xs）；团队项目必须显式「个人贡献」段落；禁止 AI 原创图；图片稳定源（/public/works）。

### 10.4 博客列表 Blog `/blog`
- **寄存器**：Brand（偏 Editorial）。**布局**：页头（左对齐「博客 / 笔记」+ 一句话） → 文章列表（非对称：首篇 Featured 大卡 + 后续 2 列小卡；或统一错落网格）。
- **核心组件**：ArticleCard（封面/无封面 + 标题 Bricolage + 摘要 fg-2 + 日期/分类 mono + 阅读时长）、FeaturedArticle（大图/大标题）。
- **状态**：Loading（骨架）/ Empty（`FileText` 图标 + 「还没有发布文章」+ 引导订阅）/ Edge（摘要 `line-clamp-2`、长标题截断）。
- **响应式**：Featured 全宽 → 小卡桌面 2 列、手机 1 列。
- **动效**：卡片 hover 标题转 accent + 抬升（150ms）；滚动淡入。
- **实现要点**：文章封面可选（非必须，保持编辑感）；分类用 Badge；日期 `text-meta` mono。

### 10.5 博客详情 Blog Detail `/blog/[slug]`
- **寄存器**：Brand（阅读模式）。**布局**：顶部窄栏（标题 Bricolage 2xl + 元信息行 + 封面可选） → 正文阅读列（max-w 720px 居中，`leading-relaxed` 中文 1.7） → 文末作者卡 + 相关文章。
- **核心组件**：ArticleHeader、Prose（排版：h2/h3 Bricolage、正文 base、引用 `border-l-2 border-accent`、代码 `font-mono bg-surface-warm`）、AuthorCard、RelatedPosts。
- **状态**：加载 → 骨架阅读列；404 → not-found 引导。
- **响应式**：移动端单列、字号 base→sm 微调、左右留白收窄。
- **动效**：阅读进度条（顶部细 accent 条，scroll 驱动，≤300ms）；reduced-motion 关进度条动画但保留功能。
- **实现要点**：Markdown/MDX 渲染；代码块等宽；图片 `next/image` + 渐显；禁止 emoji 插图。

### 10.6 关于 About `/about`
- **寄存器**：Brand。**布局**：左对齐身份陈述（姓名 + 方向 + 一句话）+ 简介段落（relaxed 行高）+ 时间线/经历（Education: 澳门科技大学 互动媒体艺术·游戏设计 研究生；Experience/奖项 chips）+ 技能矩阵（工具/方向 Badge）+ 联系方式入口。
- **核心组件**：BioBlock、Timeline、SkillTags、ContactCTA。
- **状态**：经历空 → 提示「经历整理中」；技能来自数据。
- **响应式**：桌面两列（左文字右时间线）→ 手机单列。
- **动效**：时间线节点 hover 高亮（150ms）；克制。
- **实现要点**：真实信息，禁虚构指标；联系方式用 Lucide `Mail`/`Github`/`Linkedin` 图标链（20px）。

### 10.7 订阅 + 留言表单 Subscribe + Contact `/contact`（或 `/subscribe`）
- **寄存器**：Brand。**布局**：两区块——订阅（单字段 Email 表单 + 价值文案「订阅洪兄的创作笔记」）/ 留言（姓名 + Email + 留言内容 + 提交）。
- **核心组件**：SubscribeForm（Email 单字段 + `btn-primary`「订阅」）、ContactForm（3 字段 + 实时校验 + 提交 Loading + Success Toast）、InlineError。
- **状态**：Loading（按钮 Loader2）/ Success（Toast「已订阅，感谢」）/ Error（字段下方 `text-danger` + 重试）/ Empty（首屏引导文案）。
- **响应式**：桌面两列并排 → 手机单列堆叠；CTA 移动端底部 sticky bar 重复。
- **动效**：提交成功 Toast 滑入（200ms）；字段焦点环（150ms）；reduced-motion 降级。
- **实现要点**：字段 ≤3；实时校验（Email 格式）；提交后明确下一步文案；防 spam（honeypot 或验证码）；数据落 CMS。

### 10.8 /admin 登录与鉴权 `/admin/login`
- **寄存器**：Product。**布局**：居中登录卡（`bg-surface` + `border` + `radius-lg` + `--shadow-raised`），品牌字标 + 邮箱/密码字段 + 登录按钮 + 错误提示。
- **状态**：Loading（按钮）/ Error（凭据错误 `text-danger` 近字段）/ Locked（多次失败提示）。
- **响应式**：移动端全屏卡片；输入框整宽 ≥44px。
- **动效**：卡片入场淡入（150ms）；reduced-motion 关。
- **实现要点**：JWT 自管（架构师栈），登录失败不暴露具体原因细节；焦点环；`prefers-reduced-motion`。

### 10.9 /admin 仪表盘 Dashboard `/admin`
- **寄存器**：Product（Linear 式克制）。**布局**：左侧 Sidebar（品牌 + 导航：概览/作品/博客/留言/设置，选中态 `bg-surface-warm` + 左 2px accent 条（**注意：此处左条是 Sidebar 导航选中指示，非卡片侧条纹，允许**）+ 右侧内容区（`surface-warm` 分区背景）。
- **核心组件**：StatCard（指标：作品数/草稿数/博客数/未读留言，数值 Bricolage 2xl + 标签 mono）、RecentTable（最近作品/留言）、QuickActions（新建作品/写文章）。
- **状态**：Loading（骨架）/ Empty（无数据引导「创建第一个作品」）/ Error（重试）。
- **响应式**：桌面 Sidebar 固定（240px）→ 平板可折叠 → 手机底部 TabBar（≤5 项：概览/作品/博客/留言/设置，Lucide 24px）。
- **动效**：Stat 数字入场淡入（150ms）；表格行 hover；克制（MOTION=4）。
- **实现要点**：`--color-surface-warm` 分区；指标用 mono/display 区分层级；每屏 accent ≤2 处（选中项 + 主操作）。

### 10.10 /admin CRUD（作品/博客/留言管理）`/admin/works` `/admin/posts` `/admin/messages`
- **寄存器**：Product。**布局**：顶部操作栏（标题 + 「新建」`btn-primary` + 搜索框（Lucide `Search` 20px））+ 数据表格（§4.5）+ 分页。
- **核心组件**：DataTable（列：缩略图/标题/状态 Badge/更新时间/操作图标）、FilterTabs（全部/已发布/草稿）、RowActions（Lucide `Eye`/`Pencil`/`Trash-2`，`aria-label`）、ConfirmModal（删除确认，`danger` 二次确认）。
- **状态**：Loading（骨架表）/ Empty（`Inbox` 图标 + 「暂无数据，点击新建」）/ Error（重试）/ Edge（长标题 `truncate`、超大数据分页）。
- **响应式**：桌面全表 → 手机转卡片列表（每行一卡，操作换行）。
- **动效**：行 hover `bg-surface-warm`（150ms）；Modal 淡入（200ms）；Toast 反馈（增删改成功）。
- **实现要点**：删除必须二次 ConfirmModal（`danger`）；状态 Badge 用语义色（已发布绿/草稿橙）；操作图标按钮 `aria-label` 必填；图片上传落本地/存储（禁图床）。

---

## 11. P0 绝对规则自检（Phase 2 交付门禁）

| # | 规则 | 本方案处置 | 结果 |
|---|------|-----------|------|
| 1 | 禁 emoji 功能图标 | Lucide 唯一，16/20/24px；图标按钮 `aria-label`，装饰 `aria-hidden` | 通过 |
| 2 | 禁紫→粉渐变主视觉 | accent = 深钴蓝 `#2B4ACB`；全站零渐变，层次靠中性色阶 + 单主色 | 通过 |
| 3 | 禁空洞占位文案 | 真实身份/作品/经历信息；加载=骨架屏，空=引导动作；禁 "Welcome to"/"Lorem" | 通过 |
| 4 | 禁硬编码颜色 | 全部经 Token（`bg-*`/`text-*`/`border-*` 或 `var(--color-*)`）；例外仅 `#FFFFFF`/`#000000`；阴影/焦点环经 color-mix 派生 | 通过 |
| 5 | 禁千篇一律 Hero | 首页左对齐身份陈述 + 真实精选作品预览网格，非模板大图/口号 | 通过 |
| 6 | 图片真实+标注作者+稳定源 | 洪兄真实作品 + 「©洪兄」作者 ID + 仓库/对象存储；禁图床外链、禁 AI 原创图 | 通过 |

---

> 附录：设计令牌总数 = 颜色 18 + 间距 11 + 圆角 4 + 字体族 3 + 字号 8 + 字重 3 + 行高 4 + 字距 4 + 阴影 4 + 动效 4 = **63 个语义令牌**（详见 `design-tokens.json`）。
