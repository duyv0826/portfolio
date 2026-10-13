import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import { PAGE_SIZE } from "@/lib/site-config";
import { z } from "zod";

/**
 * 公开读取接口：作品列表 / 博客列表 / 留言提交，分别对应 openapi.yaml 的
 * GET /api/projects、GET /api/projects/{slug}、GET /api/posts、GET /api/posts/{slug}。
 *
 * 只读 + 短缓存：国内 CDN / 百度抓取友好。
 */

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(PAGE_SIZE.works),
  category: z.string().max(40).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
  });
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "查询参数不合法");
  }

  try {
    const repo = await getRepo();
    const data = await repo.listProjects({
      page: parsed.data.page,
      limit: parsed.data.limit,
      category: parsed.data.category,
    });
    return NextResponse.json(
      { code: 0, message: "", data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("[projects] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
