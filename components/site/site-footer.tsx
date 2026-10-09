import Link from "next/link";
import { COPYRIGHT_HOLDER, NAV_LINKS, SITE, SOCIAL } from "@/lib/site-config";
import { Icon } from "@/components/ui/icons";

/** 前台页脚：真实信息 + Lucide 图标，禁 emoji */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <p
            className="text-xl text-fg"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-announce)",
              letterSpacing: "var(--tracking-display)",
            }}
          >
            {SITE.shortName}
          </p>
          <p className="max-w-[42ch] text-sm text-muted">{SITE.statement}</p>
          <p className="font-mono text-xs text-meta">
            {SITE.location} · {COPYRIGHT_HOLDER} {year}
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav className="flex flex-wrap gap-6" aria-label="页脚导航">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted hover:text-fg">
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="text-sm text-muted hover:text-fg">
              联系
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {SOCIAL.map((social) => {
              const Glyph =
                social.icon === "Github"
                  ? Icon.Github
                  : social.icon === "Linkedin"
                    ? Icon.Linkedin
                    : Icon.Mail;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted transition-colors hover:text-fg"
                  {...(social.href.startsWith("mailto:")
                    ? {}
                    : { target: "_blank", rel: "noreferrer noopener" })}
                >
                  <Glyph size={20} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
