"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icons";
import { ConfirmDialog } from "./confirm-dialog";

/** 留言操作：标记已读 / 删除（删除走二次确认） */
export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function markRead() {
    if (read) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/comments/${id}`, { method: "PATCH" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      setConfirming(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={markRead}
          disabled={read || busy}
          aria-label={read ? "已读" : "标记为已读"}
        >
          {busy ? (
            <Icon.Spinner size={20} className="animate-spin" aria-hidden="true" />
          ) : (
            <Icon.Check size={20} aria-hidden="true" />
          )}
          {read ? "已读" : "标记已读"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setConfirming(true)}
          disabled={busy}
          aria-label="删除留言"
        >
          <Icon.Trash size={20} aria-hidden="true" />
          删除
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        title="删除这条留言？"
        description="删除后不可在前台恢复，请确认已保存需要的联系方式。"
        loading={busy}
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />
    </>
  );
}
