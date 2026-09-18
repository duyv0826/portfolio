# 开发级页面设计规格 · 洪兄作品集站点 v1.0

> 阶段：Phase 2 设计细化 | 设计师：颜好看 | 依据：`docs/spec/spec.md` §8（锁定 Token）+ `docs/phase1/uiux.md`
> 性质：**前端工程师落地唯一依据**。所有视觉值一律通过 Design Token 引用，业务样式零裸色值 / 零裸间距 / 零裸圆角像素（仅 `:root` 定义区可含字面量，满足 AC-09）。
> 冲突处理：实现与本文档冲突时，先更新 `spec.md` 再改代码（living-spec 原则）。

---

## 1. 全局 Token 落地（`:root` 权威块）

> 直接内联进 `index.html` 的 `<head><style>`。业务 CSS **禁止**出现任何 `#hex` 或 `Npx`（边框宽度已抽象为 `--hairline`）。

```css
:root{
  /* —— 背景阶梯（spec §8） —— */
  --bg:#0C0C0E;
  --surface-1:#16161A;
  --surface-2:#1F1F24;
  /* —— 文本（spec §8） —— */
  --fg:#ECECEE;
  --fg-2:#A6A6AE;
  --fg-3:#6C6C74;
  /* —— 强调色（spec §8，已确认）每屏静态使用 ≤2 处 —— */
  --accent:#E0A458;
  --accent-hover:#EAB873;
  --accent-soft:rgba(224,164,88,0.14);
  /* —— 边框 / 占位（spec §8，中性实色非渐变） —— */
  --border:#2A2A30;
  --placeholder:#1A1A1F;
  /* —— 间距 4px 网格（spec §8） —— */
  --space-1:4px;  --space-2:8px;  --space-3:12px; --space-4:16px;
  --space-5:24px; --space-6:32px; --space-7:40px; --space-8:64px;
  --space-9:80px; --space-10:120px;
  /* —— 圆角（spec §8，已去 999px） —— */
  --radius-none:0; --radius-sm:2px; --radius-md:4px; --radius-lg:8px; --radius-xl:12px;
  /* —— 字号语义（spec §8） —— */
  --text-xs:0.75rem; --text-sm:0.875rem; --text-base:1rem; --text-md:1.125rem;
  --text-lg:1.25rem; --text-xl:1.5rem; --text-2xl:1.875rem; --text-3xl:2.875rem; --text-4xl:4rem;
  /* —— 字体（spec §8，Google Fonts CDN + font-display:swap） —— */
  --font-display:'Inter','Noto Sans SC',system-ui,sans-serif;
  --font-body:'Inter','Noto Sans SC',system-ui,sans-serif;
  --font-mono:'JetBrains Mono','Space Mono',ui-monospace,monospace;
  /* —— 行高 / 字距（uiux.md） —— */
  --leading-tight:1.15; --leading-snug:1.3; --leading-normal:1.6;
  --tracking-display:-0.02em; --tracking-caps:0.08em;
  /* —— 动效（spec §8，无弹跳） —— */
  --motion-fast:120ms; --motion-base:200ms;
  --ease-standard:cubic-bezier(0.22,0.61,0.36,1);
  --ease-out:cubic-bezier(0.16,1,0.3,1);
  /* —— 焦点环 / 层级（spec §8 + uiux.md） —— */
  --focus-ring:0 0 0 2px var(--bg),0 0 0 4px var(--accent);
  --elev-1:0 1px 0 rgba(255,255,255,0.04) inset;
  --elev-2:0 8px 24px rgba(0,0,0,0.40);
  /* —— 容器 / 断点（spec §8） —— */
  --container-max:1200px; --container-gutter:24px;
  --bp-sm:640px; --bp-md:768px; --bp-lg:1024px;
  /* —— 本规格扩展（与 spec §8 不冲突，供业务样式零 px 落地） —— */
  --hairline:1px;                                    /* 边框宽度，规避裸 px */
  --icon-sm:16px; --icon-md:20px; --icon-lg:24px;     /* 图标场景尺寸 spec §8 */
  --measure:34rem;                                   /* 正文阅读宽度 */
  --hero-min:2.5rem; --hero-fluid:6vw;               /* Hero 标题流式下限 */
  --overlay:rgba(12,12,14,0.92);                     /* 灯箱遮罩 */
}
```

### 1.1 全局基础样式（零裸值示例）
```css
*,*::before,*::after{box-sizing:border-box;}
html{background:var(--bg);color:var(--fg);font-family:var(--font-body);-webkit-font-smoothing:antialiased;}
body{margin:0;font-size:var(--text-base);line-height:var(--leading-normal);background:var(--bg);}
img{display:block;max-width:100%;}
a{color:inherit;text-decoration:none;}
.container{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:var(--container-gutter);}
/* 图标基样式：尺寸走 Token，描边属性走 SVG 属性（见 §2） */
.icon{width:var(--icon-md);height:var(--icon-md);flex:none;}
.icon--sm{width:var(--icon-sm);height:var(--icon-sm);}
.icon--lg{width:var(--icon-lg);height:var(--icon-lg);}
/* 焦点可见：统一双环焦点环 */
a:focus-visible,button:focus-visible,[tabindex]:focus-visible{
  outline:none;box-shadow:var(--focus-ring);
  transition:box-shadow var(--motion-fast) var(--ease-standard);
}
/* 编辑式 mono 小标签（通用） */
.mono-tag{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-caps);
  text-transform:uppercase;color:var(--fg-3);}
```

