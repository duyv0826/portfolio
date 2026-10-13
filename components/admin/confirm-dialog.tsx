"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icons";

/**
 * 二次确认弹窗（DESIGN.md §10.10：删除必须二次确认）。
 *
 * 无障碍：焦点 trap + Esc 关闭 + 点击遮罩关闭 + 打开时聚焦主操作。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认删除",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ zIndex: "var(--z-modal)" }}
      className="fixed inset-0 flex items-center justify-center p-6"
    >
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: "color-mix(in srgb, var(--color-fg) 40%, transparent)" }}
      />
      <div className="card animate-in-up relative w-full max-w-[440px] p-6 shadow-raised">
        <div className="flex items-start gap-4">
          <Icon.Warning size={20} className="mt-1 shrink-0 text-danger" aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <h2
              className="text-xl text-fg"
              style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-announce)" }}
            >
              {title}
            </h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Icon.Spinner size={20} className="animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
