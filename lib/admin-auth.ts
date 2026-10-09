import bcrypt from "bcryptjs";
import type { UserPublic } from "./types";

/**
 * 管理员凭据校验。
 *
 * 两条路径：
 * 1. 配置了 DATABASE_URL —— 走 users 表 + bcrypt 校验（正式路径）；
 * 2. 无数据库 —— 比对 ADMIN_EMAIL / ADMIN_PASSWORD_HASH 环境变量（本地演示路径）。
 *
 * 安全纪律：
 * - 校验失败统一返回 null，不区分「用户不存在」与「密码错误」（DESIGN.md §10.8）；
 * - 明文口令绝不写进代码或日志；本文件不打印任何凭证内容。
 */

export interface AdminIdentity extends UserPublic {
  /** 用于签发 JWT 的稳定标识 */
  id: string;
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<AdminIdentity | null> {
  const normalized = email.trim().toLowerCase();

  if (process.env.DATABASE_URL) {
    return verifyAgainstDatabase(normalized, password);
  }
  return verifyAgainstEnv(normalized, password);
}

async function verifyAgainstDatabase(email: string, password: string): Promise<AdminIdentity | null> {
  try {
    const { prisma } = await import("./db");
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!user) return null;
    const matched = await bcrypt.compare(password, user.passwordHash);
    if (!matched) return null;
    return { id: user.id, email: user.email, name: user.name };
  } catch (error) {
    // 数据库不可用时不应泄漏细节，统一按凭据失败处理
    console.error("[admin-auth] 数据库校验异常：", error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function verifyAgainstEnv(email: string, password: string): Promise<AdminIdentity | null> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) return null;
  if (email !== adminEmail) return null;

  const matched = await bcrypt.compare(password, adminHash);
  if (!matched) return null;

  return { id: adminEmail, email: adminEmail, name: "洪兄" };
}
