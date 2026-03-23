import type { ReactNode, ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { CopyButton } from "./copy-button";
import { CodeTabs } from "./code-tabs";
import { Callout } from "./callout";
import { Banner } from "./banner";

type WithChildren<T = Record<string, unknown>> = T & { children?: ReactNode };

export const mdxComponents = {
  a: ({ children, href, ...props }: WithChildren<ComponentPropsWithoutRef<"a">>) => {
    if (href?.startsWith("http")) {
      return <a {...props} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
    return <Link href={href ?? "#"} {...props}>{children}</Link>;
  },
  pre: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"pre">>) => (
    <div className="code-block-wrapper relative group">
      <CopyButton className="opacity-0 group-hover:opacity-100" />
      <pre {...props}>{children}</pre>
    </div>
  ),
  code: ({ children, ...props }: WithChildren<ComponentPropsWithoutRef<"code"> & { "data-highlighted"?: string }>) => {
    if (props["data-highlighted"]) {
      return <code {...props}>{children}</code>;
    }
    return <code data-inline="true" {...props}>{children}</code>;
  },
  CodeTabs,
  Callout,
  Banner,
};
