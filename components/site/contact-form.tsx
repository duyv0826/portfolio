"use client";

import { useState } from "react";
import { Button, Field, TextAreaField } from "@/components/ui/primitives";
import { Toast } from "@/components/ui/toast";

/**
 * 留言表单（DESIGN.md §10.7）：3 字段 + 实时校验 + 提交 Loading + 成功 Toast。
 * consent 显式勾选 —— openapi ContactRequest.required 含 consent（PIPL 明示同意留痕）。
 */
export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string; consent?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const next: typeof errors = {};
    if (values.name.trim().length === 0) next.name = "请填写称呼";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "请填写有效的邮箱地址";
    if (values.message.trim().length === 0) next.message = "请填写留言内容";
    if (!consent) next.consent = "需要先勾选同意条款";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          consent: true,
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.code !== 0) {
        setErrors({ message: payload.message ?? "提交失败，请稍后再试" });
        return;
      }
      setValues({ name: "", email: "", message: "" });
      setConsent(false);
      setToast("留言已送达，我会尽快回复");
    } catch {
      setErrors({ message: "网络异常，请稍后再试" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <Field
          name="name"
          label="称呼"
          placeholder="怎么称呼你"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Field
          name="email"
          type="email"
          label="邮箱"
          placeholder="you@example.com"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <TextAreaField
          name="message"
          label="留言"
          placeholder="想聊什么都可以：项目、想法、合作意向"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          error={errors.message}
          required
        />

        <div className="hidden" aria-hidden="true">
          <input type="text" name="phone" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <label className="flex items-start gap-3 text-sm text-fg-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              setErrors((prev) => ({ ...prev, consent: undefined }));
            }}
            className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
            aria-describedby={errors.consent ? "consent-error" : undefined}
            aria-invalid={errors.consent ? true : undefined}
          />
          <span>我同意本网站保存上述信息用于回复联系</span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="-mt-2 text-sm text-danger">
            {errors.consent}
          </p>
        )}

        <div className="pt-1">
          <Button type="submit" loading={loading}>
            发送留言
          </Button>
        </div>
      </form>

      <Toast open={Boolean(toast)} message={toast ?? ""} onClose={() => setToast(null)} />
    </>
  );
}
