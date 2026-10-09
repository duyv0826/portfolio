/**
 * 日期与阅读时长格式化。
 *
 * 统一走 Intl + 固定时区（Asia/Shanghai），避免服务端渲染与客户端 hydration 结果不一致
 * 导致 React 的水合告警。
 */

const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Shanghai",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return DATE_FORMATTER.format(date);
}

/**
 * 阅读时长估算。
 *
 * 中日韩字符按 400 字/分钟计（远高于英文 200 词/分钟），非中日韩按 260 词/分钟计，
 * 两者加权后向上取整 —— 比单纯除以 300 更接近中文读者的实际体感。
 */
export function readingMinutes(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*`_\-\[\]()!]/g, " ")
    .trim();
  const cjkCount = (plain.match(/[\u4e00-\u9fff\u3040-\u30ff\u3400-\u4dbf]/g) ?? []).length;
  const otherCount = plain.replace(/[\u4e00-\u9fff\u3040-\u30ff\u3400-\u4dbf]/g, "").trim().length;
  const minutes = cjkCount / 400 + otherCount / 1100;
  return Math.max(1, Math.ceil(minutes));
}
