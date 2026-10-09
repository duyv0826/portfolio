import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * JWT 工具（Edge 兼容）。
 *
 * ADR-003：自建 JWT，access 15min + refresh 7d，双 httpOnly Cookie。
 * 此模块只依赖 jose（Web Crypto），因此可被 middleware.ts 在 Edge 运行时直接引用；
 * 密码校验用到 bcryptjs，属于 Node-only，单独放在 app/api/auth/login/route.ts。
 *
 * 安全纪律：AUTH_SECRET 严禁出现在 NEXT_PUBLIC_* 变量中，也不得打印到日志。
 */

export const COOKIE_ACCESS = "access_token";
export const COOKIE_REFRESH = "refresh_token";

export const ACCESS_TTL_SECONDS = 15 * 60; // 15min
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7d

export interface SessionClaims extends JWTPayload {
  sub: string;
  email: string;
  name?: string | null;
  typ: "access" | "refresh";
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET 未配置，无法签发会话令牌");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: Omit<SessionClaims, "iat" | "exp">,
  ttlSeconds: number,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(getSecret());
}

export async function signAccessToken(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  return signToken(
    { sub: user.id, email: user.email, name: user.name ?? null, typ: "access" },
    ACCESS_TTL_SECONDS,
  );
}

export async function signRefreshToken(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  return signToken(
    { sub: user.id, email: user.email, name: user.name ?? null, typ: "refresh" },
    REFRESH_TTL_SECONDS,
  );
}

/** 校验失败一律返回 null —— 登录失败不向调用方暴露具体原因细节（DESIGN.md §10.8） */
export async function verifyToken(
  token: string | undefined,
  expected: "access" | "refresh",
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (payload.typ !== expected) return null;
    const claims = payload as SessionClaims;
    if (!claims.sub || !claims.email) return null;
    return claims;
  } catch {
    return null;
  }
}

/** Cookie 公共属性：httpOnly + SameSite=Lax + 生产环境 Secure */
export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
