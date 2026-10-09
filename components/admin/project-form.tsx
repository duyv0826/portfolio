"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, TextAreaField } from "@/components/ui/primitives";
import type { ClientAuthStatus, LicenseType, ProjectDetail } from "@/lib/types";

/**
 * 作品新建 / 编辑表单。
 *
 * 版权四字段（素材来源 / 授权类型 / 第三方署名 / 委托授权）默认展开 ——
 * Phase 1 OPEN-DECISIONS 已裁定纳入首版，不做折叠，避免填的时候被略过。
 */

const LICENSE_OPTIONS: { value: LicenseType | ""; label: string }[] = [
  { value: "", label: "未指定" },
  { value: "original", label: "原创" },
  { value: "ai-assisted", label: "AI 辅助（须署名说明）" },
  { value: "cc0", label: "CC0 公有领域" },
  { value: "cc-by", label: "CC-BY 署名" },
  { value: "commercial", label: "商业授权素材" },
  { value: "client-owned", label: "委托方所有" },
];

const AUTH_OPTIONS: { value: ClientAuthStatus | ""; label: string }[] = [
  { value: "", label: "未指定" },
  { value: "not-client", label: "非委托项目" },
  { value: "authorized", label: "已获客户授权" },
  { value: "pending", label: "授权待确认" },
];

interface FormState {
  slug: string;
  title: string;
  summary: string;
  cover_image_url: string;
  gallery_urls_text: string;
  category: string;
  tags_text: string;
  year: string;
  role: string;
  material_source: string;
  license_type: LicenseType | "";
  attribution: string;
  client_auth_status: ClientAuthStatus | "";
  content_md: string;
}

function initialState(project?: ProjectDetail): FormState {
  return {
    slug: project?.slug ?? "",
    title: project?.title ?? "",
    summary: project?.summary ?? "",
    cover_image_url: project?.cover_image_url ?? "/works/cover-room-of-choice.svg",
    gallery_urls_text: project?.gallery_urls?.join("\n") ?? "",
    category: project?.category ?? "",
    tags_text: project?.tags?.join(", ") ?? "",
    year: project?.year ? String(project.year) : String(new Date().getFullYear()),
    role: project?.role ?? "",
    material_source: project?.material_source ?? "",
    license_type: project?.license_type ?? "",
    attribution: project?.attribution ?? "",
    client_auth_status: project?.client_auth_status ?? "",
    content_md: project?.content_md ?? "",
  };
}

export function ProjectForm({ project }: { project?: ProjectDetail }) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() => initialState(project));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^[a-z0-9-]+$/.test(values.slug)) {
      setError("slug 只能包含小写字母、数字与连字符");
      return;
    }

    const tags = values.tags_text
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    const gallery = values.gallery_urls_text
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    const payload = {
      slug: values.slug,
      title: values.title,
      summary: values.summary,
      cover_image_url: values.cover_image_url,
      content_md: values.content_md,
      gallery_urls: gallery,
      category: values.category || null,
      tags,
      year: values.year ? Number(values.year) : null,
      role: values.role || null,
      material_source: values.material_source || null,
      license_type: values.license_type || null,
      attribution: values.attribution || null,
      client_auth_status: values.client_auth_status || null,
    };

    setLoading(true);
    try {
      const url = project ? `/api/admin/projects/${project.id}` : "/api/admin/projects";
      const response = await fetch(url, {
        method: project ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.code !== 0) {
        setError(result.message ?? "保存失败，请稍后再试");
        return;
      }
      router.push("/admin/works");
      router.refresh();
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Field
          name="title"
          label="标题"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          required
        />
        <Field
          name="slug"
          label="slug（URL 片段）"
          hint="小写字母、数字与连字符，例如 the-room-of-choice"
          value={values.slug}
          onChange={(event) => update("slug", event.target.value)}
          required
        />
      </div>

      <Field
        name="summary"
        label="一句话概述"
        value={values.summary}
        onChange={(event) => update("summary", event.target.value)}
        required
      />

      <TextAreaField
        name="content_md"
        label="正文（Markdown）"
        hint="建议结构：目标 → 结果 → 解决"
        value={values.content_md}
        onChange={(event) => update("content_md", event.target.value)}
        className="min-h-[280px] font-mono"
        required
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Field
          name="cover_image_url"
          label="封面图 URL"
          hint="本地路径如 /works/xxx.svg，或 COS 地址"
          value={values.cover_image_url}
          onChange={(event) => update("cover_image_url", event.target.value)}
          required
        />
        <Field
          name="category"
          label="分类"
          hint="游戏美术 / 互动装置 / 课程项目"
          value={values.category}
          onChange={(event) => update("category", event.target.value)}
        />
      </div>

      <TextAreaField
        name="gallery_urls_text"
        label="过程图 URL（每行一个）"
        value={values.gallery_urls_text}
        onChange={(event) => update("gallery_urls_text", event.target.value)}
        className="min-h-[100px] font-mono"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Field
          name="tags_text"
          label="标签（逗号分隔）"
          value={values.tags_text}
          onChange={(event) => update("tags_text", event.target.value)}
        />
        <Field
          name="year"
          label="年份"
          inputMode="numeric"
          value={values.year}
          onChange={(event) => update("year", event.target.value)}
        />
      </div>

      <Field
        name="role"
        label="角色 / 个人贡献"
        hint="团队项目请把个人负责的部分写清楚"
        value={values.role}
        onChange={(event) => update("role", event.target.value)}
      />

      <fieldset className="card flex flex-col gap-5 p-6">
        <legend className="px-2 font-mono text-xs tracking-caps text-meta uppercase">
          素材与授权
        </legend>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="license_type"
              className="text-sm text-fg-2"
              style={{ fontWeight: "var(--weight-emphasize)" }}
            >
              授权类型
            </label>
            <select
              id="license_type"
              className="field"
              value={values.license_type}
              onChange={(event) => update("license_type", event.target.value as LicenseType | "")}
            >
              {LICENSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="client_auth_status"
              className="text-sm text-fg-2"
              style={{ fontWeight: "var(--weight-emphasize)" }}
            >
              委托授权状态
            </label>
            <select
              id="client_auth_status"
              className="field"
              value={values.client_auth_status}
              onChange={(event) =>
                update("client_auth_status", event.target.value as ClientAuthStatus | "")
              }
            >
              {AUTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Field
          name="material_source"
          label="素材来源说明"
          value={values.material_source}
          onChange={(event) => update("material_source", event.target.value)}
        />
        <Field
          name="attribution"
          label="第三方素材署名"
          value={values.attribution}
          onChange={(event) => update("attribution", event.target.value)}
        />
      </fieldset>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {project ? "保存修改" : "创建作品"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/works")}>
          取消
        </Button>
      </div>
    </form>
  );
}
