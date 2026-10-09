#!/usr/bin/env node
/**
 * 生成管理员口令的 bcrypt 哈希，用于 .env.local 的 ADMIN_PASSWORD_HASH。
 *
 * 用法：
 *   node scripts/hash-password.mjs
 *
 * 安全纪律：明文口令只在命令行交互中输入，不落盘、不打印、不进 shell history 之外的任何文件。
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

const rl = createInterface({ input: stdin, output: stdout });

try {
  const password = await rl.question("请输入管理员口令（至少 8 位，输入不回显需求由终端决定）：");

  if (password.length < 8) {
    console.error("口令太短，至少需要 8 位");
    process.exitCode = 1;
  } else {
    const hash = await bcrypt.hash(password, ROUNDS);
    console.log("\n把下面这行写进 .env.local：\n");
    console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
    console.log("注意：.env.local 已被 .gitignore 忽略，切勿提交到仓库。");
  }
} finally {
  rl.close();
}
