# 洪兄作品集站点迭代 — Phase 1 设计调研与 Design Token 草案

> 生成日期：2026-09-18 | 设计师：颜好看（UI/UX）| 阶段：Phase 1 调研
> 三轴刻度（初判）：Variance=6 / Motion=4 / Density=4（克制优先，待架构确认后定稿）
> 关联文档：`docs/phase1/spec/*`（架构/需求）、`docs/phase1/prd.md`（PM）

---

## 0. 已确认决策（设计约束基线）

1. **提质目标**：消除现有 AI 模板味 —— 以下全部去除：
   - `linear-gradient` 胶囊按钮 → 改为 1px 描边方角按钮 / 文本下划线链接
   - `backdrop-filter` 毛玻璃 header → 改为实色/透明 + 1px 底边框
   - `radial-gradient` 光晕 hero → 改为真实作品图 / 排版主导
   - `border-radius: 999px` 全圆角 → 改为 0/2/4/8/12px 阶梯
2. **洪兄 P0 红线**（设计层不可逾越）：
   - ❌ emoji 作功能图标 → 锁定 **inline SVG 描边图标**（16/20/24px）
   - ❌ 紫粉渐变主视觉
   - ❌ AI 模板味文案（"Welcome to" / "Lorem ipsum" / 空洞口号）
   - ❌ magic numbers → **全部语义化 Token**
   - ✅ Design Token 驱动
   - ✅ 真实画师授权作品（明确反对 AI 生成图）
3. **图片策略**：本轮用**中性色块占位（非渐变）**，预留 `data-artist` / `data-source` 标注位，待替换真实授权图。
4. **架构**：零构建静态单页；详情页用 **hash 路由**（`#/work/slug`）。

---

## 1. 竞品 / 标杆调研（互动媒体艺术 & 游戏设计作品集）

> 调研方法：WebSearch + WebFetch，覆盖 2025–2026 年作品集趋势报告与真实站点的设计语言拆解。

### 1.1 正向标杆（值得借鉴的设计语言）

| # | 站点 / 设计师 | 设计语言要点 | 对本项目的可迁移点 |
|---|---|---|---|
| A | **Daniel Spatzek** (spatzek.com) | 极简黑白基底，作品缩略图以彩色"跳"出来；滚动触发动画、微妙 hover；大量留白；导航极简（menu 选项少） | "中性画布 + 作品本身承载色彩"——暗色底让真实作品图成为唯一视觉焦点 |
| B | **Stefan Vitasović** (Codrops 2025 案例) | 瑞士印刷设计驱动：偏移网格（offset grid）、慷慨留白、强排版；几何形 + 字体作页面过渡支点；WebGL 视频网格但克制 | 编辑式不对称网格 + 排版即主角；可学其"刚性结构 + 轻量动效"的平衡 |
| C | **Tobias van Schneider** (vanschneider.com) | 单色基调 + 少量彩色点缀；独特网格；微妙 hover 与过渡；以策展式项目展示讲故事 | monochrome + 单一强调色的克制配色；叙事化项目陈列 |
| D | **Jenova Chen** (thatgamecompany 创始人) | 极简、简洁时间线、优雅字体；内容优先 | 游戏设计履历的"克制优雅"范式（反对花哨 3D 噱头） |
| E | **Brenda Romero** | 黑白极简、直白导航、无装饰 | 资深游戏设计师的"作品即内容"信条 |

### 1.2 反向标杆（明确要规避的 AI 模板味 / 过度设计）

| 站点 | 问题模式 | 对应洪兄红线 |
|---|---|---|
| **Nico** (createtoday 收录) | 深色居中布局 + **紫色氛围光晕 (purple atmospheric glow)** + 双 ghost 按钮 | 正是洪兄要去掉的 radial 光晕 hero + 紫调 |
| **GlitchForge** | 黑底霓虹青柠 + 品红 + 扭曲展示字体 | 过度饱和、喧宾夺主，违背"作品优先" |
| **Kris Horowitz** | 柔和粉底 + 黄卡片 | 粉彩 AI 味，且非作品导向 |
| 通用 SaaS Bento + 渐变 | 渐变胶囊 CTA、毛玻璃卡片 | 洪兄已点名的四类 AI 模板味 |

### 1.3 2025–2026 趋势提炼（去伪存真）

