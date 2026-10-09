import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { SubscribeForm } from "@/components/site/subscribe-form";
import { SectionHeading } from "@/components/ui/primitives";
import { SITE, SOCIAL } from "@/lib/site-config";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "联系",
  description: `联系 ${SITE.name}，或订阅创作笔记更新。`,
};

/** 联系页（DESIGN.md §10.7）：桌面两列并排，手机单列堆叠 */
export default function ContactPage() {
  return (
    <div className="section-y">
      <div className="container-page flex flex-col gap-16">
        <SectionHeading
          eyebrow="Contact"
          title="聊聊 / 订阅"
          description="作品相关、合作意向，或者只是想交流游戏设计，都可以直接留言。"
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2
                className="text-xl text-fg"
                style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-announce)" }}
              >
                订阅创作笔记
              </h2>
              <p className="max-w-[46ch] text-sm text-muted">
                不定期更新：互动叙事结构、游戏美术流程、工具链实践。不做日常水贴。
              </p>
            </div>
            <div className="card p-6">
              <SubscribeForm />
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2
                className="text-xl text-fg"
                style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-announce)" }}
              >
                留言
              </h2>
              <p className="max-w-[46ch] text-sm text-muted">
                三个字段就够了。留下邮箱，我会尽快回复。
              </p>
            </div>
            <div className="card p-6">
              <ContactForm />
            </div>
          </section>
        </div>

        <section className="flex flex-col gap-4 border-t border-border-soft pt-10">
          <p className="font-mono text-xs tracking-caps text-meta uppercase">其他方式</p>
          <div className="flex flex-wrap gap-3">
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
          </div>
        </section>
      </div>
    </div>
  );
}
