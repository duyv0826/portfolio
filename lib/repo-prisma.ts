import { prisma } from "./db";
import type { Repo } from "./repo";
import type {
  ClientAuthStatus,
  CommentListItem,
  ContactRequest,
  LicenseType,
  Paginated,
  PostDetail,
  PostListItem,
  PostStatus,
  ProjectDetail,
  ProjectListItem,
  SubscribeRequest,
  SubscriptionListItem,
  ProjectCreate,
  ProjectUpdate,
  PostCreate,
  PostUpdate,
} from "./types";

/**
 * PostgreSQL 实现。
 *
 * openapi 契约用连字符枚举（`cc-by`），Prisma enum 不支持连字符（`cc_by`），
 * 因此在边界做一层双向映射 —— 契约对外不变。
 */

const LICENSE_TO_DB = {
  original: "original",
  "cc0": "cc0",
  "cc-by": "cc_by",
  commercial: "commercial",
  "client-owned": "client_owned",
  "ai-assisted": "ai_assisted",
} as const;

const LICENSE_TO_API = {
  original: "original",
  cc0: "cc0",
  cc_by: "cc-by",
  commercial: "commercial",
  client_owned: "client-owned",
  ai_assisted: "ai-assisted",
} as const;

const AUTH_TO_DB = {
  "not-client": "not_client",
  authorized: "authorized",
  pending: "pending",
} as const;

const AUTH_TO_API = {
  not_client: "not-client",
  authorized: "authorized",
  pending: "pending",
} as const;

type ProjectRow = Awaited<ReturnType<typeof prisma.project.findFirst>>;
type PostRow = Awaited<ReturnType<typeof prisma.post.findFirst>>;

const notDeleted = { deletedAt: null } as const;

function mapProject(row: NonNullable<ProjectRow>): ProjectDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    cover_image_url: row.coverImageUrl,
    gallery_urls: row.galleryUrls,
    category: row.category,
    tags: row.tags,
    year: row.year,
    role: row.role,
    material_source: row.materialSource,
    license_type: row.licenseType
      ? (LICENSE_TO_API[row.licenseType] as LicenseType)
      : null,
    attribution: row.attribution,
    client_auth_status: row.clientAuthStatus
      ? (AUTH_TO_API[row.clientAuthStatus] as ClientAuthStatus)
      : null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    content_md: row.contentMd,
  };
}

function mapPost(row: NonNullable<PostRow>): PostDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover_image_url: row.coverImageUrl,
    content_md: row.contentMd,
    tags: row.tags,
    status: row.status as PostStatus,
    published_at: row.publishedAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

/** 去掉正文，只保留列表字段（同 repo-mock.ts：用 delete 避免未使用变量） */
function stripContent<T extends { content_md: string }>(item: T): Omit<T, "content_md"> {
  const clone: Partial<T> = { ...item };
  delete clone.content_md;
  return clone as Omit<T, "content_md">;
}

const stripProjectContent = (p: ProjectDetail): ProjectListItem => stripContent(p);
const stripPostContent = (p: PostDetail): PostListItem => stripContent(p);

function paginate<T>(items: T[], page: number, limit: number, total: number): Paginated<T> {
  return { items, page, limit, total };
}

