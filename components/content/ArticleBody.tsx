import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Markdown rendered as React ELEMENTS (no dangerouslySetInnerHTML; raw HTML in the source is
// NOT interpreted). GitHub-flavored: tables, task lists, strikethrough, autolinks.
// The article title is the page <h1>: a "# Heading" in the body is demoted to <h2>.
const components: Components = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `node` (hast) must not reach the DOM
    h1: ({ node, ...props }) => <h2 {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    a: ({ node, href, ...props }) =>
        href && /^https?:\/\//.test(href) ? (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
        ) : (
            <a href={href} {...props} />
        ),
    // eslint-disable-next-line @next/next/no-img-element, @typescript-eslint/no-unused-vars -- Markdown images: unknown intrinsic size
    img: ({ node, alt, ...props }) => <img alt={alt ?? ""} loading="lazy" {...props} />,
};

export function ArticleBody({ markdown }: { markdown: string }) {
    return (
        <div className="article-body prose">
            <Markdown remarkPlugins={[remarkGfm]} components={components}>
                {markdown}
            </Markdown>
        </div>
    );
}
