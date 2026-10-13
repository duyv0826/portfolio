# 洪兄作品集全站 — 多阶段构建（Lighthouse 2核2G / 3Mbps 场景）
# 基线：docs/phase1/architecture.md §0.0（Lighthouse + Docker Compose，node@20-alpine）

# ---------- 阶段 1：依赖 ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 阶段 2：构建 ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate 不需要真实数据库连接；DATABASE_URL 留空时应用回退内存 Mock，
# 因此构建阶段不接触数据库，构建产物与运行时配置解耦。
RUN npx prisma generate && npm run build

# ---------- 阶段 3：运行 ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# standalone 输出：只打包运行时必需的 traced 文件，镜像体积约 150-200MB，
# 对 3Mbps 带宽与 2G 内存是必要的。
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 非 root 运行；next standalone 默认监听 3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# 启动时先应用迁移再起服务；无 DATABASE_URL 时 migrate 会失败，
# 因此仅在显式设置 RUN_MIGRATIONS=true 时执行（本地 Mock 演示跳过）。
CMD ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"true\" ]; then npx prisma migrate deploy; fi; node server.js"]
