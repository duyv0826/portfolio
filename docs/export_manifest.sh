#!/usr/bin/env bash
# ============================================================
# Lighthouse lhins-78odvjjb 数据导出（只读 + 打包）
# 用途：续费恢复实例、开机后立刻跑这个，把数据搬到实例之外。
# 前提：本脚本【在服务器上】执行，不改配置、不停服务。
#
# 排序依据 = 不可再生程度，不是体积。真 P0 通常只有几 MB。
# 实例状态（2026-09-19 实测）：SHUTDOWN + 已隔离，可续费找回窗口约到 2026-10-02。
# 快照 lhsnap-alos1war / lhsnap-plm8jfvz 会随实例释放【同步删除】，不是保险。
# ============================================================
set -uo pipefail

STAMP=$(date +%Y%m%d-%H%M%S)
OUT="${HOME}/exp-${STAMP}"
if [ -e "$OUT" ]; then echo "拒绝复用已存在路径 $OUT"; exit 1; fi
mkdir -p "$OUT"
log(){ echo "[$(date +%H:%M:%S)] $*"; }

# ── ⓪ 机器画像 ──────────────────────────────────────────
log "⓪ 机器画像"
{ hostname; uname -a; date -u; } > "$OUT/00-host.txt" 2>&1
ip -br a >> "$OUT/00-host.txt" 2>&1

# ── ① P0 数据库（最不可再生，丢了就是重建）──────────────
log "① P0 数据库"
command -v docker >/dev/null && docker ps --format '{{.Names}}\t{{.Image}}' > "$OUT/10-docker.txt"
docker ps --format '{{.Names}}' 2>/dev/null | grep -iE 'mysql|maria|postgres|mongo|redis' | while read -r c; do
  if echo "$c" | grep -qiE 'mysql|maria'; then
    docker exec "$c" sh -c 'exec mysqldump --all-databases --single-transaction' > "$OUT/11-${c}.sql" 2>/dev/null
  else
    docker exec "$c" sh -c 'exec pg_dumpall' > "$OUT/11-${c}.sql" 2>/dev/null
  fi
  bytes=$(stat -c%s "$OUT/11-${c}.sql" 2>/dev/null || echo 0)
  log "   $c -> ${bytes} 字节"
  [ "${bytes:-0}" -eq 0 ] && log "   ⚠️ 0 字节 = 没导出成功，必须人工补"
done
command -v mysqldump >/dev/null && mysqldump --all-databases --single-transaction > "$OUT/12-local.sql" 2>/dev/null
find / -xdev \( -name '*.db' -o -name '*.sqlite*' \) 2>/dev/null | grep -vE '/(proc|sys)/' | head -50 > "$OUT/13-sqlite-files.txt"
[ -d /var/lib/docker/volumes ] && sudo tar czf "$OUT/14-docker-volumes.tgz" -C /var/lib/docker volumes 2>/dev/null

# ── ② P0 密钥 / 证书 / .env（含已泄漏的 cos-sync-bot）────
log "② P0 密钥与环境变量"
find /opt /srv /root /var/www /home -maxdepth 4 -name '.env*' 2>/dev/null | tee "$OUT/20-env-files.txt" | while read -r f; do
  mkdir -p "$OUT/20-env/$(dirname "$f")"; sudo cp "$f" "$OUT/20-env/$f" 2>/dev/null
done
sudo tar czf "$OUT/21-certs.tgz" /etc/letsencrypt /etc/ssl/private 2>/dev/null
# ⚠️ 拿到后立刻轮换 cos-sync-bot 子账号密钥（该密钥已泄漏事件在案）
grep -rlIsiE 'SecretId|SecretKey|TC3' /opt /srv /root /var/www 2>/dev/null | head -30 > "$OUT/22-cred-hits.txt"