- ✅ **暗色模式 + 极简**：暗底降低视觉噪点、让作品图"发光"，专业且护眼。
- ✅ **排版驱动 / Bold Typography**：大字号标题 + 瑞士风格网格，字体本身成为设计元素（Stripe 72pt 标题范式）。
- ✅ **真实作品图优先**：灰度→彩色 hover、图片即内容，而非装饰性 3D/视频背景。
- ✅ **编辑式不对称网格 + 慷慨留白**：制造策展感、画廊感。
- ✅ **微妙微交互**：hover 揭示、滚动触发，快速（≤200ms）、不抢戏。
- ⚠️ **渐变回潮 / 视频背景 / 霓虹色**：趋势存在，但与洪兄红线冲突 → **不在本项目采用**。

---

## 2. 对标品牌 & 设计语言选择（含取舍理由）

### 2.1 选定方向：**"画廊式暗色编辑排版"（Gallery Dark Editorial）**

融合三层标杆：
- **UI 框架的克制度** 对标 **Linear / Stripe** 级——导航、按钮、间距、层级干净精准（非作品展示本身，而是"框"的质感）。
- **内容陈列的策展感** 对标 **Daniel Spatzek + Tobias van Schneider**——中性暗画布 + 单一暖色信号 + 真实作品跳色。
- **网格与排版的实验性** 对标 **Stefan Vitasović 的瑞士偏移网格**——编辑式、留白慷慨、字体即主角。

### 2.2 取舍理由（为什么不选别的）

| 候选 | 否决原因 |
|---|---|
| Bruno Simon（3D 开车漫游） | 炫技过度，与"作品优先 / 零构建静态单页"冲突，加载重 |
| 纯 SaaS Bento 渐变风 | 正是洪兄要去除的 AI 模板味（渐变 + 毛玻璃 + 光晕） |
| 亮色极简（Apple 风） | 作品集需"画廊暗房感"突出画作；亮底会削弱作品沉浸 |
| 霓虹/粉彩游戏风 | 视觉噪音大，违背克制与真实作品优先 |

### 2.3 设计人格（Design Persona）

- 关键词：**克制、策展、排版驱动、画廊暗房、真实优先**
- 氛围：深色中性画布上，真实作品图是唯一的色彩来源；UI 仅作隐形框架；一处暖色信号引导视线。

---

## 3. 反 AI 模板味映射表（现有问题 → 新方案）

| 现有 AI 模板味（洪兄点名） | 新方案（Token 驱动） |
|---|---|
| `linear-gradient` 胶囊按钮 | 1px 描边方角按钮（`--radius-sm` 2px/`--radius-md` 4px）+ 文本下划线 hover；主 CTA 用实色 `--accent` 方角按钮 |
| `backdrop-filter` 毛玻璃 header | 实色/透明 header + 1px `--border` 底边，滚动时加 `--elev-2` 微妙阴影（无模糊） |
| `radial-gradient` 光晕 hero | Hero 改为"大字号排版 + 1 张真实作品大图"或纯排版欢迎区，无光晕 |
| `border-radius: 999px` 全圆角 | 圆角阶梯 `0/2/4/8/12px`，彻底移除 `999px` |
| emoji 图标 | 锁定 inline SVG 描边图标（见 §5） |
| 紫粉渐变 | 单一暖琥珀强调色（见 §4），非紫非粉非蓝青渐变 |
| "Welcome to" 空洞文案 | 具体、第一人称策展语调（如"洪兄 · 互动媒体艺术与游戏设计精选"） |

---

## 4. Design Token 草案（无 magic number，全部 scale 化）

> 所有值语义化、可引用。下方 `:root` 块可直接落地到静态页 `<style>` 或 `tokens.css`。
> 层级映射：A1-identity（品牌核心）/ A2-structure（间距圆角动效）/ B-slot（组件别名）/ C-extension（本项目扩展）。

### 4.1 可直接落地的 CSS `:root` 变量块