---

## 2. 图标系统（15 枚 `<symbol>` 内联 Sprite）

> **P0 红线落地**：全站禁止 emoji 图标。锁定 1.5px 描边、`stroke="currentColor"`、`fill="none"`、`stroke-linecap/linejoin="round"`、`viewBox="0 0 24 24"`。
> 用法：`<svg class="icon icon--md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-xxx"/></svg>`
> 装饰图标必须 `aria-hidden="true"`；功能按钮图标须配 `aria-label` 或可见文字。

```html
<!-- 放在 <body> 顶部，display:none 的 sprite 区 -->
<svg width="0" height="0" style="display:none" aria-hidden="true" focusable="false">
  <symbol id="icon-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="icon-arrow-left" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></symbol>
  <symbol id="icon-external" viewBox="0 0 24 24"><path d="M15 4h5v5M20 4L10 14M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></symbol>
  <symbol id="icon-edit" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></symbol>
  <symbol id="icon-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="icon-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
  <symbol id="icon-mail" viewBox="0 0 24 24"><path d="M3 6h18v12H3Z"/><path d="M3 7l9 6 9-6"/></symbol>
  <symbol id="icon-gamepad" viewBox="0 0 24 24"><path d="M7 9h10a4 4 0 0 1 4 4 4 4 0 0 1-4 4H7a4 4 0 0 1-4-4 4 4 0 0 1 4-4Z"/><path d="M9 11v4M7 13h4"/><circle cx="15.5" cy="12" r="0.8"/><circle cx="17.5" cy="14" r="0.8"/></symbol>
  <symbol id="icon-image" viewBox="0 0 24 24"><path d="M4 5h16v14H4Z"/><path d="M4 16l5-5 4 4 3-3 4 4"/><circle cx="9" cy="9" r="1.5"/></symbol>
  <symbol id="icon-tag" viewBox="0 0 24 24"><path d="M3 12l8.5-8.5a2 2 0 0 1 2.83 0l6.17 6.17a2 2 0 0 1 0 2.83L13 20a2 2 0 0 1-2.83 0L3 12Z"/><circle cx="8.5" cy="8.5" r="1.2"/></symbol>
  <symbol id="icon-play" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7Z"/></symbol>
  <symbol id="icon-chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>
  <symbol id="icon-arrow-up" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></symbol>
  <symbol id="icon-github" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.48A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/></symbol>
  <symbol id="icon-link" viewBox="0 0 24 24"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></symbol>
</svg>
```

---

## 3. 页面 / 视图设计规格

> 路由：单页 hash 路由。`#/`=首页（默认）、`#work/<id>`=详情、`#gallery`=图库（同页区块）、`#contact`=联系（同页区块）、未知 hash→回退首页提示（404 视图）。所有视图由 `index.html` 内 JS 按 hash 渲染进 `<main id="app">`。

### 3.1 全局 Header / 导航（所有视图共用）

**HTML 结构**
```html
<header class="site-header" data-scrolled="false">
  <div class="header-inner container">
    <a class="brand" href="#/">洪兄<span class="brand-sub"> · 作品集</span></a>
    <nav class="nav" aria-label="主导航">
      <a class="nav-link" href="#/">作品</a>
      <a class="nav-link" href="#gallery">图库</a>
      <a class="nav-link" href="#contact">联系</a>
      <a class="nav-link nav-edit" href="#edit"><svg class="icon icon--md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-edit"/></svg><span>编辑</span></a>
    </nav>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="打开导航">
      <svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-menu"/></svg>
    </button>
  </div>
  <nav id="mobile-nav" class="mobile-nav" hidden aria-label="移动端导航">
    <a class="mobile-link" href="#/">作品</a>
    <a class="mobile-link" href="#gallery">图库</a>
    <a class="mobile-link" href="#contact">联系</a>
  </nav>
</header>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.site-header` | background | `var(--bg)`（滚动后 `var(--surface-1)`） |
| `.site-header` | border-bottom | `var(--hairline) solid var(--border)` |
| `.site-header` | box-shadow（滚动） | `var(--elev-2)` |
| `.header-inner` | padding | `var(--space-4) var(--container-gutter)` |
| `.brand` | font-family / size / color | `var(--font-display)` / `var(--text-md)` / `var(--fg)` |
| `.brand-sub` | color | `var(--fg-3)` |
| `.nav-link` | color / font-size / padding | `var(--fg-2)` / `var(--text-sm)` / `var(--space-2) var(--space-3)` |
| `.nav-link:hover / .nav-link[aria-current]` | color | `var(--accent)`（静态强调 ≤2 处/屏，此处为当前项标记） |
| `.nav-edit` | color | `var(--fg-2)`（hover `var(--accent)`） |
| `.nav-toggle` | display | 桌面 `none`；移动端 `inline-flex` |
| `.mobile-nav` | background / border-bottom | `var(--surface-1)` / `var(--hairline) solid var(--border)` |
| `.mobile-link` | padding / border-bottom / color | `var(--space-4)` / `var(--hairline) solid var(--border)` / `var(--fg-2)` |

