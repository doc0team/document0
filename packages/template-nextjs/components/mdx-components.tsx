import type { ReactNode, ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type WithChildren<T = Record<string, unknown>> = T & { children?: ReactNode };

export const mdxComponents = {
  a: ({ children, href, ...props }: WithChildren<ComponentPropsWithoutRef<"a">>) => {
    if (href?.startsWith("http")) {
      return (
        <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors">
          {children}
        </a>
      );
    }
    return (
      <Link href={href ?? "#"} {...props} className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors">
        {children}
      </Link>
    );
  },
  h1: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"h1">>) => (
    <h1 {...props} className="mt-2 mb-4 text-3xl font-bold tracking-tight scroll-mt-20">{children}</h1>
  ),
  h2: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"h2">>) => (
    <h2 {...props} className="mt-10 mb-3 text-xl font-semibold border-b border-border pb-2 scroll-mt-20">{children}</h2>
  ),
  h3: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"h3">>) => (
    <h3 {...props} className="mt-8 mb-2 text-lg font-semibold scroll-mt-20">{children}</h3>
  ),
  p: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"p">>) => (
    <p {...props} className="my-4 leading-7 text-muted-foreground">{children}</p>
  ),
  ul: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"ul">>) => (
    <ul {...props} className="my-4 ml-6 list-disc space-y-1.5 text-muted-foreground marker:text-muted-foreground/50">{children}</ul>
  ),
  ol: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"ol">>) => (
    <ol {...props} className="my-4 ml-6 list-decimal space-y-1.5 text-muted-foreground marker:text-muted-foreground/50">{children}</ol>
  ),
  li: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"li">>) => (
    <li {...props} className="leading-7">{children}</li>
  ),
  blockquote: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"blockquote">>) => (
    <blockquote {...props} className="my-5 border-l-2 border-border pl-5 text-muted-foreground italic">{children}</blockquote>
  ),
  hr: () => <Separator className="my-8" />,
  strong: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"strong">>) => (
    <strong {...props} className="font-semibold text-foreground">{children}</strong>
  ),
  pre: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"pre">>) => (
    <pre {...props} className="my-5 overflow-x-auto rounded-lg border border-border bg-card p-4 text-sm leading-relaxed">{children}</pre>
  ),
  code: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"code"> & { "data-highlighted"?: string }>) => {
    if (props["data-highlighted"]) {
      return <code {...props}>{children}</code>;
    }
    return (
      <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
        {children}
      </code>
    );
  },
  table: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"table">>) => (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
      <table {...props} className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"thead">>) => (
    <thead {...props} className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">{children}</thead>
  ),
  th: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"th">>) => (
    <th {...props} className="px-4 py-3 text-left font-medium">{children}</th>
  ),
  td: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"td">>) => (
    <td {...props} className="border-t border-border px-4 py-3 text-muted-foreground">{children}</td>
  ),
  Badge,
};