```css
:root {
  /* ============ A1 — IDENTITY: 暗色背景阶梯（3 级，感知均匀） ============ */
  --bg:            #0C0C0E;   /* 页面底色：近黑、微冷中性（非纯黑） */
  --surface-1:     #16161A;   /* 卡片 / 抬升面 */
  --surface-2:     #1F1F24;   /* hover / 内嵌 / 次级面 */

  /* ============ A1 — IDENTITY: 文本色阶 ============ */
  --fg:            #ECECEE;   /* 主文本：近白非纯白 */
  --fg-2:          #A6A6AE;   /* 次级文本 / 说明 */
  --fg-3:          #6C6C74;   /* 三级 / 元数据 */

  /* ============ A1 — IDENTITY: 单一暖色信号（非紫非粉非蓝青） ============ */
  --accent:        #E0A458;   /* 暖琥珀：链接 / 激活态 / 焦点环 / 小标记 */
  --accent-hover:  #EAB873;   /* hover 提亮 */
  --accent-soft:   rgba(224,164,88,0.14); /* 选中底纹 / 焦点底 */

  /* ============ A2 — STRUCTURE: 边框 ============ */
  --border:        #2A2A30;   /* 默认边框 */
  --border-strong: #3A3A42;   /* 强分隔 */

  /* ============ A2 — STRUCTURE: 占位色（中性色块，非渐变） ============ */
  --placeholder:   #1A1A1F;   /* 作品图占位底 */
  --placeholder-2: #232329;   /* 占位纹理/交替 */

  /* ============ A2 — STRUCTURE: 间距阶梯（4px 网格，语义化） ============ */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-7:  40px;
  --space-8:  64px;
  --space-9:  80px;
  --space-10: 120px;          /* 仅 Hero / 大节区 */

  /* ============ A2 — STRUCTURE: 圆角阶梯（已去除 999px） ============ */
  --radius-none: 0;
  --radius-sm:   2px;         /* 标记 / 标签 */
  --radius-md:   4px;         /* 按钮 / 输入框 / 小卡 */
  --radius-lg:   8px;         /* 卡片 / 图框 */
  --radius-xl:   12px;        /* 弹层 / 灯箱 */

  /* ============ A2 — STRUCTURE: 字号阶梯（语义化，rem + px 注释） ============ */
  --text-xs:   0.75rem;   /* 12px — 元信息 / mono 标签 */
  --text-sm:   0.875rem;  /* 14px — 说明 / 次级 */
  --text-base: 1rem;      /* 16px — 正文 */
  --text-md:   1.125rem;  /* 18px — 引导段 */
  --text-lg:   1.25rem;   /* 20px — 子标题 */
  --text-xl:   1.5rem;    /* 24px — h3 */
  --text-2xl:  1.875rem;  /* 30px — h2 */
  --text-3xl:  2.875rem;  /* 46px — h1 */
  --text-4xl:  4rem;      /* 64px — Hero 展示（移动端 clamp 降至 2.5rem） */

  /* ============ A2 — STRUCTURE: 行高 ============ */
  --leading-tight: 1.15;   /* 展示字 */
  --leading-snug:  1.3;    /* 标题 */
  --leading-normal:1.6;    /* 正文 */

  /* ============ A2 — STRUCTURE: 字距 ============ */
  --tracking-display: -0.02em;  /* 大标题负字距 */
  --tracking-caps:    0.08em;   /* ALL CAPS 元标签 */

  /* ============ A1 — IDENTITY: 字体栈 ============ */
  --font-display: 'Inter', 'Noto Sans SC', system-ui, sans-serif;
  --font-body:    'Inter', 'Noto Sans SC', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Space Mono', ui-monospace, monospace;

  /* ============ A2 — STRUCTURE: 动效（收敛值 200ms，无弹跳） ============ */
  --motion-fast:  120ms;
  --motion-base:  200ms;
  --ease-standard: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);

  /* ============ A2 — STRUCTURE: 焦点环 ============ */
  --focus-ring: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);

  /* ============ A2 — STRUCTURE: 层级阴影（暗色：轻边框 + 微阴影，无重投影） ============ */
  --elev-1: 0 1px 0 rgba(255,255,255,0.04) inset;
  --elev-2: 0 8px 24px rgba(0,0,0,0.40);

  /* ============ A2 — STRUCTURE: 容器 ============ */
  --container-max:   1200px;
  --container-gutter:24px;

  /* ============ A2 — STRUCTURE: 断点（仅作参考，CSS 用媒体查询） ============ */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
}
```

### 4.2 语义映射说明（Primitive → Semantic → Component）

| 用途 | 引用的 Token | 禁止写法 |
|---|---|---|
| 页面背景 | `var(--bg)` | `#0c0c0e` 裸值 |
| 卡片底 | `var(--surface-1)` | 硬编码 |
| 主文本 | `var(--fg)` | `#fff` |
| 次级文本 | `var(--fg-2)` | 灰叠灰裸值 |
| 链接 / 激活 | `var(--accent)` | 紫 `#7c3aed` |
| 按钮圆角 | `var(--radius-md)` | `border-radius: 4px` 裸值 |
| 内边距 | `var(--space-5)` | `padding: 24px` 裸值 |
| 字号 | `var(--text-2xl)` | `font-size: 30px` 裸值 |
| hover 过渡 | `var(--motion-base) var(--ease-standard)` | `transition: .2s` 裸值 |

