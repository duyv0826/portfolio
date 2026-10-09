import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTabBar } from "@/components/admin/admin-tabbar";
import { COOKIE_ACCESS, COOKIE_REFRESH, verifyToken } from "@/lib/auth";

/**
 * 后台控制台外壳（路由组 (console)）。
 *
 * `/admin/login` 在本组之外，因此登录页不会被套进 Sidebar。
 * middleware 已拦过一道，这里再校验一次（纵深防御：防止 matcher 变更或绕过时后台裸奔）。
 */
async function readIdentity() {
  const cookieStore = await cookies();
  const access = await verifyToken(cookieStore.get(COOKIE_ACCESS)?.value, "access");
  if (access) return { email: access.email };
  const refresh = await verifyToken(cookieStore.get(COOKIE_REFRESH)?.value, "refresh");
  return refresh ? { email: refresh.email } : null;
}

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const identity = await readIdentity();
  if (!identity) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-surface-warm pb-16 md:pb-0">
      {/* 桌面固定 Sidebar 240px */}
      <aside className="hidden w-[240px] shrink-0 border-r border-border md:block">
        <AdminSidebar email={identity.email} />
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>

      {/* 手机底部 TabBar */}
      <nav
        className="fixed inset-x-0 bottom-0 md:hidden"
        style={{ zIndex: "var(--z-sticky)" }}
        aria-label="后台导航"
      >
        <AdminTabBar />
      </nav>
    </div>
  );
}
