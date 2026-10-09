import { cookies } from "next/headers";
import { ok, serverError, unauthorized } from "@/lib/api";
import { COOKIE_ACCESS, signAccessToken, verifyToken } from "@/lib/auth";

/**
 * POST /api/auth/refresh —— 用 refresh Cookie 静默续期 access。
 *
 * ADR-003：access 15min + refresh 7d 双 httpOnly Cookie；
 * 中间件在 access 过期后会调用此端点，拿到新 access 后继续请求。
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const claims = await verifyToken(refreshToken, "refresh");

  if (!claims) {
    return unauthorized("登录已过期，请重新登录");
  }

  try {
    const accessToken = await signAccessToken({
      id: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
    });
    const response = ok({ refreshed: true });
    response.cookies.set(COOKIE_ACCESS, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
    return response;
  } catch (error) {
    console.error("[auth/refresh] 签发失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
