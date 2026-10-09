import { cookies } from "next/headers";
import { z } from "zod";
import { badRequest, ok, readJson, serverError, unauthorized } from "@/lib/api";
import { verifyAdminCredentials } from "@/lib/admin-auth";
import {
  ACCESS_TTL_SECONDS,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  REFRESH_TTL_SECONDS,
  cookieOptions,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";

/**
 * POST /api/auth/login —— 管理员登录（openapi.yaml /api/auth/login）
 *
 * ADR-003：成功后下发 access(15min) + refresh(7d) 两个 httpOnly Cookie。
 * 失败统一返回「邮箱或密码不正确」，不区分账号是否存在（DESIGN.md §10.8）。
 */

const schema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位"),
});

export async function POST(request: Request) {
  const body = await readJson<{ email: string; password: string }>(request);
  if (!body) return badRequest("请求体不是合法 JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "请求参数不合法");
  }

  try {
    const identity = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
    if (!identity) {
      return unauthorized("邮箱或密码不正确");
    }

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(identity),
      signRefreshToken(identity),
    ]);

    const response = ok({ id: identity.id, email: identity.email, name: identity.name });
    response.cookies.set(COOKIE_ACCESS, accessToken, cookieOptions(ACCESS_TTL_SECONDS));
    response.cookies.set(COOKIE_REFRESH, refreshToken, cookieOptions(REFRESH_TTL_SECONDS));
    return response;
  } catch (error) {
    console.error("[auth/login] 失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}

/** DELETE /api/auth/logout —— 清除双 Cookie */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_ACCESS);
  cookieStore.delete(COOKIE_REFRESH);
  return ok({ loggedOut: true });
}