> 强调色纪律：每屏**静态**强调 ≤2 处（通常为：主 CTA 按钮 + 当前导航/区块标记）。`hover` / `focus-visible` / `--focus-ring` 为**瞬态/功能态**，不计入静态 2 处配额。

### 3.2 首页 Hero（`#/`）

**HTML 结构**
```html
<section class="hero container" aria-labelledby="hero-title">
  <p class="hero-eyebrow">互动媒体艺术 · 游戏设计</p>
  <h1 class="hero-title" id="hero-title">洪兄</h1>
  <p class="hero-lede">澳门科技大学研究生，专注可玩叙事与互动影像。以下是近年的精选作品。</p>
  <div class="hero-actions">
    <a class="btn btn--primary" href="#work/room-of-choice">查看代表作<svg class="icon icon--md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-arrow-right"/></svg></a>
    <a class="btn btn--ghost" href="#gallery">浏览图库</a>
  </div>
  <ul class="hero-preview" role="list" aria-label="精选作品预览">
    <li><a class="hero-thumb" href="#work/<id>">
      <span class="thumb-ph" data-artist="" data-source=""><img class="thumb-img" src="<img>" alt="<title> 封面" loading="lazy"></span>
      <span class="thumb-cap"><title></span>
    </a></li>
    <!-- 取 featured 前 3 条 -->
  </ul>
</section>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.hero` | padding-block | `var(--space-10) var(--space-9)`（桌面）；移动端 `var(--space-9) var(--space-8)` |
| `.hero-eyebrow` | font / size / letter-spacing / color / text-transform | `var(--font-mono)` / `var(--text-xs)` / `var(--tracking-caps)` / `var(--fg-3)` / `uppercase` |
| `.hero-title` | font / size / line-height / letter-spacing / color | `var(--font-display)` / `clamp(var(--hero-min),var(--hero-fluid),var(--text-4xl))` / `var(--leading-tight)` / `var(--tracking-display)` / `var(--fg)` |
| `.hero-lede` | font / size / line-height / color / max-width | `var(--font-body)` / `var(--text-md)` / `var(--leading-normal)` / `var(--fg-2)` / `var(--measure)` |
| `.hero-actions` | display / gap | `flex` / `var(--space-4)` |
| `.btn` | border-radius / padding / font-size / gap | `var(--radius-md)` / `var(--space-3) var(--space-5)` / `var(--text-sm)` / `var(--space-2)` |
| `.btn--primary` | background / color / transition | `var(--accent)` / `var(--bg)`（深字反白）/ `background var(--motion-base) var(--ease-standard)` |
| `.btn--primary:hover` | background | `var(--accent-hover)` |
| `.btn--ghost` | background / border / color | `transparent` / `var(--hairline) solid var(--border)` / `var(--fg)` |
| `.btn--ghost:hover` | border-color / color | `var(--accent)` / `var(--accent)` |
| `.hero-preview` | display / gap / margin-top | `grid` / `var(--space-4)`（移动）→ `var(--space-5)`（≥768）/ `var(--space-8)` |
| `.hero-preview` | grid-template-columns | 移动 `1fr`；≥768 `repeat(3,1fr)` |
| `.thumb-ph` | aspect-ratio / background / border-radius / overflow | `4 / 3` / `var(--placeholder)` / `var(--radius-lg)` / `hidden` |
| `.thumb-img` | width / height / object-fit | `100%` / `100%` / `cover` |
| `.thumb-cap` | font / size / color / margin-top | `var(--font-display)` / `var(--text-sm)` / `var(--fg)` / `var(--space-2)` |

> Hero 含真实姓名 + 定位 + ≥3 作品预览（AC-01）；**无光晕、无渐变、无欢迎句**（P0-3 非千篇一律 Hero）。

### 3.3 首页 About（`#/`，同页区块）

