import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  url?: string;
}

/**
 * Breadcrumb navigation showing current page path.
 *
 * Usage:
 * ```tsx
 * import { Breadcrumbs } from "@/components/breadcrumbs";
 * import { getBreadcrumbs } from "@document0/core";
 *
 * // In your page component:
 * const tree = getPageTree();
 * const breadcrumbs = getBreadcrumbs(tree, page.url);
 *
 * return <Breadcrumbs items={breadcrumbs} />;
 * ```
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length <= 1) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-zinc-700">/</span>}
            {i < items.length - 1 && item.url ? (
              <Link href={item.url} className="hover:text-zinc-300 transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="text-zinc-400">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