### 4.3 关键决策点

- **背景 3 级阶梯**：`--bg #0C0C0E` → `--surface-1 #16161A` → `--surface-2 #1F1F24`，靠明度递进表达层级（暗色模式标准做法，不靠重阴影）。
- **单一强调色 = 暖琥珀 `#E0A458`**：非紫、非粉、非蓝青渐变；每屏 ≤2 处使用（链接 / 激活 Tab / 焦点环 / 小标记）。作品图自带色彩，UI 保持近单色，让画作跳出来。
- **圆角彻底去 `999px`**：最大 12px，按钮 4px，标签 2px，保持编辑式硬朗克制。
- **占位色为中性实色**（`--placeholder #1A1A1F`），**非渐变**，符合"中性色块占位"要求。

---

## 5. 图标系统（inline SVG 描边，16/20/24px）

> **P0 红线落地**：全站禁止 emoji 图标。锁定一套 **1.5px 描边、currentColor 着色、视口 24 网格** 的 inline SVG 图标，按场景尺寸 16 / 20 / 24px 缩放。

### 5.1 必需图标清单（按功能）

| 名称 | 用途 | 尺寸 |
|---|---|---|
| `icon-arrow-right` | 详情页"下一作品"、进入链接 | 16/20 |
| `icon-arrow-left` | 返回 / "上一作品" | 16/20 |
| `icon-external` | 外链（Behance/ArtStation/个人站） | 16 |
| `icon-edit` | "编辑此页"（洪兄自助维护入口） | 16/20 |
| `icon-close` | 灯箱 / 弹层关闭 | 20/24 |
| `icon-menu` | 移动端导航展开 | 24 |
| `icon-mail` | 联系入口 | 20 |
| `icon-gamepad` | 游戏设计类目标记 | 20/24 |
| `icon-image` | 图库 / 作品类目标记 | 20/24 |
| `icon-tag` | 标签 / 媒介分类 | 16 |
| `icon-play` | 视频类作品播放 | 24 |
| `icon-chevron` | 展开 / 折叠（筛选器） | 16 |
| `icon-arrow-up` | 返回顶部 | 20 |
| `icon-github` | 代码 / 开源作品外链 | 20 |
| `icon-link` | 通用链接标记 | 16 |

### 5.2 SVG 规范（示例：`icon-arrow-right`）

```html
<!-- 24 网格，stroke=currentColor，stroke-width=1.5，fill=none -->
<svg class="icon" width="20" height="20" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.5"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M5 12h14M13 6l6 6-6 6"/>
</svg>
```

- 所有图标共享上述属性，`width/height` 按场景取 16/20/24。
- 纯装饰图标加 `aria-hidden="true"`；功能按钮图标必须配 `aria-label` 或可见文字。
- 图标色统一引用 `currentColor`，颜色由父元素 `color` 决定（文本色或 `--accent`）。

---

## 6. 页面视觉方向（真实作品内容优先于装饰）

> 核心原则：**作品图 / 真实内容是第一视觉主角；UI 是隐形框架。** 任何装饰若不能服务作品，删除。

### 6.1 首页（Home）
- **Hero（非光晕）**：左对齐大字号排版欢迎区——`--text-4xl` 标题（洪兄名 + 身份"互动媒体艺术 / 游戏设计"）+ `--text-md` 一句策展导语（具体、第一人称，非 "Welcome to"）。右侧或下方嵌入 **1 张真实作品大图**（中性色块占位本轮）。无 radial 光晕、无渐变。
- **精选作品索引**：瑞士偏移网格（2–3 列桌面 / 单列移动），每件作品 = 图框 + 下方 mono 元标签（年份 · 媒介 · 类目）。Hover：图轻微提亮 + 灰度→彩色（若届时用灰度占位则 hover 显 `--surface-2` 描边）。
- **导航**：顶部实色/透明 header，纯文本链接（作品 / 图库 / 关于 / 联系），1px `--border` 底边；滚动时加 `--elev-2` 微妙阴影。**无毛玻璃**。
- **按钮**：主 CTA 为实色 `--accent` 方角按钮（`--radius-md`）；次级为 1px 描边按钮或文本下划线链接。**无胶囊渐变**。

