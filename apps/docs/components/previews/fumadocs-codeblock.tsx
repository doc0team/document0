"use client";

import { CodeBlock, Pre } from "../../../../registry/ui/fumadocs/codeblock/CodeBlock";

const sourceLines = [
  `<span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { DocsSource } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> "@document0/core"</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span>`,
  `<span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> path </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> "node:path"</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span>`,
  ``,
  `<span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DocsSource</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span>`,
  `<span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  rootDir: path.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">join</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(process.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cwd</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">"content/docs"</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span>`,
  `<span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span>`,
  ``,
  `<span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { source };</span>`,
];

const bashLine = `<span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @document0/cli</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> document0/sidebar</span>`;

const sourceHtml = sourceLines.map((l) => `<span class="line">${l}</span>`).join("\n");
const bashHtml = `<span class="line">${bashLine}</span>`;

export function CodeBlockPreview() {
  return (
    <div className="space-y-4">
      <CodeBlock title="source.ts">
        <Pre>
          <code dangerouslySetInnerHTML={{ __html: sourceHtml }} />
        </Pre>
      </CodeBlock>

      <CodeBlock allowCopy>
        <Pre>
          <code dangerouslySetInnerHTML={{ __html: bashHtml }} />
        </Pre>
      </CodeBlock>
    </div>
  );
}