**HTML 结构**
```html
<section class="about container" id="about" aria-labelledby="about-title">
  <h2 class="section-title" id="about-title"><span class="section-index">01</span>关于</h2>
  <div class="about-grid">
    <div class="about-bio">
      <p class="about-lead"><真实简介首段></p>
      <p><学术/创作脉络></p>
    </div>
    <aside class="about-meta">
      <dl class="meta-list">
        <div class="meta-row"><dt>院校</dt><dd>澳门科技大学</dd></div>
        <div class="meta-row"><dt>方向</dt><dd>互动媒体艺术 · 游戏设计</dd></div>
      </dl>
      <ul class="ext-links" role="list">
        <li><a class="ext-link" href="<小黑盒 url>" target="_blank" rel="noopener noreferrer"><svg class="icon icon--md" ...><use href="#icon-external"/></svg>小黑盒</a></li>
        <li><a class="ext-link" href="<知乎 url>" target="_blank" rel="noopener noreferrer"><svg class="icon icon--md" ...><use href="#icon-link"/></svg>知乎</a></li>
      </ul>
    </aside>
  </div>
</section>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.section-title` | font / size / color | `var(--font-display)` / `var(--text-2xl)` / `var(--fg)` |
| `.section-index` | font / size / color / margin-right | `var(--font-mono)` / `var(--text-sm)` / `var(--fg-3)` / `var(--space-3)` |
| `.about-grid` | display / gap / margin-top | `grid` / `var(--space-8)` / `var(--space-7)` |
| `.about-grid` | grid-template-columns | 移动 `1fr`；≥768 `2fr 1fr` |
| `.about-lead` | font / size / color / line-height | `var(--font-body)` / `var(--text-md)` / `var(--fg)` / `var(--leading-normal)` |
| `.about-bio p` | font / size / color | `var(--font-body)` / `var(--text-base)` / `var(--fg-2)` |
| `.meta-list` | gap / margin-top | `var(--space-5)` / `var(--space-5)` |
| `.meta-row dt` | font / size / color / letter-spacing | `var(--font-mono)` / `var(--text-xs)` / `var(--fg-3)` / `var(--tracking-caps)` |
| `.meta-row dd` | font / size / color / margin-top | `var(--font-body)` / `var(--text-base)` / `var(--fg)` / `var(--space-1)` |
| `.ext-links` | display / gap / margin-top | `flex / column` / `var(--space-3)` / `var(--space-5)` |
| `.ext-link` | display / gap / color / padding | `flex` / `var(--space-2)` / `var(--fg-2)` / `var(--space-2) var(--space-3)` |
| `.ext-link:hover` | color | `var(--accent)` |

### 3.4 首页 精选作品网格（`#/`）

**HTML 结构**
```html
<section class="works container" id="works" aria-labelledby="works-title">
  <h2 class="section-title" id="works-title"><span class="section-index">02</span>精选作品</h2>
  <ul class="works-grid" role="list">
    <li class="work-card">
      <a class="work-link" href="#work/<id>" aria-label="查看作品 <title>">
        <span class="work-cover thumb-ph" data-artist="" data-source="">
          <img class="work-img" src="<img>" alt="<title> 封面" loading="lazy">
        </span>
        <span class="work-info">
          <h3 class="work-title"><svg class="icon icon--md" ...><use href="#icon-gamepad"/></svg><span><title></span></h3>
          <p class="work-desc"><desc></p>
          <p class="work-meta">
            <span class="mono-tag"><svg class="icon icon--sm" ...><use href="#icon-tag"/></svg><tag></span>
            <span class="meta-year"><year></span>
          </p>
        </span>
        <!-- 仅当存在关系标注时渲染 -->
        <p class="work-relation">《澳里·光景》可玩叙事子项目</p>
      </a>
    </li>
  </ul>
</section>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.works-grid` | display / gap / margin-top | `grid` / `var(--space-5)` / `var(--space-7)` |
| `.works-grid` | grid-template-columns | 移动 `1fr`；≥768 `repeat(2,1fr)`；≥1024 `repeat(3,1fr)` |
| `.work-card` | background / border / border-radius / overflow | `var(--surface-1)` / `var(--hairline) solid var(--border)` / `var(--radius-lg)` / `hidden` |
| `.work-card` | transition | `border-color var(--motion-base) var(--ease-standard)` |
| `.work-card:hover` | border-color | `var(--accent)` |
| `.work-cover` | aspect-ratio / background | `4 / 3` / `var(--placeholder)` |
| `.work-img` | width / height / object-fit / transition | `100%` / `100%` / `cover` / `filter var(--motion-base) var(--ease-standard)` |
| `.work-card:hover .work-img` | filter | `saturate(1.08) brightness(1.04)`（微妙，非突兀） |
| `.work-info` | padding | `var(--space-5)` |
| `.work-title` | display / gap / font / size / color | `flex` / `var(--space-2)` / `var(--font-display)` / `var(--text-lg)` / `var(--fg)` |
| `.work-desc` | font / size / color / margin-top | `var(--font-body)` / `var(--text-sm)` / `var(--fg-2)` / `var(--space-2)` |
| `.work-meta` | display / gap / margin-top | `flex` / `var(--space-3)` / `var(--space-3)` |
| `.meta-year` | font / size / color | `var(--font-mono)` / `var(--text-xs)` / `var(--fg-3)` |
| `.work-relation` | font / size / color / margin-top | `var(--font-body)` / `var(--text-sm)` / `var(--accent)` / `var(--space-3)` |

> 关系标注（如《青峦·听雨》=《澳里·光景》子项目）按 spec §2 P0 统一口径渲染（AC-03）。`data-artist`/`data-source` 始终保留（AC-04）。

### 3.5 作品详情视图（`#work/<id>`）

