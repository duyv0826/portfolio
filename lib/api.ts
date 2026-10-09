import { NextResponse } from "next/server";
import type { Envelope } from "./types";

/**
 * API 统一响应外壳 —— 对齐 openapi.yaml components.schemas.Envelope。
 * code: 0 表示成功；非 0 为业务/HTTP 错误码，message 给可读原因。
 */

export function ok<T>(data: T, status = 200): NextResponse<Envelope<T>> {
  return NextResponse.json({ code: 0, message: "", data }, { status });
}

export function fail(
  status: number,
  message: string,
  code: number = status,
): NextResponse<Envelope<null>> {
  return NextResponse.json({ code, message, data: null }, { status });
}

export const badRequest = (message = "请求参数不合法") => fail(400, message);
export const unauthorized = (message = "未登录或登录已过期") => fail(401, message);
export const forbidden = (message = "没有访问权限") => fail(403, message);
export const notFound = (message = "内容不存在") => fail(404, message);
export const tooManyRequests = (message = "操作过于频繁，请稍后再试") => fail(429, message);
export const serverError = (message = "服务器内部错误") => fail(500, message);

/** 解析并校验正整数分页参数，越界或非法时回落默认值 */
export function parsePaging(
  searchParams: URLSearchParams,
  defaultLimit: number,
  maxLimit = 50,
): { page: number; limit: number } {
  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawLimit = Number(searchParams.get("limit") ?? String(defaultLimit));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(Math.floor(rawLimit), maxLimit) : defaultLimit;
  return { page, limit };
}

/** 读取 JSON body，非法 JSON 时返回 null 而不是抛错 */
export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
