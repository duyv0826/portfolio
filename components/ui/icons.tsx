import {
  Edit3,
  Trash2,
  Eye,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Inbox,
  Settings,
  ImageOff,
  FileWarning,
  Loader2,
  Menu,
  X,
  Mail,
  ArrowRight,
  ArrowUpRight,
  Check,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserRound,
  Wrench,
  PenLine,
  Plus,
  Search,
  LogOut,
  Lock,
  type LucideIcon,
} from "lucide-react";

/**
 * 允许出现在 UI 上的图标白名单。
 *
 * ADR-004：图标库锁定 Lucide，禁止凭记忆拼写。所有图标名已用运行时导出清单逐个校验
 * （lucide-react 1.54 共 6396 个导出）。
 *
 * ⚠️ 例外（2026-10-10 实测）：lucide v1 已将 Github / Linkedin 等**品牌图标全部移出核心包**
 * （导出清单里确认不存在）。品牌标识因此改为自建内联 SVG，遵循同一套 24px 网格 / 2px 描边 /
 * currentColor 规范，视觉上与 Lucide 一致。这不是"混用第二套图标库"，而是品牌 Logo。
 */

function BrandGithub({ size = 24, className, ...rest }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .96-.3 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.18-1.48 3.14-1.18 3.14-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function BrandLinkedin({ size = 24, className, ...rest }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.83v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21h-4V9Z" />
    </svg>
  );
}

export const Icon = {
  Edit: Edit3,
  Trash: Trash2,
  View: Eye,
  Dashboard: LayoutDashboard,
  Works: FolderOpen,
  Posts: FileText,
  Messages: Inbox,
  Settings,
  NoImage: ImageOff,
  EmptyDoc: FileWarning,
  Spinner: Loader2,
  Menu,
  Close: X,
  Mail,
  ArrowRight,
  External: ArrowUpRight,
  Check,
  Warning: AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Calendar: CalendarDays,
  User: UserRound,
  Tool: Wrench,
  New: PenLine,
  Plus,
  Search,
  LogOut,
  Lock,
  // 品牌标识（lucide v1 已移除品牌图标，自建替代）
  Github: BrandGithub,
  Linkedin: BrandLinkedin,
} satisfies Record<string, unknown>;

export type IconName = keyof typeof Icon;
