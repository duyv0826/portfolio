import { mockRepo } from "./repo-mock";
import { hasDatabase } from "./repo";
import type { Repo } from "./repo";

/**
 * 仓储工厂。
 *
 * 有 DATABASE_URL → Prisma / PostgreSQL；否则 → 内存 Mock。
 * Prisma 实现走动态 import，避免未执行 `prisma generate` 时静态依赖拖垮构建。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: Repo | null = null;

async function loadRepo(): Promise<Repo> {
  if (cached) return cached;

  if (hasDatabase()) {
    try {
      const mod = await import("./repo-prisma");
      cached = mod.prismaRepo;
      return cached;
    } catch (err) {
      // 数据库不可用（未 generate / 连接失败）时降级到内存源，站点仍可浏览。
      console.warn(
        "[repo] Prisma 实现加载失败，已降级到内存数据源：",
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  cached = mockRepo;
  return cached;
}

export function getRepo(): Promise<Repo> {
  return loadRepo();
}

/** 同步版：仅用于已确认无数据库的场合（如静态页面生成）。谨慎使用。 */
export function getMockRepo(): Repo {
  return mockRepo;
}
