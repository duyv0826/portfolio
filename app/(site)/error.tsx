"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

/** 前台错误边界（DESIGN.md §8 五态之 Error：具体错误 + 可重试） */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] 页面渲染错误：", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="container-page flex max-w-[52ch] flex-col items-start gap-6">
        <Icon.Warning size={24} className="text-danger" aria-hidden="true" />
        <h1
          className="text-2xl text-fg"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-announce)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          页面加载出错了
        </h1>
        <p className="text-base text-fg-2">
          数据量或渲染环节出现了异常。可以重试一次，或返回首页继续浏览。
        </p>
        {error.digest && <p className="font-mono text-xs text-meta">ref: {error.digest}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={reset}>重试</Button>
          <a href="/" className="btn btn-secondary">
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
