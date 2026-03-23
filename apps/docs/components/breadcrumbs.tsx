import Link from "next/link";
import type { BreadcrumbItem } from "@document0/core";

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
