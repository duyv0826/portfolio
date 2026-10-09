"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui/primitives";
import { Toast } from "@/components/ui/toast";

/**
 * 订阅表单（DESIGN.md §10.7）。
 *
 * 字段 ≤3、Email 实时校验、成功给 Toast。
 * consent 必须显式勾选 —— openapi SubscribeRequest.required 含 consent，且枚举只允许 true（PIPL 明示同意）。
 * 另加 honeypot 隐藏字段做基础防 spam。
 */
export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请填写有效的邮箱地址");
      return;
    }
    if (!consent) {
      setError("需要先勾选同意接收更新");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent: true,
          source: "联系页 · 订阅区",
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.code !== 0) {
        setError(payload.message ?? "订阅失败，请稍后再试");
        return;
      }
      setEmail("");
      setConsent(false);
      setToast("已订阅，感谢关注");
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          name="email"
          type="email"
          label="邮箱"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error ?? undefined}
          autoComplete="email"
          required
        />

        {/* honeypot：对真实用户不可见，用于拦截裸 bot */}
        <div className="hidden" aria-hidden="true">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <label className="flex items-start gap-3 text-sm text-fg-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>我同意接收创作笔记与作品更新（可随时退订）</span>
        </label>

        <div className="pt-1">
          <Button type="submit" loading={loading}>
            订阅
          </Button>
        </div>
      </form>

      <Toast open={Boolean(toast)} message={toast ?? ""} onClose={() => setToast(null)} />
    </>
  );
}