### 6.2 作品网格（Works Grid）
- 顶部 mono 筛选标签（全部 / 互动媒体 / 游戏设计 / 影像），用 `icon-tag` + 文字，**非 emoji**。
- 图片优先瓦片：固定 `aspect-ratio` 保持网格整齐；图下 meta 行用 `--font-mono` + `--tracking-caps` 小字。
- Hover 揭示作品标题与一句话描述（不遮挡图）。
- 占位策略：`<div class="ph" data-artist="" data-source="">` 中性 `--placeholder` 实色块，预留 `data-artist` / `data-source` 供替换真实授权图与署名。

### 6.3 详情页（Detail，hash 路由 `#/work/<slug>`）
- **大图主导**：顶部 1 张真实作品大图（满宽或 16:9），无光晕。
- **元信息侧栏/底栏**：年份、媒介、角色、展览经历，用 mono 标签 + `--fg-2` 排版，编辑式阅读布局。
- **正文**：`--text-base` / `--leading-normal` 描述，标题 `--text-2xl`。
- **导航**：底部"上一件 / 下一件"用 `icon-arrow-left` / `icon-arrow-right`，循环衔接。
- 零构建：纯 `hashchange` 切换，无需框架。

### 6.4 图库（Gallery）
-  justified / masonry 网格，点击 `icon-image` 缩略图打开 **灯箱**（`.lightbox`，`--radius-xl`，`--elev-2`，`icon-close` 关闭）。
- 每张图带 **署名条**：`data-artist` + `data-source` 渲染为图下小字（"作品：<artist> · 来源：<source>/授权"），落实"真实画师授权、反对 AI 生成图"。
- 移动端：网格降为 2 列，灯箱全屏。

### 6.5 真实作品优先的硬规则
1. 任何区块先问"这张图/这段内容是否真实作品？"——是则放大，否则删。
2. 占位一律中性实色块（非渐变），且带 `data-artist`/`data-source` 待填。
3. 禁止用 AI 生成图填充；洪兄反对，落地时仅接受授权真实画师作品。
4. 装饰性图形（如网格线、分隔）仅用 1px `--border`，不抢作品。

---

## 7. 响应式与无障碍（Red Lines 合规）

- **响应式**：mobile-first；断点 `--bp-sm 640` / `--bp-md 768` / `--bp-lg 1024`。网格桌面 2–3 列 → 平板 2 列 → 手机 1 列。Hero 字号 `clamp(2.5rem, 6vw, 4rem)`。
- **触摸目标**：所有可点元素 ≥ 44×44px；按钮间距 ≥ `--space-2`。
- **对比度**：`--fg #ECECEE` on `--bg #0C0C0E` ≈ 16:1；`--fg-2` on bg ≈ 7:1；`--accent #E0A458` on bg 高对比（链接可达 4.5:1+）。正文 ≥ 4.5:1。
- **焦点可见**：`:focus-visible` 应用 `--focus-ring`（双环：bg + accent）。
- **键盘可达**：导航、灯箱、筛选器全键盘可操作；图标按钮带 `aria-label`。
- **prefers-reduced-motion**：所有过渡/动画在该模式下降至 0 或瞬显。
- **5 态覆盖**（作品网格/灯箱/筛选）：Loading（骨架占位块）、Empty（"暂无该类作品" + 引导）、Error（加载失败重试）、Populated（正常图）、Edge（超长标题截断 `text-overflow: ellipsis`）。

---

## 8. Do's & Don'ts

### ✅ Do
1. 暗色中性画布 + 真实作品跳色，作品优先。
2. 单一暖琥珀 `--accent` 克制使用（≤2 处/屏）。
3. 编辑式不对称网格 + 慷慨留白 + 排版驱动。
4. 所有尺寸/颜色/间距走 Token，零 magic number。
5. inline SVG 描边图标，统一 1.5px / currentColor。
6. 真实画师授权图，带 `data-artist` / `data-source` 署名。
7. 微妙 microinteraction（≤200ms），服务内容不抢戏。

### ❌ Don't
1. 不用 `linear-gradient` 胶囊按钮 / `radial-gradient` 光晕 hero / `backdrop-filter` 毛玻璃。
2. 不用 `border-radius: 999px` 全圆角（最大 12px）。
3. 不用 emoji 作图标。
4. 不用紫粉渐变或蓝青渐变主视觉。
5. 不用 AI 生成图填充占位。
6. 不用 "Welcome to" / 空洞口号文案。
7. 不用重投影阴影（暗色靠明度递进 + 1px 边框表达层级）。

---

## 9. 交付物附录（供 Phase 2/3 衔接）