# ── ③ P1 服务端配置 ─────────────────────────────────────
log "③ P1 配置"
nginx -T 2>/dev/null > "$OUT/30-nginx-full.conf" || sudo cp -r /etc/nginx "$OUT/30-nginx" 2>/dev/null
sudo cp -r /etc/systemd/system "$OUT/31-systemd" 2>/dev/null
crontab -l > "$OUT/32-crontab.txt" 2>/dev/null
sudo crontab -l > "$OUT/32-crontab-root.txt" 2>/dev/null
find /opt /srv /root -maxdepth 3 -name 'docker-compose*.y*ml' 2>/dev/null | while read -r f; do
  cp "$f" "$OUT/33-$(basename "$f")" 2>/dev/null; done

# ── ④ P1 自研源码（核对是否真在 git 里）─────────────────
log "④ P1 源码"
find /opt /srv /var/www /root /home -maxdepth 4 -type d -name .git 2>/dev/null > "$OUT/40-git-repos.txt"
while read -r r; do
  d=$(dirname "$r"); n=$(echo "$d" | tr '/' '_')
  ( cd "$d" && { git rev-parse HEAD; git remote -v; git for-each-ref --format='%(refname) %(objectname)'; } ) \
    > "$OUT/41-repo${n}.txt" 2>&1
done < "$OUT/40-git-repos.txt"
log "   git 仓库线索：$(wc -l < "$OUT/40-git-repos.txt") 个（remote 为空 ≠ 没有别的副本，需去平台核对 SHA）"

# ── ⑤ P2 业务数据（图床上传目录，抽查时间戳别默认已同步）──
log "⑤ P2 业务数据"
for d in /var/www /opt /srv /data /root/uploads; do
  [ -d "$d" ] && sudo tar czf "$OUT/50-$(basename "$d").tgz" -C "$(dirname "$d")" "$(basename "$d")" 2>/dev/null \
    && log "   已打包 $d"
done
# 抽查：图床文件最近修改时间（确认是否真的同步到 COS）
find /var/www /opt /srv -maxdepth 5 -type f 2>/dev/null | head -200 | xargs -r stat -c '%y %n' 2>/dev/null \
  | sort -r | head -20 > "$OUT/51-recent-business-files.txt"

# ── ⑥ P3 包列表 ─────────────────────────────────────────
log "⑥ P3 包列表"
(dpkg -l 2>/dev/null | awk '{print $2"\t"$3}') > "$OUT/60-packages.txt" 2>/dev/null

# ── ⑦ 清单 + 校验和（sudo 一起跑，免得跳过 root 600 文件）──
log "⑦ 清单与校验和"
sudo chown -R "$(id -u):$(id -g)" "$OUT" 2>/dev/null
( cd "$OUT" && find . -type f -printf '%10s  %p\n' 2>/dev/null | sort -k2 ) > "$OUT/MANIFEST.txt"
( cd "$OUT" && find . -type f ! -name SHA256SUMS -exec sha256sum {} + ) > "$OUT/SHA256SUMS"
du -sh "$OUT" | tee "$OUT/SIZE.txt"

# 0 字节文件 = 静默失败的头号特征，直接点名
echo "--- 0 字节产物（每个都要人工确认）---" | tee "$OUT/00-zero-byte.txt"
find "$OUT" -type f -size 0 2>/dev/null | tee -a "$OUT/00-zero-byte.txt"

cat <<EOF

════════════════════════════════════════════
导出完成：$OUT   总大小：$(cut -f1 "$OUT/SIZE.txt")
下一步：
  1) tar czf ${OUT}.tgz -C "$(dirname "$OUT")" "$(basename "$OUT")"
     （Windows Git Bash 用绝对路径要加 --force-local）
  2) scp <user>@106.52.109.218:${OUT}.tgz ./
  3) 【在本地再验一次】tar -tzf 列条目 + gzip -t + sha256sum -c，确认必查文件都在归档里
  4) 数据库要能打开（SELECT COUNT(*)），不是只看文件大小
  5) 全部验证通过【之后】，再决定续费续多久 / 还是放手
  6) 立刻轮换 cos-sync-bot 子账号密钥（已泄漏）
════════════════════════════════════════════
EOF
