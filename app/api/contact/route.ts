import { z } from "zod";
import { badRequest, ok, readJson, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import type { ContactRequest } from "@/lib/types";

/**
 * POST /api/contact —— 留言（openapi.yaml /contact）
 *
 * consent 必须为 true（PIPL 明示同意留痕，对应 Comment.consent_at）。
 * honeypot 命中时静默返回成功 —— 不告诉 bot 自己被识别了。
 */

const schema = z.object({
  name: z.string().trim().min(1, "请填写称呼").max(80),
  email: z.string().email("邮箱格式不正确"),
  message: z.string().trim().min(1, "请填写留言内容").max(2000),
  consent: z.literal(true, { message: "必须勾选同意后才能提交" }),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const body = await readJson<ContactRequest & { website?: string }>(request);
  if (!body) return badRequest("请求体不是合法 JSON");

  // honeypot：机器填了就静默放行
  if (typeof body.website === "string" && body.website.length > 0) {
    return ok({ id: "ok" }, 201);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "请求参数不合法");
  }

  try {
    const repo = await getRepo();
    const comment = await repo.createComment({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      consent: true,
    });
    return ok({ id: comment.id }, 201);
  } catch (error) {
    console.error("[contact] 写入失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