**HTML 结构**
```html
<article class="detail container" aria-labelledby="detail-title">
  <nav class="detail-crumbs" aria-label="返回">
    <a class="crumb" href="#/"><svg class="icon icon--sm" ...><use href="#icon-arrow-left"/></svg>返回作品</a>
  </nav>
  <header class="detail-head">
    <p class="detail-tag mono-tag"><svg class="icon icon--sm" ...><use href="#icon-tag"/></svg><tag></p>
    <h1 class="detail-title" id="detail-title"><title></h1>
    <p class="detail-relation" if-relation>《澳里·光景》可玩叙事子项目</p>
  </header>
  <div class="detail-media">
    <span class="detail-hero thumb-ph" data-artist="" data-source=""><img class="detail-img" src="<img>" alt="<title> 主图" loading="lazy"></span>
  </div>
  <div class="detail-body">
    <section class="detail-overview">
      <h2 class="block-title">概述</h2>
      <p><overview 段落></p>
    </section>
    <aside class="detail-meta">
      <dl class="meta-list">
        <div class="meta-row"><dt>角色贡献</dt><dd><role></dd></div>
        <div class="meta-row"><dt>年份</dt><dd><year></dd></div>
        <div class="meta-row"><dt>媒介</dt><dd><medium></dd></div>
      </dl>
      <ul class="detail-links" role="list">
        <li><a class="detail-link link-play" href="<play url>" target="_blank" rel="noopener noreferrer"><svg class="icon icon--md" ...><use href="#icon-play"/></svg>可玩 Demo</a></li>
        <li><a class="detail-link link-doc" href="<doc url>" target="_blank" rel="noopener noreferrer"><svg class="icon icon--md" ...><use href="#icon-external"/></svg>设计文档</a></li>
      </ul>
    </aside>
  </div>
  <nav class="detail-nav" aria-label="作品间导航">
    <a class="detail-prev" href="#work/<prev>"><svg class="icon icon--sm" ...><use href="#icon-arrow-left"/></svg><span>上一件</span></a>
    <a class="detail-next" href="#work/<next>"><span>下一件</span><svg class="icon icon--sm" ...><use href="#icon-arrow-right"/></svg></a>
  </nav>
</article>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.detail` | padding-block | `var(--space-8) var(--space-9)` |
| `.detail-crumbs` | margin-bottom | `var(--space-5)` |
| `.crumb` | display / gap / font / color | `inline-flex` / `var(--space-2)` / `var(--text-sm)` / `var(--fg-2)` |
| `.crumb:hover` | color | `var(--accent)` |
| `.detail-head` | margin-bottom | `var(--space-6)` |
| `.detail-tag` | margin-bottom | `var(--space-3)` |
| `.detail-title` | font / size / line-height / letter-spacing / color | `var(--font-display)` / `var(--text-3xl)` / `var(--leading-tight)` / `var(--tracking-display)` / `var(--fg)` |
| `.detail-relation` | font / size / color / margin-top | `var(--font-body)` / `var(--text-sm)` / `var(--accent)` / `var(--space-3)` |
| `.detail-media` | margin-block | `var(--space-6)` |
| `.detail-hero` | aspect-ratio / background / border-radius | `16 / 9` / `var(--placeholder)` / `var(--radius-lg)` |
| `.detail-body` | display / gap / margin-top | `grid` / `var(--space-8)` / `var(--space-7)` |
| `.detail-body` | grid-template-columns | 移动 `1fr`；≥1024 `2fr 1fr` |
| `.block-title` | font / size / color / margin-bottom | `var(--font-display)` / `var(--text-xl)` / `var(--fg)` / `var(--space-4)` |
| `.detail-overview p` | font / size / color / line-height / max-width | `var(--font-body)` / `var(--text-base)` / `var(--fg-2)` / `var(--leading-normal)` / `var(--measure)` |
| `.detail-links` | display / gap / margin-top | `flex / column` / `var(--space-3)` / `var(--space-5)` |
| `.detail-link` | display / gap / color / padding | `flex` / `var(--space-2)` / `var(--fg-2)` / `var(--space-2) var(--space-3)` |
| `.detail-link:hover` | color | `var(--accent)` |
| `.detail-nav` | display / justify-content / margin-top / padding-top / border-top | `flex` / `space-between` / `var(--space-8)` / `var(--space-5)` / `var(--hairline) solid var(--border)` |
| `.detail-prev / .detail-next` | display / gap / color | `inline-flex` / `var(--space-2)` / `var(--fg-2)` |
| `.detail-prev:hover / :next:hover` | color | `var(--accent)` |

> 缺 `detail` 字段时视图降级：隐藏 `.detail-body` 与其链接，仅显示标题+主图+返回（spec §5.1 `detail` 缺省降级）。

### 3.6 图库 Gallery（`#gallery`，同页区块 + 灯箱）

