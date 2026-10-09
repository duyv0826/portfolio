import { badRequest, ok, parsePaging, readJson, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import { PAGE_SIZE } from "@/lib/site-config";
import { z } from "zod";
import type { PostCreate, PostStatus } from "@/lib/types";

/**
 * 后台博客接口（openapi.yaml /api/admin/posts）
 * GET 列表（可按 status=draft|published 过滤）｜ POST 新建
 */

const createSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug 只能包含小写字母、数字与连字符"),
  title: z.string().min(1, "标题不能为空").max(200),
  content_md: z.string().min(1, "正文不能为空"),
  status: z.enum(["published", "draft"]),
  excerpt: z.string().max(500).nullish(),
  cover_image_url: z.string().nullish(),
  tags: z.array(z.string().max(40)).nullish(),
  published_at: z.string().datetime().nullish(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePaging(url.searchParams, PAGE_SIZE.admin);
  const rawStatus = url.searchParams.get("status");
  const status: PostStatus | undefined =
    rawStatus === "published" || rawStatus === "draft" ? rawStatus : undefined;

  try {
    const repo = await getRepo();
    const data = await repo.adminListPosts({ page, limit, status });
    return ok(data);
  } catch (error) {
    console.error("[admin/posts] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}

export async function POST(request: Request) {
  const body = await readJson<PostCreate>(request);
  if (!body) return badRequest("请求体不是合法 JSON");

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "请求参数不合法");
  }

  try {
    const repo = await getRepo();
    const created = await repo.createPost(parsed.data as PostCreate);
    return ok(created, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("P2002") || message.includes("Unique")) {
      return badRequest("slug 已被占用，请换一个");
    }
    console.error("[admin/posts] 创建失败：", message);
    return serverError();
  }
}
