"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icons";
import { ConfirmDialog } from "./confirm-dialog";

/**
 * 表格行操作：查看 / 编辑 / 删除。
 * 图标按钮必须带 aria-label（DESIGN.md §4.5）。删除走二次确认。
 */
export function RowActions({
  id,
  kind,
  publicPath,
}: {
  id: string;
  kind: "projects" | "posts";
  publicPath?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/${kind}/${id}`, { method: "DELETE" });
      if (!response.ok) return;
      setConfirming(false);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {publicPath && (
        <Link
          href={publicPath}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="在前台查看"
          className="flex h-9 w-9 items-center justify-center rounded-sm text-muted hover:bg-surface-warm hover:text-fg"
        >
          <Icon.View size={20} aria-hidden="true" />
        </Link>
      )}
      <Link
        href={`/admin/${kind === "projects" ? "works" : "posts"}/${id}/edit`}
        aria-label="编辑"
        className="flex h-9 w-9 items-center justify-center rounded-sm text-muted hover:bg-surface-warm hover:text-fg"
      >
        <Icon.Edit size={20} aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="删除"
        className="flex h-9 w-9 items-center justify-center rounded-sm text-muted hover:bg-surface-warm hover:text-danger"
      >
        <Icon.Trash size={20} aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={confirming}
        title={kind === "projects" ? "删除这件作品？" : "删除这篇文章？"}
        description="删除后前台将不再显示。系统会做软删除，可在数据库中恢复。"
        loading={deleting}
        onCancel={() => setConfirming(false)}
        onConfirm={onDelete}
      />
    </div>
  );
}
