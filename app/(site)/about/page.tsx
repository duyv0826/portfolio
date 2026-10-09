import type { Metadata } from "next";
import Link from "next/link";
import { EDUCATION, SITE, SKILLS, SOCIAL } from "@/lib/site-config";
import { Badge, SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "关于",
  description: `${SITE.name} — ${SITE.tagline}。${SITE.statement}`,
};

/** 关于页（DESIGN.md §10.6）：身份陈述 + 时间线 + 技能矩阵 + 联系入口 */
export default function AboutPage() {
  return (
    <div className="section-y">
      <div className="container-page flex flex-col gap-16">
        {/* 身份陈述 */}
        <section className="flex flex-col gap-4">
          <h1
            className="text-3xl text-fg md:text-4xl"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-announce)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            {SITE.name}
          </h1>
          <p className="font-mono text-sm tracking-tight text-muted">{SITE.tagline}</p>
          <div className="flex max-w-[62ch] flex-col gap-4 pt-2 text-base text-fg-2">
            <p>
              本科是计算机科学与技术，硕士转向互动媒体艺术 ·
              游戏设计。这个组合决定了我做事的方式：既关心一件作品在体验上是否成立，也关心它能不能被稳定地做出来、被持续地改下去。
            </p>
            <p>
              目前在做的几件事都围绕同一个方向——把抽象的叙事结构做成可以玩、可以扩展的系统，而不是一次性写完就锁死的东西。
            </p>
          </div>
        </section>

        {/* 经历时间线 + 技能矩阵 */}
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Education" title="经历" />
            <ol className="flex flex-col gap-8 border-l border-border pl-6">
              {EDUCATION.map((item) => (
                <li key={item.title} className="relative flex flex-col gap-2">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[27px] top-2 h-2 w-2 rounded-pill bg-accent"
                  />
                  <span className="font-mono text-xs tracking-caps text-meta">{item.period}</span>
                  <p
                    className="text-lg text-fg"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: "var(--weight-emphasize)",
                      letterSpacing: "var(--tracking-tight)",
                    }}
                  >
                    {item.title}
                  </p>
                  <p className="text-sm text-fg-2">{item.org}</p>
                  <p className="text-sm text-muted">{item.note}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Skills" title="技能矩阵" />
            <div className="flex flex-col gap-6">
              {SKILLS.map((group) => (
                <div key={group.group} className="flex flex-col gap-3">
                  <p className="font-mono text-xs tracking-caps text-meta uppercase">
                    {group.group}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 联系方式入口 */}
        <section className="card flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h2
              className="text-xl text-fg"
              style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-announce)" }}
            >
              聊聊创作，或者一起做点东西
            </h2>
            <p className="text-sm text-muted">{SITE.location} · 邮件与社交账号都在下方。</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
                  className="btn btn-secondary"
                  {...(social.href.startsWith("mailto:")
                    ? {}
                    : { target: "_blank", rel: "noreferrer noopener" })}
                >
                  <Glyph size={20} aria-hidden="true" />
                  {social.label}
                </a>
              );
            })}
            <Link href="/contact" className="btn btn-primary">
              留言 / 订阅
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
