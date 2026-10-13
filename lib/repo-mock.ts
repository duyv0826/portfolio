import { mockComments, mockPosts, mockProjects, mockSubscriptions } from "./mock-data";
import type { Repo } from "./repo";
import type {
  CommentListItem,
  ContactRequest,
  Paginated,
  PostDetail,
  PostListItem,
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
 * 内存实现（本地开发 / 无数据库环境）。
 * 写操作落在模块级副本上，进程重启即还原 —— 这是有意的：它是演示数据源，不是持久层。
 */

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const projects: Mutable<ProjectDetail>[] = mockProjects.map((p) => ({ ...p }));
const posts: Mutable<PostDetail>[] = mockPosts.map((p) => ({ ...p }));
const comments: Mutable<CommentListItem>[] = mockComments.map((c) => ({ ...c }));
const subscriptions: Mutable<SubscriptionListItem>[] = mockSubscriptions.map((s) => ({ ...s }));

const iso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    page,
    limit,
    total: items.length,
  };
}

/**
 * 去掉正文，只保留列表字段。
 * 用 delete 而非 rest 解构 —— 后者会留下一个「已声明但未使用」的变量。
 */
function stripContent<T extends { content_md: string }>(item: T): Omit<T, "content_md"> {
  const clone: Partial<T> = { ...item };
  delete clone.content_md;
  return clone as Omit<T, "content_md">;
}

const toProjectListItem = (p: ProjectDetail): ProjectListItem => stripContent(p);
const toPostListItem = (p: PostDetail): PostListItem => stripContent(p);

const byUpdatedDesc = (a: { updated_at: string }, b: { updated_at: string }) =>
  b.updated_at.localeCompare(a.updated_at);

/**
 * 首页精选（对应 Prisma Project.featured）。
 * 不放进 ProjectListItem —— openapi 契约里没有这个字段，保持前后一致。
 */
const FEATURED_SLUGS = ["the-room-of-choice", "stellar-scavenger", "aoli-lightscape"];

