import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH, verifyToken } from "@/lib/auth";

/**
 * 后台守卫（ADR-003 + DESIGN.md §10.8）。
 *
 * Edge 运行时，只依赖 jose（Web Crypto），不触碰 Prisma。
 * 策略：
 * - `/admin/login` 始终放行（否则无法登录）；
 * - `/admin/*` 页面未登录 → 重定向到 /admin/login?next=<原路径>；
 * - `/api/admin/*` 未登录 → 401 JSON；
 * - access 过期但 refresh 仍有效 → 静默续期后放行（access 15min / refresh 7d）。
 */

const PUBLIC_ADMIN_PATH = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === PUBLIC_ADMIN_PATH) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(COOKIE_ACCESS)?.value;
  const access = await verifyToken(accessToken, "access");
  if (access) {
    return NextResponse.next();
  }

  // access 无效 —— 尝试用 refresh 静默续期
  const refreshToken = request.cookies.get(COOKIE_REFRESH)?.value;
  const refresh = await verifyToken(refreshToken, "refresh");

  if (refresh) {
    try {
      const refreshResponse = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: { cookie: `${COOKIE_REFRESH}=${refreshToken ?? ""}` },
      });

      if (refreshResponse.ok) {
        const response = NextResponse.next();
        const setCookie = refreshResponse.headers.get("set-cookie");
        if (setCookie) response.headers.set("set-cookie", setCookie);
        return response;
      }
    } catch {
      // 续期失败按未登录处理
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { code: 401, message: "未登录或登录已过期", data: null },
      { status: 401 },
    );
  }

  const loginUrl = new URL(PUBLIC_ADMIN_PATH, request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export default proxy;
