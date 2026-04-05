import { getPageTree } from "@/lib/source";
import { Sidebar, MobileSidebar } from "../../../../registry/ui/document0/sidebar/Sidebar";
import { Header } from "@/components/header";
import HeroGeometric from "@/components/ui/hero-geometric";
import { AiChat } from "@registry/ui/document0/openrouter-chat/AiChat";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const tree = getPageTree();

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950">
      <Header mobileSidebar={<MobileSidebar tree={tree} navLinks={[{ href: "/docs", label: "Docs" }, { href: "/api", label: "API Reference" }, { href: "/plugins", label: "Plugins" }]} />} />
      <div className="flex flex-1 items-start">
        <Sidebar tree={tree} />
        <main className="relative flex-1 min-w-0">
          <div className="absolute inset-x-0 top-0 h-[300px] overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, black 10%, transparent 80%)", WebkitMaskImage: "linear-gradient(to bottom, black 10%, transparent 80%)" }}>
            <HeroGeometric
              className="!min-h-0 !h-full !w-full !bg-[#0a0a0a]"
              color1="#0a0a0a"
              color2="#71717a"
            />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
      <AiChat endpoint="/api/chat" title="document0 Docs AI" placeholder="Ask the docs..." />
    </div>
  );
}