**HTML 结构**
```html
<section class="gallery container" id="gallery" aria-labelledby="gallery-title">
  <h2 class="section-title" id="gallery-title"><span class="section-index">03</span>图库</h2>
  <ul class="gallery-grid" role="list">
    <li class="gallery-item">
      <button class="gallery-trigger" type="button" aria-label="放大查看 <name>" data-full="<url>" data-artist="<artist>" data-source="<source>">
        <span class="gallery-ph thumb-ph" data-artist="<artist>" data-source="<source>"><img class="gallery-img" src="<url>" alt="<name>" loading="lazy"></span>
      </button>
      <p class="gallery-cap">
        <span class="cap-name"><name></span>
        <span class="cap-credit">作品：<artist> · 来源：<source></span>
      </p>
    </li>
  </ul>
</section>

<!-- 灯箱（全局单例） -->
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="图片查看器">
  <button class="lightbox-close" type="button" aria-label="关闭查看器"><svg class="icon icon--lg" ...><use href="#icon-close"/></svg></button>
  <img class="lightbox-img" src="" alt="">
  <p class="lightbox-cap"></p>
</div>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.gallery-grid` | display / gap | `grid` / `var(--space-5)` |
| `.gallery-grid` | grid-template-columns | `repeat(auto-fill,minmax(min(100%,16rem),1fr))`（无裸 px） |
| `.gallery-trigger` | display / padding / background / border / border-radius / width | `block` / `0` / `transparent` / `none` / `var(--radius-lg)` / `100%` |
| `.gallery-ph` | aspect-ratio / background / border-radius / overflow | `4 / 3`（真实图含尺寸时由 `img` 自然撑开）/ `var(--placeholder)` / `var(--radius-lg)` / `hidden` |
| `.gallery-img` | width / height / object-fit / transition | `100%` / `100%` / `cover` / `filter var(--motion-base) var(--ease-standard)` |
| `.gallery-trigger:hover .gallery-img` | filter | `saturate(1.08) brightness(1.04)` |
| `.gallery-cap` | margin-top | `var(--space-3)` |
| `.cap-name` | font / size / color | `var(--font-body)` / `var(--text-sm)` / `var(--fg)` |
| `.cap-credit` | display / font / size / color / margin-top | `block` / `var(--font-mono)` / `var(--text-xs)` / `var(--fg-3)` / `var(--space-1)` |
| `.lightbox` | position / inset / display / align / justify / background / z-index | `fixed` / `0` / `flex` / `center` / `center` / `var(--overlay)` / `1200` |
| `.lightbox[hidden]` | display | `none` |
| `.lightbox-img` | max-width / max-height / border-radius | `90%` / `90vh` / `var(--radius-md)` |
| `.lightbox-close` | position / top / right / background / border / border-radius / color | `absolute` / `var(--space-5)` / `var(--space-5)` / `var(--surface-1)` / `var(--hairline) solid var(--border)` / `var(--radius-md)` / `var(--fg)` |
| `.lightbox-close:hover` | color / border-color | `var(--accent)` / `var(--accent)` |
| `.lightbox-cap` | font / size / color / margin-top | `var(--font-mono)` / `var(--text-xs)` / `var(--fg-2)` / `var(--space-3)` |

> 每张图渲染 `artist`/`source` 署名条（AC-12）；占位时 `data-artist`/`data-source` 为空值接口（AC-04）。图源必须为 repo 相对或 https（AC-11），禁止图床热链。

### 3.7 联系（Contact，`#contact`，同页区块）

**HTML 结构**
```html
<section class="contact container" id="contact" aria-labelledby="contact-title">
  <h2 class="section-title" id="contact-title"><span class="section-index">04</span>联系</h2>
  <ul class="contact-list" role="list">
    <li><a class="contact-link" href="mailto:<邮箱>"><svg class="icon icon--md" ...><use href="#icon-mail"/></svg><span>邮箱</span><svg class="icon icon--sm" ...><use href="#icon-external"/></svg></a></li>
    <li><a class="contact-link" href="<小黑盒>" target="_blank" rel="noopener noreferrer"><svg class="icon icon--md" ...><use href="#icon-link"/></svg><span>小黑盒</span></a></li>
    <li><a class="contact-link" href="<知乎>" target="_blank" rel="noopener noreferrer"><svg class="icon icon--md" ...><use href="#icon-link"/></svg><span>知乎</span></a></li>
  </ul>
</section>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.contact-list` | display / gap / margin-top | `flex / column` / `var(--space-4)` / `var(--space-7)` |
| `.contact-link` | display / gap / align / padding / background / border / border-radius / color | `flex` / `var(--space-3)` / `center` / `var(--space-4)` / `var(--surface-1)` / `var(--hairline) solid var(--border)` / `var(--radius-md)` / `var(--fg)` |
| `.contact-link:hover` | border-color / color | `var(--accent)` / `var(--accent)` |
| `.contact-link span` | font / size | `var(--font-body)` / `var(--text-base)` |

### 3.8 全局 Footer

**HTML 结构**
```html
<footer class="site-footer container">
  <p class="footer-copy">© 2026 洪兄 · 互动媒体艺术 / 游戏设计</p>
  <button class="to-top" type="button" aria-label="返回顶部"><svg class="icon icon--md" ...><use href="#icon-arrow-up"/></svg></button>
</footer>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.site-footer` | display / justify / margin-top / padding-block / border-top | `flex` / `space-between` / `var(--space-9)` / `var(--space-7)` / `var(--hairline) solid var(--border)` |
| `.footer-copy` | font / size / color | `var(--font-mono)` / `var(--text-xs)` / `var(--fg-3)` |
| `.to-top` | display / background / border / border-radius / color | `inline-flex` / `transparent` / `var(--hairline) solid var(--border)` / `var(--radius-md)` / `var(--fg-2)` |
| `.to-top:hover` | color / border-color | `var(--accent)` / `var(--accent)` |

### 3.9 404 / 未知 hash 回退视图

