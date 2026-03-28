import { Header } from "@/components/header";
import { PluginsSidebar } from "@/components/plugins-sidebar";

export default function PluginsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <div className="flex flex-1 items-start">
        <PluginsSidebar />
        <main className="relative flex-1 min-w-0">
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
