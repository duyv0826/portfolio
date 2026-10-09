import { defineConfig } from "prisma/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Prisma 7 配置。
 *
 * 与 6.x 的差异（ADR-005 已预警）:
 * - datasource.url 不再写在 schema.prisma，改由本文件的 datasource 提供；
 * - PrismaClient 运行时需通过 adapter 传入连接（见 lib/db.ts）。
 *
 * 轻量读取根目录下的 .env 系列文件，避免为一个 env 读取引入额外依赖。
 */
function loadEnvFiles(): void {
  const candidates = [".env.local", ".env"];
  for (const file of candidates) {
    let raw: string;
    try {
      raw = readFileSync(resolve(process.cwd(), file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvFiles();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