export const prismaRepo: Repo = {
  // ---------- 作品（公开） ----------
  async listProjects({ page, limit, category }) {
    const where = {
      ...notDeleted,
      ...(category && category !== "all" ? { category } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);
    return paginate(rows.map(mapProject).map(stripProjectContent), page, limit, total);
  },

  async getProjectBySlug(slug) {
    const row = await prisma.project.findFirst({ where: { slug, ...notDeleted } });
    return row ? mapProject(row) : null;
  },

  async listFeaturedProjects(limit) {
    const rows = await prisma.project.findMany({
      where: { ...notDeleted, featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
    const pool =
      rows.length > 0
        ? rows
        : await prisma.project.findMany({ where: notDeleted, take: limit, orderBy: { createdAt: "desc" } });
    return pool.map(mapProject).map(stripProjectContent);
  },

  async listRelatedProjects(slug, limit) {
    const rows = await prisma.project.findMany({
      where: { ...notDeleted, slug: { not: slug } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(mapProject).map(stripProjectContent);
  },

  // ---------- 作品（管理） ----------
  async adminListProjects({ page, limit, status }) {
    const where = {
      ...notDeleted,
      ...(status && status !== "all" ? { featured: status === "featured" } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);
    return paginate(rows.map(mapProject).map(stripProjectContent), page, limit, total);
  },

  async adminGetProject(id) {
    const row = await prisma.project.findFirst({ where: { id, ...notDeleted } });
    return row ? mapProject(row) : null;
  },

  async createProject(input: ProjectCreate) {
    const row = await prisma.project.create({
      data: {
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        coverImageUrl: input.cover_image_url,
        contentMd: input.content_md,
        galleryUrls: input.gallery_urls ?? [],
        category: input.category ?? null,
        tags: input.tags ?? [],
        year: input.year ?? null,
        role: input.role ?? null,
        materialSource: input.material_source ?? null,
        licenseType: input.license_type ? LICENSE_TO_DB[input.license_type] : null,
        attribution: input.attribution ?? null,
        clientAuthStatus: input.client_auth_status ? AUTH_TO_DB[input.client_auth_status] : null,
      },
    });
    return mapProject(row);
  },

  async updateProject(id, input: ProjectUpdate) {
    const exists = await prisma.project.findFirst({ where: { id, ...notDeleted } });
    if (!exists) return null;
    const row = await prisma.project.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.cover_image_url !== undefined ? { coverImageUrl: input.cover_image_url } : {}),
        ...(input.content_md !== undefined ? { contentMd: input.content_md } : {}),
        ...(input.gallery_urls !== undefined ? { galleryUrls: input.gallery_urls ?? [] } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.tags !== undefined ? { tags: input.tags ?? [] } : {}),
        ...(input.year !== undefined ? { year: input.year } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.material_source !== undefined ? { materialSource: input.material_source } : {}),
        ...(input.license_type !== undefined
          ? { licenseType: input.license_type ? LICENSE_TO_DB[input.license_type] : null }
          : {}),
        ...(input.attribution !== undefined ? { attribution: input.attribution } : {}),
        ...(input.client_auth_status !== undefined
          ? {
              clientAuthStatus: input.client_auth_status
                ? AUTH_TO_DB[input.client_auth_status]
                : null,
            }
          : {}),
      },
    });
    return mapProject(row);
  },

  async deleteProject(id) {
    const exists = await prisma.project.findFirst({ where: { id, ...notDeleted } });
    if (!exists) return false;
    // 软删除：ADR-005 统一 deleted_at
    await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
    return true;
  },

  // ---------- 博客（公开） ----------
  async listPosts({ page, limit }) {
    const publishedStatus = "published" as const;
    const where = { status: publishedStatus, ...notDeleted };
    const [rows, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);
    return paginate(rows.map(mapPost).map(stripPostContent), page, limit, total);
  },

  async getPostBySlug(slug) {
    const row = await prisma.post.findFirst({
      where: { slug, status: "published" as const, ...notDeleted },
    });
    return row ? mapPost(row) : null;
  },

  // ---------- 博客（管理） ----------
  async adminListPosts({ page, limit, status }) {
    const where = { ...notDeleted, ...(status ? { status } : {}) };
    const [rows, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);
    return paginate(rows.map(mapPost).map(stripPostContent), page, limit, total);
  },

  async adminGetPost(id) {
    const row = await prisma.post.findFirst({ where: { id, ...notDeleted } });
    return row ? mapPost(row) : null;
  },

  async createPost(input: PostCreate) {
    const row = await prisma.post.create({
      data: {
        slug: input.slug,
        title: input.title,
        contentMd: input.content_md,
        excerpt: input.excerpt ?? null,
        coverImageUrl: input.cover_image_url ?? null,
        tags: input.tags ?? [],
        status: input.status,
        publishedAt: input.published_at ? new Date(input.published_at) : null,
      },
    });
    return mapPost(row);
  },

  async updatePost(id, input: PostUpdate) {
    const exists = await prisma.post.findFirst({ where: { id, ...notDeleted } });
    if (!exists) return null;
    const row = await prisma.post.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content_md !== undefined ? { contentMd: input.content_md } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.cover_image_url !== undefined ? { coverImageUrl: input.cover_image_url } : {}),
        ...(input.tags !== undefined ? { tags: input.tags ?? [] } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.published_at !== undefined
          ? { publishedAt: input.published_at ? new Date(input.published_at) : null }
          : {}),
      },
    });
    return mapPost(row);
  },

  async deletePost(id) {
    const exists = await prisma.post.findFirst({ where: { id, ...notDeleted } });
    if (!exists) return false;
    await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
    return true;
  },

  // ---------- 留言 / 订阅 ----------
  async createComment(input: ContactRequest) {
    const now = new Date();
    const row = await prisma.comment.create({
      data: {
        name: input.name,
        email: input.email,
        message: input.message,
        type: "message",
        consentAt: now,
      },
    });
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      type: row.type as CommentListItem["type"],
      read_at: row.readAt?.toISOString() ?? null,
      consent_at: row.consentAt?.toISOString() ?? null,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    };
  },

  async adminListComments({ page, limit }) {
    const where = notDeleted;
    const [rows, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);
    const items: CommentListItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      type: (row.type === "subscribe_note" ? "subscribe_note" : "message") as CommentListItem["type"],
      read_at: row.readAt?.toISOString() ?? null,
      consent_at: row.consentAt?.toISOString() ?? null,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    }));
    return paginate(items, page, limit, total);
  },

  async markCommentRead(id) {
    const exists = await prisma.comment.findFirst({ where: { id, ...notDeleted } });
    if (!exists) return false;
    await prisma.comment.update({ where: { id }, data: { readAt: new Date() } });
    return true;
  },

  async deleteComment(id) {
    const exists = await prisma.comment.findFirst({ where: { id, ...notDeleted } });
    if (!exists) return false;
    await prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } });
    return true;
  },

  async createSubscription(input: SubscribeRequest) {
    const now = new Date();
    const existing = await prisma.subscription.findFirst({
      where: { email: input.email, ...notDeleted },
    });
    if (existing) {
      const row = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          consentAt: now,
          unsubscribedAt: null,
          source: input.source ?? existing.source,
          name: input.name ?? existing.name,
        },
      });
      return mapSubscription(row);
    }
    const row = await prisma.subscription.create({
      data: {
        email: input.email,
        name: input.name ?? null,
        source: input.source ?? null,
        consentAt: now,
      },
    });
    return mapSubscription(row);
  },

  async adminListSubscriptions({ page, limit }) {
    const where = notDeleted;
    const [rows, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);
    return paginate(rows.map(mapSubscription), page, limit, total);
  },

  // ---------- 统计 ----------
  async stats() {
    const [projectCount, publishedPostCount, draftPostCount, unreadCommentCount, subscriptionCount] =
      await Promise.all([
        prisma.project.count({ where: notDeleted }),
        prisma.post.count({ where: { status: "published", ...notDeleted } }),
        prisma.post.count({ where: { status: "draft", ...notDeleted } }),
        prisma.comment.count({ where: { readAt: null, ...notDeleted } }),
        prisma.subscription.count({ where: { unsubscribedAt: null, ...notDeleted } }),
      ]);
    return {
      projectCount,
      publishedPostCount,
      draftPostCount,
      unreadCommentCount,
      subscriptionCount,
    };
  },
};

function mapSubscription(row: {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  consentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  unsubscribedAt: Date | null;
}): SubscriptionListItem {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    source: row.source,
    consent_at: row.consentAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    unsubscribed_at: row.unsubscribedAt?.toISOString() ?? null,
  };
}
