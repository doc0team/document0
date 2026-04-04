"use client";

import { Steps, Step } from "../../../../registry/ui/fumadocs/steps/Steps";

export function StepsPreview() {
  return (
    <Steps>
      <Step>
        <h4 className="text-sm font-semibold text-white">Install the package</h4>
        <p className="text-sm text-zinc-400">Run <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">npm install document0</code> in your project.</p>
      </Step>
      <Step>
        <h4 className="text-sm font-semibold text-white">Create your content</h4>
        <p className="text-sm text-zinc-400">Add MDX files to the <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">content/</code> directory.</p>
      </Step>
      <Step>
        <h4 className="text-sm font-semibold text-white">Start the dev server</h4>
        <p className="text-sm text-zinc-400">Run <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">npm run dev</code> and visit localhost:3000.</p>
      </Step>
    </Steps>
  );
}
