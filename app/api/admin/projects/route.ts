import { z } from "zod";
import { badRequest, ok, parsePaging, readJson, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import { PAGE_SIZE } from "@/lib/site-config";
import type { ProjectCreate } from "@/lib/types";

/**
 * 后台作品接口（openapi.yaml /api/admin/projects）
 * GET  列表（含草稿）
 * POST 新建
 */

const createSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug 只能包含小写字母、数字与连字符"),
  title: z.string().min(1, "标题不能为空").max(200),
  summary: z.string().min(1, "概述不能为空").max(500),
  cover_image_url: z.string().min(1, "封面图不能为空"),
  content_md: z.string().min(1, "正文不能为空"),
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
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePaging(url.searchParams, PAGE_SIZE.admin);

  try {
    const repo = await getRepo();
    const data = await repo.adminListProjects({ page, limit });
    return ok(data);
  } catch (error) {
    console.error("[admin/projects] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}

export async function POST(request: Request) {
  const body = await readJson<ProjectCreate>(request);
  if (!body) return badRequest("请求体不是合法 JSON");

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "请求参数不合法");
  }

  try {
    const repo = await getRepo();
    const created = await repo.createProject(parsed.data as ProjectCreate);
    return ok(created, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // slug 唯一冲突（Prisma P2002）单独给出可操作提示
    if (message.includes("P2002") || message.includes("Unique")) {
      return badRequest("slug 已被占用，请换一个");
    }
    console.error("[admin/projects] 创建失败：", message);
    return serverError();
  }
}
