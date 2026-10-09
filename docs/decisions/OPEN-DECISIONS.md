# OPEN-DECISIONS — 洪兄作品集全站

| Date | Source | Open Item | Related Constraints | Current Leaning | Blocked By | Resolves When | Status |
|------|--------|-----------|---------------------|-----------------|------------|---------------|--------|
| 2026-10-09 | Phase 1 架构师/PM | 部署基础与 ICP 备案归属 | 域名解析至大陆服务器前须 ICP 备案；个人备案禁电商/社区；现有 Lighthouse 实例 2026-09-15 到期可能已停机 | 复用现有腾讯云 Lighthouse(广州 lhins-78odvjjb,2核2G)+COS(imgbed)；用户需先续费并确认域名/备案现状 | 用户确认实例续费 + 域名与备案现状 | 用户回复后 / Phase 4 前 | OPEN |
| 2026-10-09 | Phase 1 PM | 作品版权结构化字段是否进首版 | 差异化特性 RICE 4.27，贴合游戏设计身份 | 总监裁定：纳入首版（可逆） | 无 | 已裁定 | RESOLVED |
| 2026-10-09 | Phase 1 PM | 订阅/留言是否加 consent_at 留痕(PIPL) | 个人信息保护明示同意留痕 | 总监裁定：纳入（subscriptions/comments 加 consent_at） | 无 | 已裁定 | RESOLVED |

## Resolved
- 版权字段进首版：projects 表含 material_source / license_type / attribution / client_auth_status（架构师 §7 须回写）。
- 暗舞台范围：仅作品详情页局部暗色展台（--stage-bg #0B0B0C），不做全站暗主题。
- consent_at：subscriptions、comments 表各加 consent_at(timestamptz, nullable) 记录明示同意时间。
- 部署基线：复用现有腾讯云 Lighthouse + COS；ICP 备案作为 Phase 4 并行任务 tracked，不阻塞开发。
- Spec 契约：docs/phase1/spec.md（PM 产出，总监采纳为 Phase 1.5 正式 Spec）。
