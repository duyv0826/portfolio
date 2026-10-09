"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * 后台 Sidebar（DESIGN.md §10.9，Product 寄存器 Linear 式克制）。
 *
 * 选中态为 surface-warm 背景 + 左侧 2px accent 条。
 * 注意：此处左条是**导航选中指示**，不属于被禁的「卡片侧条纹」，设计文档明确允许。
 */

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "概览", icon: "Dashboard" },
  { href: "/admin/works", label: "作品", icon: "Works" },
  { href: "/admin/posts", label: "博客", icon: "Posts" },
  { href: "/admin/messages", label: "留言", icon: "Messages" },
];

export function AdminSidebar({ email }: { email?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function onLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col justify-between bg-surface-warm p-4">
      <div className="flex flex-col gap-6">
        <Link
          href="/admin"
          className="px-2 text-base text-fg"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-announce)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          控制台
        </Link>

        <nav className="flex flex-col gap-1" aria-label="后台导航">
          {NAV_ITEMS.map((item) => {
            const Glyph = Icon[item.icon];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-surface text-fg" : "text-fg-2 hover:bg-surface hover:text-fg",
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-pill bg-accent"
                  />
                )}
                <Glyph size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        {email && <p className="truncate px-2 font-mono text-xs text-meta">{email}</p>}
        <div className="flex flex-col gap-2">
          <Link href="/" className="btn btn-secondary w-full">
            查看前台
          </Link>
          <Button variant="ghost" className="w-full" icon="LogOut" onClick={onLogout}>
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
