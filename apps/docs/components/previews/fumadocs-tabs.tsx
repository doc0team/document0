"use client";

import { Tabs, Tab } from "../../../../registry/ui/fumadocs/tabs/Tabs";

export function TabsPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Install a package:</p>
        <Tabs items={["npm", "pnpm", "yarn"]} groupId="package-manager" persist>
          <Tab>
            <code className="text-sm text-zinc-300">npm install @document0/core</code>
          </Tab>
          <Tab>
            <code className="text-sm text-zinc-300">pnpm add @document0/core</code>
          </Tab>
          <Tab>
            <code className="text-sm text-zinc-300">yarn add @document0/core</code>
          </Tab>
        </Tabs>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Run the dev server:</p>
        <Tabs items={["npm", "pnpm"]} groupId="package-manager" persist>
          <Tab>
            <code className="text-sm text-zinc-300">npm run dev</code>
          </Tab>
          <Tab>
            <code className="text-sm text-zinc-300">pnpm dev</code>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