**HTML 结构**（JS 在未知 hash 时渲染进 `#app`）
```html
<section class="notfound container" aria-labelledby="nf-title">
  <p class="nf-code mono-tag">404</p>
  <h1 class="nf-title" id="nf-title">页面走丢了</h1>
  <p class="nf-text">你访问的链接不存在或已移动，下面是回家的路。</p>
  <a class="btn btn--primary" href="#/">返回首页<svg class="icon icon--md" ...><use href="#icon-arrow-right"/></svg></a>
</section>
```

**Token 映射**
| 选择器 | 属性 | Token |
|---|---|---|
| `.notfound` | text-align / padding-block | `center` / `var(--space-10)` |
| `.nf-code` | font / size / color | `var(--font-mono)` / `var(--text-2xl)` / `var(--accent)` |
| `.nf-title` | font / size / color / margin-top | `var(--font-display)` / `var(--text-3xl)` / `var(--fg)` / `var(--space-4)` |
| `.nf-text` | font / size / color / margin-top | `var(--font-body)` / `var(--text-md)` / `var(--fg-2)` / `var(--space-3)` |
| `.notfound .btn` | margin-top | `var(--space-6)` |

---

## 4. 响应式断点行为（`--bp-sm 640 / --bp-md 768 / --bp-lg 1024`）

| 断点 | 网格列数 | Hero 字号 | 导航 | 其他 |
|---|---|---|---|---|
| `< 640`（手机） | 作品/图库 `1fr`；Hero 预览 `1fr` | `clamp(var(--hero-min),var(--hero-fluid),var(--text-4xl))` 约 2.5rem 起 | `.nav` 隐藏，`.nav-toggle` 显示，`#mobile-nav` 抽屉 | About/Detail 单列；触摸目标 ≥44×44px（按钮 padding 已满足） |
| `≥ 768`（平板） | 作品 `repeat(2,1fr)`；Hero 预览 `repeat(3,1fr)` | 同上流式增长 | `.nav` 显示内联，`.nav-toggle` 隐藏 | About 双列 `2fr 1fr` |
| `≥ 1024`（桌面） | 作品 `repeat(3,1fr)`；图库 `auto-fill minmax(16rem,1fr)` | 上限 `var(--text-4xl)`(4rem) | 同上 | Detail 双列 `2fr 1fr`；容器 `max-width: var(--container-max)` 居中 |

**Hero 字号 clamp 规则（唯一写法）**
```css
.hero-title{font-size:clamp(var(--hero-min),var(--hero-fluid),var(--text-4xl));}
```
- 移动端下限 `var(--hero-min)` = `2.5rem`；流式 `var(--hero-fluid)` = `6vw`；上限 `var(--text-4xl)` = `4rem`（spec §8）。

**移动端导航 menu 展开逻辑（JS）**
1. 默认 `#mobile-nav[hidden]`；点击 `.nav-toggle` → 移除 `hidden`、`aria-expanded="true"`、可加 `.is-open` 类（从顶部下滑，过渡 `var(--motion-base)`）。
2. 点击任一 `.mobile-link` 或按 `Esc` → 重新 `hidden`、`aria-expanded="false"`。
3. `≥ --bp-md` 时强制隐藏移动抽屉（CSS `@media (min-width:768px){.mobile-nav{display:none!important}}`），导航走内联 `.nav`。

---

## 5. 动效规格（全部 ≤200ms，无弹跳缓动）

> 统一缓动 `var(--ease-standard)` = `cubic-bezier(0.22,0.61,0.36,1)`（非弹跳）。时长仅用 `var(--motion-fast)`(120ms) / `var(--motion-base)`(200ms)。

| 交互 | 属性变化 | 时长 / 缓动 |
|---|---|---|
| 卡片 hover | `border-color` → `var(--accent)` | `var(--motion-base) var(--ease-standard)` |
| 图片 hover | `filter` 微妙提亮/饱和 | `var(--motion-base) var(--ease-standard)` |
| 链接 / 按钮 hover | `color` / `border-color` → `var(--accent)` | `var(--motion-base) var(--ease-standard)` |
| `:focus-visible` | `box-shadow` → `var(--focus-ring)` | `var(--motion-fast) var(--ease-standard)` |
| 移动导航抽屉 | `hidden` ↔ 显示（位移/透明度） | `var(--motion-base) var(--ease-standard)` |
| 灯箱打开 | `opacity 0→1` + `img scale .98→1` | `var(--motion-base) var(--ease-standard)` |
| 灯箱关闭 | 反向 | `var(--motion-base) var(--ease-standard)` |
| 图片懒加载渐显 | `opacity 0→1`（`loading="lazy"` + `onload` 加 `.is-loaded`） | `var(--motion-base) var(--ease-standard)` |

**灯箱过渡实现（过渡不靠 display）**
```css
.lightbox{opacity:0;visibility:hidden;transition:opacity var(--motion-base) var(--ease-standard),visibility var(--motion-base) var(--ease-standard);}
.lightbox.is-open{opacity:1;visibility:visible;}
.lightbox-img{transform:scale(0.98);transition:transform var(--motion-base) var(--ease-standard);}
.lightbox.is-open .lightbox-img{transform:scale(1);}
```
> JS 切换 `.is-open` 类；`hidden` 属性仅在初始隐藏用，打开时移除并加 `.is-open`，关闭时反向。

