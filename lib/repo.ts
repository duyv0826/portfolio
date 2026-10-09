import type {
  CommentListItem,
  ContactRequest,
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
 * 数据访问契约。
 *
 * 页面与 API 只依赖这个接口，不直接依赖 Prisma —— 这样本地无数据库时可用内存实现跑通全站，
 * 有 DATABASE_URL 时无缝切到 PostgreSQL，两侧行为保持一致。
 */
export interface Repo {
  // 作品（公开）
  listProjects(opts: { page: number; limit: number; category?: string }): Promise<Paginated<ProjectListItem>>;
  getProjectBySlug(slug: string): Promise<ProjectDetail | null>;
  listFeaturedProjects(limit: number): Promise<ProjectListItem[]>;
  listRelatedProjects(slug: string, limit: number): Promise<ProjectListItem[]>;

  // 作品（管理）
  adminListProjects(opts: { page: number; limit: number; status?: string }): Promise<Paginated<ProjectListItem>>;
  adminGetProject(id: string): Promise<ProjectDetail | null>;
  createProject(input: ProjectCreate): Promise<ProjectDetail>;
  updateProject(id: string, input: ProjectUpdate): Promise<ProjectDetail | null>;
  deleteProject(id: string): Promise<boolean>;

  // 博客（公开）
  listPosts(opts: { page: number; limit: number }): Promise<Paginated<PostListItem>>;
  getPostBySlug(slug: string): Promise<PostDetail | null>;

  // 博客（管理）
  adminListPosts(opts: { page: number; limit: number; status?: PostStatus }): Promise<Paginated<PostListItem>>;
  adminGetPost(id: string): Promise<PostDetail | null>;
  createPost(input: PostCreate): Promise<PostDetail>;
  updatePost(id: string, input: PostUpdate): Promise<PostDetail | null>;
  deletePost(id: string): Promise<boolean>;

  // 留言 / 订阅
  createComment(input: ContactRequest): Promise<CommentListItem>;
  adminListComments(opts: { page: number; limit: number }): Promise<Paginated<CommentListItem>>;
  markCommentRead(id: string): Promise<boolean>;
  deleteComment(id: string): Promise<boolean>;

  createSubscription(input: SubscribeRequest): Promise<SubscriptionListItem>;
  adminListSubscriptions(opts: { page: number; limit: number }): Promise<Paginated<SubscriptionListItem>>;

  // 统计
  stats(): Promise<{
    projectCount: number;
    publishedPostCount: number;
    draftPostCount: number;
    unreadCommentCount: number;
    subscriptionCount: number;
  }>;
}

/** 仅打印布尔值，不打印凭证本身（沿用"凭证不得写入日志"的安全红线） */
export const hasDatabase = (): boolean => Boolean(process.env.DATABASE_URL);
