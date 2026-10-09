import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · 互动媒体艺术 / 游戏设计`,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} · 互动媒体艺术 / 游戏设计`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;700&display=swap";

/**
 * 根节点：语言 + 元数据 + 字体。
 *
 * 字体（DESIGN.md §3）：display=Bricolage Grotesque / body=Inter / mono=JetBrains Mono / 中文=Noto Sans SC。
 * 生产建议改用 next/font/google 自托管以避免外网依赖；此处先用 link 保持构建离线可复现。
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_URL} />
      </head>
      <body>{children}</body>
    </html>
  );
}
