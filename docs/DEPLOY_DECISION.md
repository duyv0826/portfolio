# 部署决策：Lighthouse 实例实况与时间线

生成时间：2026-09-19（数据来自腾讯云轻量 API 实测，非记忆）

## 一、实例实况（只读核查结果）

| 项 | 实测值 |
|---|---|
| 实例 ID | `lhins-78odvjjb`（名称 Ubuntu-3CE7，地域 ap-guangzhou-6） |
| **运行状态** | **SHUTDOWN（已关机）** |
| 计费 | PREPAID（包年包月） |
| 到期时间 | **2026-09-15 09:23:55Z（已过期 4 天）** |
| 最近操作 | **IsolateInstances（隔离）→ SUCCESS**，2026-09-17 01:14:29Z |
| 续费标志 | `DISABLE_NOTIFY_AND_MANUAL_RENEW`（关通知 + 手动续费） |
| 公网 IP | 106.52.109.218（配置 2核2G / 40GB / 3Mbps） |
| 系统盘 | `lhdisk-50krmbk9`，40GB CLOUD_SSD |

### 外部探活（2026-09-19）

- ICMP：发送 2，接收 0，**100% 丢失**
- 端口 22 / 80 / 443 / 3000 / 8080 / 8090：**全部不可达（Timeout）**

⚠️ 依 `cloud-asset-expiry-triage` 的判读规则，外部不通本不能直接判"服务已死"（防火墙也会挡）。但本例**平台侧状态已是 SHUTDOWN + 隔离**，第二阶段「进机器核对」物理上做不到——SSH 都进不去。所以这里的结论是确定的：**服务已停，不可远程访问**。

## 二、数据还在吗？

### 快照（实测 2 个，均 NORMAL）

| 快照 ID | 名称 | 创建时间 | 盘 |
|---|---|---|---|
| `lhsnap-alos1war` | 20260907_double-protect-portfolio | 2026-09-07 | 系统盘 lhdisk-50krmbk9 |
| `lhsnap-plm8jfvz` | pre-renew-safety-20260905 | 2026-09-05 | 系统盘 lhdisk-50krmbk9 |

### ⚠️ 关键：快照不是保险

