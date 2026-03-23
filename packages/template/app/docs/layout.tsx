import { getPageTree } from "@/lib/source";
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = getPageTree();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-4 px-4">
          <MobileSidebar tree={tree} />
          <span className="text-sm font-semibold tracking-tight">My Docs</span>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar tree={tree} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
