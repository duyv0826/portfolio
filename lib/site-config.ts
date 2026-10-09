/**
 * 站点级常量与全站内容源。
 *
 * P0 纪律：这里只有「真实信息」——洪兄的身份、方向、真实经历。
 * 禁止空洞占位文案（"Welcome to" / Lorem），禁止虚构指标。
 */

export const SITE = {
  /** 姓名（短名用于导航字标） */
  name: "洪昺森",
  shortName: "洪兄",
  /** 紧密跟随的一行定位，mono sm / text-muted */
  tagline: "澳门科技大学 · 互动媒体艺术 / 游戏设计研究生",
  /** 价值陈述，fg-2 lg */
  statement: "用互动叙事与游戏美术，把抽象概念变成可玩的体验",
  description:
    "洪兄（洪昺森）的个人作品集：互动媒体艺术与游戏设计方向的学位作品、创作笔记与项目记录。",
  email: "hello@example.com",
  location: "广东 · 珠海",
  locale: "zh-CN",
} as const;

/** 社交链接。图标一律 Lucide，禁 emoji。 */
export const SOCIAL = [
  { label: "GitHub", href: "https://github.com/", icon: "Github" as const },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "Linkedin" as const },
  { label: "邮箱", href: `mailto:${SITE.email}`, icon: "Mail" as const },
] as const;

/** 前台主导航。选中态由 usePathname 判定（见 SiteNav）。 */
export const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/works", label: "作品" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
] as const;

/** 作品分类筛选 chips（与 Project.category 取值一致） */
export const WORK_CATEGORIES = [
  { value: "all", label: "全部" },
  { value: "游戏美术", label: "游戏美术" },
  { value: "互动装置", label: "互动装置" },
  { value: "课程项目", label: "课程项目" },
] as const;

/** 关于页 —— 真实经历，禁止虚构 */
export const EDUCATION = [
  {
    period: "2026 — 至今",
    title: "互动媒体艺术 · 游戏设计（硕士）",
    org: "澳门科技大学",
    note: "学位作品 + 一万字以上中文论文",
  },
  {
    period: "2022 — 2026",
    title: "计算机科学与技术（理学学士）",
    org: "澳门科技大学",
    note: "工程背景，支撑技术美术与编辑器工具方向",
  },
] as const;

/** 技能矩阵。真实工具链，虚的不写。 */
export const SKILLS = [
  { group: "引擎与开发", items: ["Unity", "Godot (GDScript)", "TypeScript", "C#"] },
  { group: "美术与技术美术", items: ["Blender", "Substance", "Photoshop", "Aseprite"] },
  { group: "叙事与设计", items: ["互动叙事", "分支结构设计", "关卡节奏", "UI/UX"] },
] as const;

/** 作品图版权标注（DESIGN.md §10.3：作者 ID 固定标注） */
export const COPYRIGHT_HOLDER = "©洪兄";

/** 每页展示条数，与 openapi limit 默认值对齐 */
export const PAGE_SIZE = {
  works: 12,
  posts: 10,
  admin: 20,
} as const;
