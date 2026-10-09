import Link from "next/link";

/** 404（DESIGN.md §8 边缘态）：给明确出路，而不是空白或 Lorem */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="container-page flex max-w-[52ch] flex-col items-start gap-6">
        <p className="font-mono text-sm tracking-caps text-meta">404</p>
        <h1
          className="text-3xl text-fg"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-announce)",
            letterSpacing: "var(--tracking-display)",
            lineHeight: "var(--leading-tight)",
          }}
        >
          这里没有内容
        </h1>
        <p className="text-base text-fg-2">
          页面可能已经移动或被删除。可以回到首页，或者直接看作品与博客。
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/" className="btn btn-primary">
            回到首页
          </Link>
          <Link href="/works" className="btn btn-secondary">
            浏览作品
          </Link>
          <Link href="/blog" className="btn btn-secondary">
            浏览博客
          </Link>
        </div>
      </div>
    </div>
  );
}
