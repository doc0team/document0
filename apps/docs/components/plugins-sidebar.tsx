"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Introduction", href: "/plugins" },
      { name: "How Plugins Work", href: "/plugins/how-it-works" },
      { name: "Creating a Plugin", href: "/plugins/creating" },
    ],
  },
  {
    title: "Browse",
    items: [
      { name: "All Plugins", href: "/plugins/browse" },
      { name: "MDX Plugins", href: "/plugins/browse?category=mdx" },
      { name: "Core Plugins", href: "/plugins/browse?category=core" },
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "CLI Reference", href: "/plugins/cli" },
      { name: "Submit a Plugin", href: "/plugins/submit" },
    ],
  },
];

export function PluginsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 sticky top-14 h-[calc(100vh-3.5rem)]">
      <div className="overflow-y-auto px-3 py-6 flex-1">
        {navigation.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/plugins" && pathname.startsWith(item.href.split("?")[0]!));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-sky-500/10 text-sky-400 font-medium"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
                      ].join(" ")}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
