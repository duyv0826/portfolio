"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS, SITE, SOCIAL } from "@/lib/site-config";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";

/**
 * 前台顶部导航（DESIGN.md §4.4）。
 * 桌面横栏 / 移动端 Menu 抽屉；选中链接底部 2px accent 下划线。
 */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 路由变化时收起抽屉。按 React 官方做法在渲染期派生，而不是放进 effect
  // （effect 里 setState 会触发级联渲染）。
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-sticky border-b border-border bg-bg/85 backdrop-blur"
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="text-lg text-fg"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-announce)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          {SITE.shortName}
          <span className="ml-2 font-mono text-xs tracking-caps text-meta">HONG</span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="主导航">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-1 text-sm transition-colors",
                isActive(link.href) ? "text-fg" : "text-muted hover:text-fg",
              )}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
              {isActive(link.href) && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[2px] w-full rounded-pill bg-accent"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {SOCIAL.filter((s) => s.icon !== "Mail").map((social) => {
            const Glyph = social.icon === "Github" ? Icon.Github : Icon.Linkedin;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="text-muted transition-colors hover:text-fg"
              >
                <Glyph size={20} aria-hidden="true" />
              </a>
            );
          })}
          <Link href="/contact" className="btn btn-primary">
            联系我
          </Link>
        </div>

        {/* 移动端 */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md text-fg md:hidden"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <Icon.Close size={24} aria-hidden="true" /> : <Icon.Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-bg md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="移动端导航">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex min-h-11 items-center rounded-md px-2 text-base",
                  isActive(link.href) ? "bg-surface-warm text-fg" : "text-fg-2",
                )}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm text-accent-on"
              style={{ fontWeight: "var(--weight-emphasize)" }}
            >
              联系我
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
