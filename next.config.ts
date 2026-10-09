import type { NextConfig } from "next";

/**
 * 站点构建配置，面向国内部署（腾讯云 Lighthouse + Docker Compose），见 ADR-002。
 *
 * 图片来源纪律（DESIGN.md §7 禁止项 7）：禁图床外链、禁 AI 原创图冒充作品。
 * remotePatterns 因此只放开腾讯云 COS 域名，不放开任意 host。
 *
 * SVG 说明：封面占位图是仓库内自托管的矢量文件（public/works/*.svg），非用户上传内容，
 * 因此开启 dangerouslyAllowSVG，并按官方建议配套 attachment + 严格 CSP，防止 SVG 内脚本执行。
 */
const COS_HOST_PATTERN = process.env.NEXT_PUBLIC_COS_HOST ?? "*.cos.*.myqcloud.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: COS_HOST_PATTERN },
      { protocol: "https", hostname: "*.myqcloud.com" },
    ],
  },
};

export default nextConfig;