### 9.1 `design-tokens.json`（机器可读骨架）
```json
{
  "color": {
    "bg":           { "value": "#0C0C0E", "type": "color" },
    "surface-1":    { "value": "#16161A", "type": "color" },
    "surface-2":    { "value": "#1F1F24", "type": "color" },
    "fg":           { "value": "#ECECEE", "type": "color" },
    "fg-2":         { "value": "#A6A6AE", "type": "color" },
    "fg-3":         { "value": "#6C6C74", "type": "color" },
    "accent":       { "value": "#E0A458", "type": "color" },
    "border":       { "value": "#2A2A30", "type": "color" },
    "placeholder":  { "value": "#1A1A1F", "type": "color" }
  },
  "space": {
    "1": { "value": "4px", "type": "dimension" },
    "2": { "value": "8px", "type": "dimension" },
    "3": { "value": "12px", "type": "dimension" },
    "4": { "value": "16px", "type": "dimension" },
    "5": { "value": "24px", "type": "dimension" },
    "6": { "value": "32px", "type": "dimension" },
    "7": { "value": "40px", "type": "dimension" },
    "8": { "value": "64px", "type": "dimension" },
    "9": { "value": "80px", "type": "dimension" }
  },
  "radius": {
    "none": { "value": "0", "type": "dimension" },
    "sm":   { "value": "2px", "type": "dimension" },
    "md":   { "value": "4px", "type": "dimension" },
    "lg":   { "value": "8px", "type": "dimension" },
    "xl":   { "value": "12px", "type": "dimension" }
  },
  "font": {
    "family": { "value": "Inter, Noto Sans SC, system-ui, sans-serif", "type": "fontFamily" },
    "mono":   { "value": "JetBrains Mono, Space Mono, ui-monospace, monospace", "type": "fontFamily" }
  },
  "type": {
    "xs":  { "value": "0.75rem", "type": "dimension" },
    "sm":  { "value": "0.875rem", "type": "dimension" },
    "base":{ "value": "1rem", "type": "dimension" },
    "md":  { "value": "1.125rem", "type": "dimension" },
    "lg":  { "value": "1.25rem", "type": "dimension" },
    "xl":  { "value": "1.5rem", "type": "dimension" },
    "2xl": { "value": "1.875rem", "type": "dimension" },
    "3xl": { "value": "2.875rem", "type": "dimension" },
    "4xl": { "value": "4rem", "type": "dimension" }
  },
  "motion": {
    "fast": { "value": "120ms", "type": "duration" },
    "base": { "value": "200ms", "type": "duration" }
  }
}
```

### 9.2 Tailwind 配置片段（若 Phase 3 引入 Tailwind；本轮为零构建，仅作衔接参考）
```js
theme: {
  extend: {
    colors: {
      bg: 'var(--bg)', surface: { 1: 'var(--surface-1)', 2: 'var(--surface-2)' },
      fg: { DEFAULT: 'var(--fg)', 2: 'var(--fg-2)', 3: 'var(--fg-3)' },
      accent: { DEFAULT: 'var(--accent)', hover: 'var(--accent-hover)' },
      border: 'var(--border)', placeholder: 'var(--placeholder)'
    },
    fontFamily: { display: ['Inter','Noto Sans SC','sans-serif'], mono: ['JetBrains Mono','monospace'] },
    spacing: { 1:'4px',2:'8px',3:'12px',4:'16px',5:'24px',6:'32px',7:'40px',8:'64px',9:'80px' },
    borderRadius: { none:'0', sm:'2px', md:'4px', lg:'8px', xl:'12px' },
    fontSize: { xs:'0.75rem', sm:'0.875rem', base:'1rem', md:'1.125rem', lg:'1.25rem', xl:'1.5rem', '2xl':'1.875rem', '3xl':'2.875rem', '4xl':'4rem' }
  }
}
```

---

## 10. 待确认 / 开放问题（交给架构 & PM）
1. **强调色最终选择**：草案用暖琥珀 `#E0A458`；备选暖陶土 `#C76B4A`。待洪兄定。
2. **三轴刻度**：Variance/Motion/Density 初判 6/4/4，待架构确认技术栈与内容量后定稿。
3. **字体加载**：零构建静态页，Inter/Noto Sans SC 用 Google Fonts `<link>` 还是自托管？影响首屏；建议自托管关键字重或 `font-display: swap`。
4. **图标落地格式**：inline SVG 直接内联（零请求）还是独立 SVG sprite？建议内联（量小、零构建友好）。
