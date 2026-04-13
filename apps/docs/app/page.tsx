import { SiteHeader } from "@/components/site-header";
import { HomePageClient } from "./home-client";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
      <SiteHeader />
      <HomePageClient />
    </div>
  );
}
