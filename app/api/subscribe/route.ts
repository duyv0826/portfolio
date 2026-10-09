import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, ok, readJson, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import type { SubscribeRequest } from "@/lib/types";

/**
 * POST /api/subscribe —— 订阅（openapi.yaml /subscribe）
 *
 * consent 必须为 true，否则 400（PIPL 明示同意，openapi 里 enum 只允许 true）。
 * 邮箱重复时不报错：更新 consent 时间并清除退订标记，避免枚举式探测已有订阅者。
 */

const schema = z.object({
  email: z.string().email("邮箱格式不正确"),
  name: z.string().max(80).nullish(),
  source: z.string().max(40).nullish(),
  consent: z.literal(true, { message: "必须勾选同意后才能订阅" }),
});

export async function POST(request: Request) {
  const body = await readJson<SubscribeRequest>(request);
  if (!body) return badRequest("请求体不是合法 JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "请求参数不合法");
  }

  try {
    const repo = await getRepo();
    const subscription = await repo.createSubscription({
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      source: parsed.data.source ?? null,
      consent: true,
    });
    // 返回值不暴露邮箱是否存在之外的内部信息
    return ok({ id: subscription.id }, 201);
  } catch (error) {
    console.error("[subscribe] 写入失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
