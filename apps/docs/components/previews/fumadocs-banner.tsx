"use client";

import { Banner } from "../../../../registry/ui/fumadocs/banner/Banner";

export function BannerPreview() {
  return (
    <div className="space-y-4">
      <Banner variant="normal">
        document0 v0.4.0 is now available - check out these sweet fumadocs components!.
      </Banner>
      <Banner variant="rainbow">
        Introducing the plugin registry — share and discover docs components/plugins.
      </Banner>
    </div>
  );
}
