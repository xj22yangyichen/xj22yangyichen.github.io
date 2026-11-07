import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MarkdownContentProps {
  readonly markdown: string;
}

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  return (
    <div className="article-prose">
      <ReactMarkdown
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeSlug]}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
