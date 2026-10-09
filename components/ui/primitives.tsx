"use client";

import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icons";

/**
 * 原子组件层。
 *
 * 纪律（DESIGN.md §4 / P0）：
 * - 颜色一律令牌类或组件类，禁止组件内硬编码 hex（例外仅 #FFFFFF/#000000，本文件未使用）；
 * - 图标一律来自 components/ui/icons.ts 白名单，尺寸 16/20/24；
 * - 交互元素必须有可见焦点环与 aria-label。
 */

/* ---------------- Button ---------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "default" | "lg";
  loading?: boolean;
  icon?: IconName;
  iconPosition?: "left" | "right";
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "default",
  loading = false,
  icon,
  iconPosition = "left",
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const Glyph = icon ? Icon[icon] : null;
  const iconSize = 20;
  return (
    <button
      className={cn(
        "btn",
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "ghost" && "btn-ghost",
        variant === "danger" && "btn-danger",
        size === "lg" && "btn-lg",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Icon.Spinner size={iconSize} className="animate-spin" aria-hidden="true" />
      ) : (
        Glyph && iconPosition === "left" && <Glyph size={iconSize} aria-hidden="true" />
      )}
      {children}
      {Glyph && iconPosition === "right" && !loading && <Glyph size={iconSize} aria-hidden="true" />}
    </button>
  );
}

/* ---------------- Badge ---------------- */

type BadgeTone = "neutral" | "success" | "warn" | "danger" | "accent";

const badgeToneClass: Record<BadgeTone, string> = {
  neutral: "bg-surface-warm text-fg-2",
  success: "bg-success/12 text-success",
  warn: "bg-warn/12 text-warn",
  danger: "bg-danger/12 text-danger",
  accent: "bg-accent/12 text-accent",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-[10px] py-[2px] text-xs tracking-caps",
        badgeToneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Field ---------------- */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Field({ label, hint, error, id, className, ...rest }: FieldProps) {
  const fieldId = id ?? rest.name ?? label;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="text-sm text-fg-2"
        style={{ fontWeight: "var(--weight-emphasize)" }}
      >
        {label}
        {rest.required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={fieldId}
        className={cn("field", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-meta">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextAreaField({ label, hint, error, id, className, ...rest }: TextAreaFieldProps) {
  const fieldId = id ?? rest.name ?? label;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="text-sm text-fg-2"
        style={{ fontWeight: "var(--weight-emphasize)" }}
      >
        {label}
        {rest.required && <span className="text-danger"> *</span>}
      </label>
      <textarea
        id={fieldId}
        className={cn("field min-h-[120px]", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-meta">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------------- EmptyState ---------------- */

export function EmptyState({
  icon = "EmptyDoc",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const Glyph = Icon[icon];
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Glyph size={24} className="text-meta" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <p className="text-lg text-fg" style={{ fontWeight: "var(--weight-emphasize)" }}>
          {title}
        </p>
        {description && <p className="max-w-[42ch] text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Skeleton ---------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-warm", className)} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/* ---------------- SectionHeading ---------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow && (
        <span className="font-mono text-xs tracking-caps text-meta uppercase">{eyebrow}</span>
      )}
      <h2
        id={id}
        className="text-2xl text-fg md:text-3xl"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--weight-announce)",
          letterSpacing: "var(--tracking-display)",
          lineHeight: "var(--leading-tight)",
        }}
      >
        {title}
      </h2>
      {description && <p className="max-w-[56ch] text-base text-fg-2">{description}</p>}
    </div>
  );
}
