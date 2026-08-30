import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export function Markdown({ content, shareToken }: { content: string; shareToken?: string }) {
  const components: Components | undefined = shareToken
    ? {
        img: ({ node, alt, src, ...rest }) => {
          void node;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={alt ?? ""} src={typeof src === "string" && src.startsWith("/api/images/") ? `${src}?token=${shareToken}` : src} {...rest} />
          );
        },
      }
    : undefined;
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]} components={components}>{content}</ReactMarkdown>
    </div>
  );
}
