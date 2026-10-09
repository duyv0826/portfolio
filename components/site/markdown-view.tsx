import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown 正文渲染（DESIGN.md §10.5）。
 * 样式由 globals.css 的 .prose-portfolio 提供 —— h2/h3 用 display 字体、引用左侧 2px accent、代码 mono。
 */
export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-portfolio">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
