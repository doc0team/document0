import Link from "next/link";

interface PluginCardProps {
  name: string;
  namespace: string;
  description: string;
  category: "mdx" | "core" | "ui";
  tags: string[];
  frameworks: string[];
  author: string;
}

export function PluginCard({
  name,
  namespace,
  description,
  category,
  tags,
}: PluginCardProps) {
  return (
    <Link
      href={`/plugins/${namespace}/${name}`}
      className="group flex flex-col rounded-lg border border-zinc-800 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/50"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="font-medium text-white">
          <span className="text-zinc-500">{namespace}/</span>{name}
        </h3>
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
          {category}
        </span>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed mb-3 flex-1">
        {description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[11px] text-zinc-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
