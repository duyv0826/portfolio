# 作品集站点

静态站点，无构建步骤，可直接部署到 GitHub Pages / Vercel / 任意静态托管。

## 目录结构

```
作品集站点/
├── index.html                     总览：定位 / 三个项目卡 / 工程能力 / 行业观察 / 联系
├── projects/
│   ├── aoli-guangjing.html        《澳里·光景》Unity 6 工程与谜题管线
│   ├── room-of-choice.html        《抉择的房间》配置驱动叙事引擎
│   └── star-scavenger.html        《星际拾荒者》Godot 与素材合规
├── assets/
│   ├── css/tokens.css             Design Token（全站唯一色彩 / 间距 / 字体来源）
│   ├── css/main.css               样式，只引用 token，零硬编码色值
│   ├── js/main.js                 阅读进度 + 导航高亮 + 埋点挂载点
│   └── img/                       真实来源图片
└── README.md
```

## 设计红线（已遵守）

| 规则 | 落实方式 |
|------|----------|
| 禁止 emoji 作图标 | 全站无 emoji 字符 |
| 禁止紫粉渐变 | 强调色为青绿 `--color-accent: #4dd0c1` + 琥珀 `--color-highlight: #e8a33d`，无渐变主视觉 |
| 禁止硬编码色值 | 所有颜色一律 `var(--token)`，业务 CSS 无颜色字面值 |
| Design Token 驱动 | `tokens.css` 为唯一来源，改主题只改这一处 |
| 禁止 AI 生成图片 | 全部为本人设计交付稿 + Kenney CC0 素材，页脚已标注来源 |
| 禁止弹性缓动 | 仅使用 `ease`，无 `cubic-bezier` 回弹 |

## 图片来源

| 图片 | 来源 | 授权 |
|------|------|------|
| `aoli-*.jpg` | 《澳里·光景》本人设计交付稿 | 本人作品 |
| `scavenger-*.png` | Kenney · Simple Space / Space Shooter Redux | CC0（公共领域，无需署名） |

## 部署

### GitHub Pages

```bash
cd 作品集站点
git init
git add .
git commit -m "feat: portfolio site v1"
git branch -M main
git remote add origin git@github.com:duyv0826/<repo>.git
git push -u origin main
```

仓库 Settings → Pages → Source 选 `main` 分支根目录 → 等待几分钟即可访问。

### 本地预览

```bash
cd 作品集站点
python -m http.server 8000
# 打开 http://localhost:8000
```

## 埋点（P0 数据破零的关键）

`assets/js/main.js` 里已预留 `trackEvent()` 与声明式埋点（元素加 `data-track` 属性）。
确认统计方案后，替换函数体即可：

| 方案 | 做法 |
|------|------|
| Cloudflare Web Analytics | 在 `index.html` 的 `</body>` 前加一行脚本，无需手动事件 |
| Microsoft Clarity | `if (window.clarity) window.clarity("set", name, ...)` |
| 自建 / Umami | `navigator.sendBeacon("/api/stat", ...)` |

建议额外埋一个「结局到达」事件，这样能拿到完玩率——完玩率比 PV 更能写进简历。

## 部署后必须回填的数据

站点上目前标注的都是实测工程数据。部署并跑起来之后，请回填：

1. 三个项目的访问量 / 游玩次数
2. 《澳里·光景》204 个测试在 Unity 中的实跑结果
3. 小黑盒粉丝数与总获赞（以及每个数字是赞还是评论的口径）
4. 个人邮箱、可实习城市

## 校验

```bash
node --check assets/js/main.js
```

改完 HTML 后建议跑一次链接与资源检查：确认 `assets/`、`projects/` 的相对路径在
首页（`assets/...`）与详情页（`../assets/...`）两种层级下都正确。