export const mockRepo: Repo = {
  // ---------- 作品（公开） ----------
  async listProjects({ page, limit, category }) {
    const filtered =
      category && category !== "all" ? projects.filter((p) => p.category === category) : projects;
    const sorted = [...filtered].sort(
      (a, b) => (b.year ?? 0) - (a.year ?? 0) || b.created_at.localeCompare(a.created_at),
    );
    return paginate(sorted.map(toProjectListItem), page, limit);
  },

  async getProjectBySlug(slug) {
    return projects.find((p) => p.slug === slug) ?? null;
  },

  async listFeaturedProjects(limit) {
    const featured = FEATURED_SLUGS.map((slug) => projects.find((p) => p.slug === slug)).filter(
      (p): p is ProjectDetail => Boolean(p),
    );
    const pool = featured.length > 0 ? featured : projects;
    return pool.slice(0, limit).map(toProjectListItem);
  },

  async listRelatedProjects(slug, limit) {
    return projects
      .filter((p) => p.slug !== slug)
      .slice(0, limit)
      .map(toProjectListItem);
  },

  // ---------- 作品（管理） ----------
  async adminListProjects({ page, limit }) {
    const sorted = [...projects].sort(byUpdatedDesc);
    return paginate(sorted.map(toProjectListItem), page, limit);
  },

  async adminGetProject(id) {
    return projects.find((p) => p.id === id) ?? null;
  },

  async createProject(input: ProjectCreate) {
    const ts = iso();
    const created: ProjectDetail = {
      id: uuid(),
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      cover_image_url: input.cover_image_url,
      gallery_urls: input.gallery_urls ?? null,
      category: input.category ?? null,
      tags: input.tags ?? null,
      year: input.year ?? null,
      role: input.role ?? null,
      material_source: input.material_source ?? null,
      license_type: input.license_type ?? null,
      attribution: input.attribution ?? null,
      client_auth_status: input.client_auth_status ?? null,
      created_at: ts,
      updated_at: ts,
      content_md: input.content_md,
    };
    projects.unshift(created);
    return created;
  },

  async updateProject(id, input: ProjectUpdate) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const next = { ...projects[idx], ...stripUndefined(input), updated_at: iso() };
    projects[idx] = next;
    return next;
  },

  async deleteProject(id) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    projects.splice(idx, 1);
    return true;
  },

  // ---------- 博客（公开） ----------
  async listPosts({ page, limit }) {
    const published = posts
      .filter((p) => p.status === "published")
      .sort((a, b) => (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at));
    return paginate(published.map(toPostListItem), page, limit);
  },

  async getPostBySlug(slug) {
    return posts.find((p) => p.slug === slug && p.status === "published") ?? null;
  },

  // ---------- 博客（管理） ----------
  async adminListPosts({ page, limit, status }) {
    const filtered = status ? posts.filter((p) => p.status === status) : posts;
    const sorted = [...filtered].sort(byUpdatedDesc);
    return paginate(sorted.map(toPostListItem), page, limit);
  },

  async adminGetPost(id) {
    return posts.find((p) => p.id === id) ?? null;
  },

  async createPost(input: PostCreate) {
    const ts = iso();
    const created: PostDetail = {
      id: uuid(),
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      cover_image_url: input.cover_image_url ?? null,
      content_md: input.content_md,
      tags: input.tags ?? null,
      status: input.status,
      published_at: input.published_at ?? null,
      created_at: ts,
      updated_at: ts,
    };
    posts.unshift(created);
    return created;
  },

  async updatePost(id, input: PostUpdate) {
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const next = { ...posts[idx], ...stripUndefined(input), updated_at: iso() };
    posts[idx] = next;
    return next;
  },

  async deletePost(id) {
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    posts.splice(idx, 1);
    return true;
  },

  // ---------- 留言 / 订阅 ----------
  async createComment(input: ContactRequest) {
    const ts = iso();
    const created: CommentListItem = {
      id: uuid(),
      name: input.name,
      email: input.email,
      message: input.message,
      type: "message",
      read_at: null,
      consent_at: ts,
      created_at: ts,
      updated_at: ts,
    };
    comments.unshift(created);
    return created;
  },

  async adminListComments({ page, limit }) {
    const sorted = [...comments].sort(byUpdatedDesc);
    return paginate(sorted, page, limit);
  },

  async markCommentRead(id) {
    const target = comments.find((c) => c.id === id);
    if (!target) return false;
    target.read_at = iso();
    return true;
  },

  async deleteComment(id) {
    const idx = comments.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    comments.splice(idx, 1);
    return true;
  },

  async createSubscription(input: SubscribeRequest) {
    const ts = iso();
    const existing = subscriptions.find((s) => s.email === input.email);
    if (existing) {
      existing.consent_at = ts;
      existing.unsubscribed_at = null;
      existing.source = input.source ?? existing.source;
      existing.name = input.name ?? existing.name;
      existing.updated_at = ts;
      return existing;
    }
    const created: SubscriptionListItem = {
      id: uuid(),
      email: input.email,
      name: input.name ?? null,
      source: input.source ?? null,
      consent_at: ts,
      created_at: ts,
      updated_at: ts,
      unsubscribed_at: null,
    };
    subscriptions.unshift(created);
    return created;
  },

  async adminListSubscriptions({ page, limit }) {
    const sorted = [...subscriptions].sort(byUpdatedDesc);
    return paginate(sorted, page, limit);
  },

  // ---------- 统计 ----------
  async stats() {
    return {
      projectCount: projects.length,
      publishedPostCount: posts.filter((p) => p.status === "published").length,
      draftPostCount: posts.filter((p) => p.status === "draft").length,
      unreadCommentCount: comments.filter((c) => !c.read_at).length,
      subscriptionCount: subscriptions.filter((s) => !s.unsubscribed_at).length,
    };
  },
};

function stripUndefined<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