**`prefers-reduced-motion` 降级**
```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{transition-duration:0ms !important;animation-duration:0ms !important;animation-iteration-count:1 !important;}
  .lightbox-img{transform:none !important;}
  .hero-preview,.works-grid{scroll-behavior:auto;}
}
```

---

## 6. 无障碍与 5 态覆盖（关键组件）

| 组件 | Loading | Empty | Error | Populated | Edge |
|---|---|---|---|---|---|
| 作品网格 | 骨架占位块（`--placeholder` + `--elev-1`） | 文案「暂无精选作品」+ 引导 | fetch 失败显示「作品加载失败，请稍后重试」不白屏 | 正常卡片 | 作品 <3 时网格自适应不显空卡 |
| 图库 | 同骨架块 | 「图库即将上线」 | 同上 `.catch` 分支 | 真实图 + 署名条 | 超长 `name` `text-overflow:ellipsis` |
| 图片 | `<img loading="lazy" onerror>` 降级到 `.thumb-ph` 占位 | — | `onerror` 显示中性占位（非 AI 图） | 真实授权图 | 外链失效→占位保持 |
| 灯箱 | — | — | 图片加载失败显示「图片暂时无法显示」 | 正常大图 | 极长署名 `cap-credit` 换行 |
| 外链 | — | — | 失效链接在详情标注「外链暂不可用」不崩溃 | 新标签打开 `rel="noopener noreferrer"` | — |

- **对比度**：`--fg #ECECEE` on `--bg #0C0C0E` ≈ 16:1；`--fg-2` ≈ 7:1；`--accent #E0A458` on `--bg` 高对比（链接达标）；正文 ≥ 4.5:1。
- **键盘**：导航/灯箱/筛选全键盘可达；图标按钮均带 `aria-label` 或可见文字；焦点环 `--focus-ring` 始终可见。
- **XSS**：所有 JSON 字段渲染前经 `escapeHTML()` + `escapeAttr()`，协议限 `http(s)` / 相对（spec §11）。

---

## 7. 设计门禁自查（P0 绝对规则逐条）

| # | P0 规则 | 本设计稿落地证据 | 结论 |
|---|---|---|---|
| 1 | 禁止 emoji 作功能图标 | §2 锁定 15 枚 inline SVG 描边图标；全站 `<use href="#icon-...">`；无任何 emoji 字符（AC-10） | ✅ 零违规 |
| 2 | 禁止紫粉渐变主视觉 | 强调色 `--accent #E0A458`（暖琥珀，非紫非粉非蓝青）；全局无 `linear/radial-gradient`；占位为中性实色 `--placeholder` | ✅ 零违规 |
| 3 | 禁止 AI 模板味（Welcome to / Lorem / 千篇一律 Hero） | Hero 为真实姓名+定位+≥3 真实作品预览，无光晕/无欢迎句；文案为具体中文（§3.2）；无 Lorem ipsum | ✅ 零违规 |
| 4 | 禁止 magic number / 硬编码颜色 | 业务样式 100% 引用 Token；裸 `#hex`/`Npx` 仅出现在 `:root` 与 SVG 属性（AC-09 合规）；边框宽度抽象为 `--hairline` | ✅ 零违规 |
| 5 | 必须 Token 驱动 | §1 `:root` 全量落地；§3 每区块 Token 映射表逐属性标注 | ✅ 零违规 |
| 6 | 真实画师授权图优先（反对 AI 生成图） | 占位一律中性实色 + `data-artist`/`data-source` 接口（AC-04）；图库强制署名条（AC-12）；spec §3 明确永不填 AI 图 | ✅ 零违规 |
| 7 | 去占位提质（渐变胶囊/毛玻璃/光晕/999px） | 按钮改方角描边（§3.2 `.btn` `--radius-md`）；header 实色+1px 边框无 `backdrop-filter`；Hero 无光晕；圆角阶梯最大 `--radius-xl 12px`，无 `999px` | ✅ 零违规 |
| 8 | 统一对外口径（《青峦·听雨》=子项目） | `work-relation` / `detail-relation` 区块按 spec §2 渲染（AC-03） | ✅ 零违规 |

**门禁结论：本设计稿（design-spec.md）经逐条核对 P0 绝对规则与 spec §9 验收标准，零违规。所有视觉决策均 Token 驱动、可机器执行。**

---

## 8. 交付确认清单（供 Phase 3 前端）

- [x] §1 `:root` 完整 Token 块（含扩展 `--hairline`/`--icon-*`/`--measure`/`--hero-*`/`--overlay`）
- [x] §2 15 枚图标 `<symbol>` 可直接内联进 `index.html` sprite 区
- [x] §3 全视图（首页 Hero/About/Works、详情、图库、联系、Footer、404）HTML 结构 + 逐属性 Token 映射
- [x] §4 响应式断点（列数/Hero clamp/移动导航逻辑）
- [x] §5 动效规格（hover/focus-visible/灯箱/reduced-motion）
- [x] §6 无障碍 + 5 态覆盖
- [x] §7 P0 门禁自查：零违规声明

> 前端落地时若需新增视觉值，**先回写本文件与 `spec.md`**，禁止在业务样式写裸值。
