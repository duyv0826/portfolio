"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, TextAreaField } from "@/components/ui/primitives";
import type { PostDetail, PostStatus } from "@/lib/types";

/** 博客新建 / 编辑表单。默认按 draft 保存 —— 避免手滑把半成品发出去。 */

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  tags_text: string;
  cover_image_url: string;
  status: PostStatus;
  published_at: string;
}

function initialState(post?: PostDetail): FormState {
  return {
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content_md: post?.content_md ?? "",
    tags_text: post?.tags?.join(", ") ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    status: post?.status ?? "draft",
    published_at: post?.published_at ? post.published_at.slice(0, 16) : "",
  };
}

export function PostForm({ post }: { post?: PostDetail }) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() => initialState(post));
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

    // 本地 datetime-local 值 → UTC ISO；留空则不传（由服务端按 status 处置）
    let publishedAt: string | null = null;
    if (values.published_at) {
      const parsed = new Date(values.published_at);
      publishedAt = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }

    const payload = {
      slug: values.slug,
      title: values.title,
      content_md: values.content_md,
      excerpt: values.excerpt || null,
      cover_image_url: values.cover_image_url || null,
      tags,
      status: values.status,
      published_at: publishedAt,
    };

    setLoading(true);
    try {
      const url = post ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
      const response = await fetch(url, {
        method: post ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.code !== 0) {
        setError(result.message ?? "保存失败，请稍后再试");
        return;
      }
      router.push("/admin/posts");
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
          hint="小写字母、数字与连字符"
          value={values.slug}
          onChange={(event) => update("slug", event.target.value)}
          required
        />
      </div>

      <Field
        name="excerpt"
        label="摘要"
        hint="列表页展示，留空则不显示摘要行"
        value={values.excerpt}
        onChange={(event) => update("excerpt", event.target.value)}
      />

      <TextAreaField
        name="content_md"
        label="正文（Markdown）"
        value={values.content_md}
        onChange={(event) => update("content_md", event.target.value)}
        className="min-h-[360px] font-mono"
        required
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Field
          name="tags_text"
          label="标签（逗号分隔）"
          value={values.tags_text}
          onChange={(event) => update("tags_text", event.target.value)}
        />
        <Field
          name="cover_image_url"
          label="封面图 URL（可选）"
          value={values.cover_image_url}
          onChange={(event) => update("cover_image_url", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="status"
            className="text-sm text-fg-2"
            style={{ fontWeight: "var(--weight-emphasize)" }}
          >
            发布状态
          </label>
          <select
            id="status"
            className="field"
            value={values.status}
            onChange={(event) => update("status", event.target.value as PostStatus)}
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </div>
        <Field
          name="published_at"
          label="发布时间"
          type="datetime-local"
          hint="留空则按当前时间处理"
          value={values.published_at}
          onChange={(event) => update("published_at", event.target.value)}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {post ? "保存修改" : "创建文章"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/posts")}>
          取消
        </Button>
      </div>
    </form>
  );
}