腾讯云轻量规则（[欠费与停服说明](https://cloud.tencent.com/document/product/867/44581)、[管理快照](https://cloud.tencent.com/document/api/1093/48546)）：

1. **释放实例时同步删除该实例所有快照** ← 这 2 个快照会随实例一起消失
2. 快照只对系统盘生效
3. 快照 = **回滚点**，不是备份。它救得了"系统被搞坏"，救不了"实例被释放"

**唯一能对抗"实例消失"的，是把数据复制到实例之外。**

## 三、时间线（死线）

| 节点 | 时间 | 状态 |
|---|---|---|
| 到期 | 2026-09-15 09:23 | 已过 |
| 停服 / 隔离 | 2026-09-17 01:14 | 已发生 |
| **待回收期最后可续费找回** | **约 2026-10-02** | ⏳ **剩约 13 天** |
| 释放 + 快照同步删除 | 约 2026-10-02 后 24h 内 | ❌ 数据不可恢复 |

## 四、结构性判断：共同前缀被平台状态吞掉了

常规处置流程是「先导出数据 → 再决定续不续费」（两条路的共同前缀）。**本例做不到**：

```
要数据 → 必须先续费恢复实例 → 开机 → 才能 SSH 导出 → 再决定要不要留
不要数据 → 什么都不做，到 10-02 自动销毁
```

分岔点被平台状态提前了：**「要不要花这笔续费钱」就是唯一决定，没有"先免费导出"这个中间选项。**

## 五、对本作品集的部署建议：不必绑在这台机器上

这个站点是**零依赖纯静态站**（无后端、无数据库、构建产物就是几个文件）。把它部署到一台 2核2G 的包月云主机上，性价比是反的：

| 方案 | 成本 | 适配度 | 风险 |
|---|---|---|---|
| **GitHub Pages**（推荐） | ¥0 | 静态站天然适配；已有 `duyv0826.github.io` 在用 | 极低；外链稳定，符合「图源稳定」红线 |
| Lighthouse 续费后部署 | 月费 | 需要 nginx + rsync + 证书；为一台静态站养一台主机 | 要为"数据还在不在"付一次费；1 年后同样问题再来一遍 |

**结论：作品集走 GitHub Pages；Lighthouse 那台单独按"要不要救数据"决策，两者解耦。**

## 六、状态更新（2026-09-19 已执行）

**作品集已上线，与 Lighthouse 完全解耦：**

- 站点地址：**<https://duyv0826.github.io/portfolio/>**
- 仓库：`duyv0826/portfolio`（**已存在的仓库**，public，创建于 2026-09-11，Pages 早已启用）
- 部署方式：`build_type=legacy`，main 根目录自动部署 —— 所以**没有**改用 Actions 部署（切换会有中断风险，且没必要）
- CI：新增 `.github/workflows/ci.yml`，只做红线门禁（JS 语法 / JSON 可解析 / 无编造外链 / 无 emoji / 无外部依赖 / 图源合规），**首次运行 success**
- 推送方式：`github.com` 的 git 端口在本机网络不可达，改走 `api.github.com` 的 Git Data API（`verify/push_via_api.py`，blob→tree→commit→update-ref，保留历史、不 force）
- 线上核验：title 已是「洪昺森 · 互动媒体艺术与游戏设计作品集」，`hongxiong` 残留 **0**，真实邮箱 / `github.com/duyv0826` / 4 个 `is-todo` 占位均已生效

### 仍待你拍板（只剩这一件）

**Lighthouse 数据要不要救？** 截止约 **2026-10-02**。
要救 → 手动续费恢复实例 → 开机后跑 **`docs/export_manifest.sh`**（在服务器上执行，只读导出，按不可再生程度排序）→ 导出到本地**再验一次**（别在服务器上验完就算）→ 然后才决定续多久 / 放手。
不救 → 什么都不用做，到期自动销毁（含 2 个快照）。

## 七、本地二次验证（归档落地后必做，不做等于没做）

**验源 ≠ 验产物。** 在服务器上跑完 `export_manifest.sh`、看到目录生成，什么都不证明。必须在归档落地的这台机器上再验一遍：传输会出错、路径会撞、权限会变。

```bash
# 1) 下载
scp ubuntu@106.52.109.218:~/exp-XXXXXXXX-HHMMSS.tgz ./

# 2) 先确认校验器自己没坏（反证测试：正向能过 + 5 种破坏都能抓到）
bash docs/verify_archive.sh --self-test

# 3) 再验归档
bash docs/verify_archive.sh exp-XXXXXXXX-HHMMSS.tgz
```

它检查什么：

| 检查 | 抓什么失效 |
|---|---|
| 归档非零 + `gzip -t` | 传输损坏、导出根本没跑 |
| `tar -tzf` 可列出 | 归档不可读 |
| 必查文件**在归档里**存在且非零 | 导出跑了一半 |
| `sha256sum -c` + 条目数 = 文件数 | 内容被改 / 有文件没进校验和 |
| 0 字节扫描 | docker 导出静默失败（0 字节也算"成功"） |
| `.sql` 含 `CREATE TABLE` / `INSERT INTO` | 空导出（不看大小，看内容） |
| sqlite 真跑 `SELECT COUNT(*)` | 数据库打不开 |

### 这个校验器被反证过（不是"看起来能用"）

`--self-test` 会造一个合格归档，再逐个破坏，**每条检查独立受测**（破坏后重新生成校验和，避免 `sha256sum` 一招掩盖其他检查）：

| 用例 | 目标检查 | 结果 |
|---|---|---|
| 未破坏 | 正向不误报 | PASS |
| 删必查文件 | REQUIRED | 抓到 |
| 掏空 SQL 内容 | SQL 结构 | 抓到 |
| 混入 0 字节文件 | 0 字节扫描 | 抓到 |
| 改 .env 内容（不重生成校验和） | sha256sum | 抓到 |
| 截断归档尾部 | gzip 完整性 | 抓到 |

> 第一次跑反证时，它自己抓出了一个真 bug：`printf | while read` 让 `while` 跑在子 shell，里面累加的失败数传不回父进程 → **SQL 检查静默失效**（掏空 SQL 却判定通过）。已改成先落成文件再重定向读。
> 这正是为什么校验器必须先做反证——一个永远通过的检查是负资产。

### 最后一步：真跑 `SELECT COUNT(*)`

文件大小和有没有 `CREATE TABLE` 都不算数。`docs/verify_mysql_dump.py` 分两层，且**不互相冒充**：

```bash
python docs/verify_mysql_dump.py exp-xxx/11-newapi.sql        # A 层 +（可能时）B 层
python docs/verify_mysql_dump.py <file> --no-docker           # 只跑 A 层
python docs/verify_mysql_dump.py --self-test                  # 反证测试
```

| 层 | 做什么 | 能力边界 |
|---|---|---|
| **A 层**（离线，永远可跑） | 括号/引号配对、mysqldump 结尾标记、`CREATE TABLE` 与 `INSERT` 的表名一致、逐表解析行数 | 只能证明**文件结构完整**，**不能**证明能导入、行数对得上 |
| **B 层**（需 docker daemon） | 起临时 `mariadb:11` 容器 → 导入 → **逐表 `SELECT COUNT(*)`** → 与 A 层解析行数**对账** → 销毁容器 | 这才是真验证 |

**环境不具备时（docker 没启动）B 层报 SKIP 并按退出码 1 失败**——绝不用 A 层的通过冒充 B 层。当前本机状态：Docker CLI 29.7.2 已装但 **daemon 未运行**，所以 B 层尚未真跑过。

反证（A 层，已实跑通过）：完整 dump 不误报 / 截断 / 括号不配对 / 只有 INSERT 没有 CREATE / INSERT 引用未定义的表 —— 5 例全部按期望失败。

> 反证又抓出一个真 bug：原先用「一个 alternation + 硬编码 `group(1)`」匹配 `` `db`.`tbl` `` 与 `` `tbl` `` 两种写法，**Python 捕获组按整个 pattern 的左括号顺序编号，不按命中的分支**，表名实际落在 group(5) → 解析出 `None` → 多张表塌进同一个 key → "引用未定义的表"检查静默失效。已改为两个独立命名正则。

⚠️ Windows 下给 Python 传路径要用 `cygpath -w`：Git Bash 的 `/tmp/...` 传给原生 Windows 的 Python 会报"文件不存在"。

## 八、附：续费后的导出优先级（P0 优先，通常只有几 MB）

| 优先级 | 对象 | 备注 |
|---|---|---|
| P0 | new-api 数据库（用户 / 额度 / Key / 订单） | 全机最不可再生 |
| P0 | `.env` / 密钥 / 证书 / token | 含已泄漏的 cos-sync-bot 子账号密钥，需一并轮换 |
| P1 | nginx / systemd unit / cron / compose 配置 | |
| P1 | 自研源码（imgbed 图床、个人主页） | 核对是否已在 git |
| P2 | 图床上传目录 | 抽查时间戳，别默认已同步 COS |
| P3 | `dpkg -l` 包列表 | 便于重建 |

⚠️ 非 root 打包会静默跳过 root 600 的密钥文件 → `tar` / `sha256sum` 需一起 `sudo`。
