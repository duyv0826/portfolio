"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, Field } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { SITE } from "@/lib/site-config";

/**
 * 后台登录（DESIGN.md §10.8）。
 * 失败只显示统一文案，不区分账号是否存在 —— 避免账号枚举。
 */
function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("请填写邮箱与密码");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok || payload.code !== 0) {
        setError(payload.message ?? "登录失败，请重试");
        return;
      }
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card animate-in-up w-full max-w-[420px] p-8 shadow-raised">
      <div className="mb-6 flex flex-col gap-2">
        <p
          className="text-xl text-fg"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-announce)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          {SITE.shortName} · 控制台
        </p>
        <p className="text-sm text-muted">登录后管理作品、博客与留言。</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <Field
          name="email"
          type="email"
          label="邮箱"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Field
          name="password"
          type="password"
          label="密码"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={error ?? undefined}
          required
        />
        <Button type="submit" loading={loading} icon="Lock">
          登录
        </Button>
      </form>

      <Link href="/" className="mt-6 flex items-center gap-1 text-sm text-muted hover:text-fg">
        <Icon.ChevronLeft size={16} aria-hidden="true" />
        返回前台
      </Link>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-warm p-6">
      <Suspense fallback={<div className="card w-full max-w-[420px] p-8" />}>
        <LoginCard />
      </Suspense>
    </div>
  );
}
