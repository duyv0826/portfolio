/**
 * 领域类型 —— 逐字段对齐 docs/phase2/openapi.yaml components.schemas。
 * 前端页面与 API 共用同一套类型，避免契约漂移。
 */

export type LicenseType =
  | "original"
  | "cc0"
  | "cc-by"
  | "commercial"
  | "client-owned"
  | "ai-assisted";

export type ClientAuthStatus = "not-client" | "authorized" | "pending";

export type PostStatus = "published" | "draft";

export type CommentType = "message" | "subscribe_note";

export interface UserPublic {
  id: string;
  name: string | null;
  email: string;
}

export interface ProjectListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  cover_image_url: string;
  gallery_urls: string[] | null;
  category: string | null;
  tags: string[] | null;
  year: number | null;
  role: string | null;
  material_source: string | null;
  license_type: LicenseType | null;
  attribution: string | null;
  client_auth_status: ClientAuthStatus | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends ProjectListItem {
  content_md: string;
}

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostDetail extends PostListItem {
  content_md: string;
}

export interface CommentListItem {
  id: string;
  name: string;
  email: string;
  message: string;
  type: CommentType;
  read_at: string | null;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionListItem {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
  unsubscribed_at: string | null;
}

/** openapi.yaml 统一响应外壳 */
export interface Envelope<T> {
  code: number;
  message: string;
  data: T | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/* ---------- 写入侧载荷（openapi Create/Update schema） ---------- */

export interface ProjectCreate {
  slug: string;
  title: string;
  summary: string;
  cover_image_url: string;
  content_md: string;
  gallery_urls?: string[] | null;
  category?: string | null;
  tags?: string[] | null;
  year?: number | null;
  role?: string | null;
  material_source?: string | null;
  license_type?: LicenseType | null;
  attribution?: string | null;
  client_auth_status?: ClientAuthStatus | null;
}

export type ProjectUpdate = Partial<ProjectCreate>;

export interface PostCreate {
  slug: string;
  title: string;
  content_md: string;
  status: PostStatus;
  excerpt?: string | null;
  cover_image_url?: string | null;
  tags?: string[] | null;
  published_at?: string | null;
}

export type PostUpdate = Partial<PostCreate>;

export interface SubscribeRequest {
  email: string;
  name?: string | null;
  source?: string | null;
  consent: true;
}

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
  consent: true;
}

export interface LoginRequest {
  email: string;
  password: string;
}
