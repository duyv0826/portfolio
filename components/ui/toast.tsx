"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * 轻量 Toast（DESIGN.md §4.9）：右下固定、4s 自动消失、可手动关闭。
 * 入场 translateY + fade 200ms（reduced-motion 由全局媒体查询降级）。
 */
export function Toast({
  open,
  message,
  tone = "success",
  onClose,
}: {
  open: boolean;
  message: string;
  tone?: "success" | "warn" | "danger";
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const glyph =
    tone === "success" ? Icon.Check : tone === "warn" ? Icon.Warning : Icon.Warning;
  const toneClass =
    tone === "success" ? "text-success" : tone === "warn" ? "text-warn" : "text-danger";
  const Glyph = glyph;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ zIndex: "var(--z-toast)" }}
      className="animate-in-up fixed bottom-6 right-6 flex max-w-[calc(100vw-48px)] items-center gap-3 rounded-md border border-border bg-surface p-4 shadow-raised"
    >
      <Glyph size={20} className={cn("shrink-0", toneClass)} aria-hidden="true" />
      <p className="text-sm text-fg">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭提示"
        className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-meta hover:bg-surface-warm"
      >
        <Icon.Close size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
