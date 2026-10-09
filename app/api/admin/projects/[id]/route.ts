import { badRequest, notFound, ok, readJson, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import { z } from "zod";

/**
 * 后台单条作品（openapi.yaml /api/admin/projects/{id}）
 * GET / PATCH / DELETE（软删除）
 */

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "slug 只能包含小写字母、数字与连字符")
      .optional(),
    title: z.string().min(1).max(200).optional(),
    summary: z.string().min(1).max(500).optional(),
    cover_image_url: z.string().min(1).optional(),
    content_md: z.string().min(1).optional(),
    gallery_urls: z.array(z.string()).nullish(),
    category: z.string().max(40).nullish(),
    tags: z.array(z.string().max(40)).nullish(),
    year: z.number().int().min(1990).max(2100).nullish(),
    role: z.string().max(120).nullish(),
    material_source: z.string().max(300).nullish(),
    license_type: z
      .enum(["original", "cc0", "cc-by", "commercial", "client-owned", "ai-assisted"])
      .nullish(),
    attribution: z.string().max(300).nullish(),
    client_auth_status: z.enum(["not-client", "authorized", "pending"]).nullish(),
  })
  .refine((value) => Object.keys(value).length > 0, "至少需要提供一个待更新字段");

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const repo = await getRepo();
    const project = await repo.adminGetProject(id);
    if (!project) return notFound("作品不存在");
    return ok(project);
  } catch (error) {
    console.error("[admin/project] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("请求体不是合法 JSON");

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "请求参数不合法");
  }

  try {
    const repo = await getRepo();
    const updated = await repo.updateProject(id, parsed.data);
    if (!updated) return notFound("作品不存在");
    return ok(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("P2002") || message.includes("Unique")) {
      return badRequest("slug 已被占用，请换一个");
    }
    console.error("[admin/project] 更新失败：", message);
    return serverError();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const repo = await getRepo();
    const removed = await repo.deleteProject(id);
    if (!removed) return notFound("作品不存在");
    return ok({ id });
  } catch (error) {
    console.error("[admin/project] 删除失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
