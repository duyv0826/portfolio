# 作品集全站 — Lighthouse 部署手册（deploy/）

> 基线：`docs/phase1/architecture.md` §0.0（腾讯云 Lighthouse 广州 lhins-78odvjjb，2核2G/3Mbps，Docker Compose + PostgreSQL 16 + Caddy + COS 图床）。
> 状态：Phase 3 代码骨架已就绪（typecheck/lint/build 全绿），本文档为部署预演物料，尚未在服务器执行过。

## 0. 端口协调（先读这条，最重要）

服务器上**已有** new-api、imgbed、主页三个服务在跑。若主页已占用 80/443，本 compose 的 caddy 会**端口冲突起不来**。上服务器第一件事是确认：

```bash
ss -tlnp | grep -E ':(80|443|3000)\s'   # 看谁占了 80/443
docker ps --format '{{.Names}}  {{.Ports}}'
```

两种处理：
- **80/443 空闲** → 直接 `docker compose up -d`，caddy 全权接管；
- **80/443 被主页占用** → 作品集先只用 3000 端口验证（临时把 Caddyfile 首行改为 `:80` 之前，先从 compose 摘掉 caddy 的 ports，或给 caddy 换 8080），域名备案落地后再统一收口到 Caddy。

## 1. 首次部署（服务器上，约 40-60 分钟，大头是 3Mbps 拉镜像）

```bash
# 0) 拉代码（分支 nextjs-migration）
cd /opt && git clone -b nextjs-migration https://github.com/duyv0826/portfolio.git hongxiong-portfolio
cd hongxiong-portfolio

# 1) 环境变量（值自己填，绝不上传）
cp .env.example .env.local
#   必填：POSTGRES_PASSWORD / AUTH_SECRET(openssl rand -base64 48) / ADMIN_EMAIL / ADMIN_PASSWORD_HASH
#   ADMIN_PASSWORD_HASH 本地生成：npm run hash-password（明文不入库）
#   NEXT_PUBLIC_SITE_URL 先填 http://<服务器IP>:3000，备案后再改正式域名
#   另建 deploy/.env 放 POSTGRES_PASSWORD 与 SITE_DOMAIN（compose 读取）

# 2) 构建并启动（首次约 15 分钟拉 node:20-alpine 镜像 + npm ci）
cd deploy && docker compose up -d --build

# 3) 应用数据库迁移（compose 已设 RUN_MIGRATIONS=true 会自动跑；手动兜底：）
docker compose exec app npx prisma migrate deploy

# 4) 写入首个管理员（本地生成 hash 后，在服务器容器内 seed 或直接 SQL insert users 表）
```

## 2. 后续更新

```bash
cd /opt/hongxiong-portfolio && git pull
cd deploy && docker compose up -d --build app
```

## 3. 服务级排查命令包（防火墙放通后立即跑）

```bash
# 三服务现状
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
systemctl --failed --no-pager
ss -tlnp | head -20
free -m && df -h / && uptime
# 作品集三件套日志（部署后）
docker compose -f /opt/hongxiong-portfolio/deploy/docker-compose.yml logs --tail=50 app postgres caddy
```

## 4. 备份（PostgreSQL 自管，必须定期）

```bash
docker exec portfolio-db pg_dump -U portfolio portfolio | gzip > ~/pgdump_$(date +%F).sql.gz
# 建议每周一次，保留 4 份；与 zcode 备份节奏对齐
```

## 5. 已知约束

- **2核2G**：三个容器常驻约 500-600MB，已给 PG 配小内存参数；勿再叠加重服务；
- **3Mbps**：首次构建慢属正常；后续只重编 app 层；
- **备案**：域名解析到大陆服务器前须完成 ICP 备案（个人备案禁电商/社区，本站无此类功能，不受限）；备案周期以周计，列入 Phase 4 并行任务；
- **COS 图床**：密钥走服务器环境变量，`next.config.ts` 的 remotePatterns 已锁定 COS 域名。
