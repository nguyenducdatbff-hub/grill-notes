import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { BACKLINK_RE } from "@/lib/markdown";

function splitWikilinks(value: string): ({ text: string } | { title: string })[] {
  const out: ({ text: string } | { title: string })[] = [];
  let last = 0;
  for (const m of value.matchAll(BACKLINK_RE)) {
    if (m.index !== undefined && m.index > last) out.push({ text: value.slice(last, m.index) });
    out.push({ title: m[1].trim() });
    last = (m.index ?? 0) + m[0].length;
  }
  if (last < value.length) out.push({ text: value.slice(last) });
  return out;
}

function remarkWikilinks() {
  return (tree: { type: string; children: unknown[] }): void => {
    const walk = (node: unknown): unknown | unknown[] => {
      if (typeof node === "object" && node !== null) {
        const n = node as { type?: string; value?: string; children?: unknown[] };
        if (n.type === "text" && typeof n.value === "string" && BACKLINK_RE.test(n.value)) {
          return splitWikilinks(n.value).map((p) =>
            "title" in p
              ? { type: "link", url: `[[${p.title}]]`, children: [{ type: "text", value: `[[${p.title}]]` }] }
              : { type: "text", value: p.text },
          );
        }
        if (Array.isArray(n.children)) {
          const children = n.children.flatMap((c) => {
            const r = walk(c);
            return Array.isArray(r) ? r : [r];
          });
          return { ...n, children };
        }
      }
      return node;
    };
    walk(tree);
  };
}

export function Markdown({ content, shareToken, wikilinks }: { content: string; shareToken?: string; wikilinks?: Record<string, string> }) {
  const components: Components = {
    a: ({ href, children }) => {
      const m = typeof href === "string" ? href.match(BACKLINK_RE) : null;
      if (m) {
        const id = wikilinks?.[m[1].trim()];
        if (id) return <Link href={`/app/notes/${id}`} className="rounded bg-[var(--border)] px-1 py-0.5 text-[var(--text)] no-underline hover:opacity-80">[[{m[1].trim()}]]</Link>;
        return <span className="rounded border border-dashed px-1 py-0.5 text-[var(--muted)]">[[{m[1].trim()}]]</span>;
      }
      return <a href={href}>{children}</a>;
    },
  };
  if (shareToken) {
    components.img = ({ node, alt, src, ...rest }) => {
      void node;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt ?? ""} src={typeof src === "string" && src.startsWith("/api/images/") ? `${src}?token=${shareToken}` : src} {...rest} />
      );
    };
  }
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkWikilinks]} rehypePlugins={[rehypeRaw, rehypeSanitize]} components={components}>{content}</ReactMarkdown>
    </div>
  );
}
