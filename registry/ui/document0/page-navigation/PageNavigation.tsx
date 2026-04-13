import Link from "next/link";

interface NavItem { name: string; url: string }

/**
 * Previous/Next page links for sequential navigation.
 *
 * Usage:
 * ```tsx
 * import { PageNavigation } from "@/components/document0/page-navigation/PageNavigation";
 * import { getPageNeighbours } from "@document0/core";
 *
 * // In your page component:
 * const tree = getPageTree();
 * const { previous, next } = getPageNeighbours(tree, page.url);
 *
 * return <PageNavigation previous={previous} next={next} />;
 * ```
 */
export function PageNavigation({ previous, next }: { previous: NavItem | null; next: NavItem | null }) {
  if (!previous && !next) return null;
  return (
    <nav className="mt-16 pt-6 border-t border-zinc-800 flex justify-between gap-4">
      <div className="flex-1">
        {previous && (
          <Link href={previous.url} className="group flex flex-col gap-1 text-sm">
            <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">← Previous</span>
            <span className="font-medium text-zinc-300 group-hover:text-white transition-colors">{previous.name}</span>
          </Link>
        )}
      </div>
      <div className="flex-1 text-right">
        {next && (
          <Link href={next.url} className="group flex flex-col gap-1 text-sm items-end">
            <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">Next →</span>
            <span className="font-medium text-zinc-300 group-hover:text-white transition-colors">{next.name}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
