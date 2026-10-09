"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icons";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "概览", icon: "Dashboard" },
  { href: "/admin/works", label: "作品", icon: "Works" },
  { href: "/admin/posts", label: "博客", icon: "Posts" },
  { href: "/admin/messages", label: "留言", icon: "Messages" },
];

/** 手机端底部 TabBar（DESIGN.md §10.9：≤5 项，Lucide 24px，触控 ≥44px） */
export function AdminTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex items-stretch justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const Glyph = Icon[tab.icon];
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 min-w-11 flex-1 flex-col items-center justify-center gap-1 text-xs",
              active ? "text-accent" : "text-muted",
            )}
          >
            <Glyph size={24} aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
