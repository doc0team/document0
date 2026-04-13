import { getApiTree } from "@/lib/source";
import { Sidebar, MobileSidebar } from "../../../../registry/ui/document0/sidebar/Sidebar";
import { Header } from "@/components/header";

export default async function ApiLayout({ children }: { children: React.ReactNode }) {
  const tree = await getApiTree();

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 overflow-x-hidden">
      <Header mobileSidebar={<MobileSidebar tree={tree} navLinks={[{ href: "/docs", label: "Docs" }, { href: "/api", label: "API Reference" }, { href: "/plugins", label: "Plugins" }]} />} />
      <div className="flex flex-1 items-start">
        <Sidebar tree={tree} />
        <main className="relative flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
