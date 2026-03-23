import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">404</p>
      <h1 className="text-3xl font-bold text-white">Page not found</h1>
      <p className="text-zinc-400">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/docs"
        className="mt-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
      >
        Go to docs
      </Link>
    </div>
  );
}
