"use client";

import { Accordions, Accordion } from "../../../../registry/ui/fumadocs/accordion/Accordion";

export function AccordionPreview() {
  return (
    <Accordions>
      <Accordion id="what-is-document0" title="What is document0?">
        document0 is a headless documentation framework that gives you full control over your docs UI while handling content sourcing, page trees, search, and MDX processing.
      </Accordion>
      <Accordion id="framework" title="Do I need a specific framework?">
        No — document0 works with Next.js, Vite, Astro, SvelteKit, and more. The core is framework-agnostic.
      </Accordion>
      <Accordion id="customize" title="Can I customize the components?">
        Yes. All UI components are installed as source code into your project, so you can modify them however you like.
      </Accordion>
    </Accordions>
  );
}
