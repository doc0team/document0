import path from "node:path";
import { describe, expect, it } from "vitest";
import { withDocument0 } from "../../packages/next-dev/src/with-document0.js";

describe("next-dev/withDocument0", () => {
  it("adds server-dev webpack rule for content-stamp", () => {
    const wrapped = withDocument0({ contentDir: "content/docs" })({});

    const baseConfig: Record<string, unknown> = {};
    const output = wrapped.webpack?.(baseConfig, {
      dir: process.cwd(),
      isServer: true,
      dev: true,
    } as never) as {
      module?: { rules?: Array<Record<string, unknown>> };
    };

    const rules = output.module?.rules ?? [];
    expect(rules.length).toBeGreaterThan(0);

    const ruleWithLoader = rules.find((rule) => Array.isArray(rule.use)) as
      | { use?: Array<{ loader?: string; options?: { contentDir?: string } }> }
      | undefined;

    expect(ruleWithLoader?.use?.[0]?.loader).toContain(
      path.join("loaders", "content-stamp-loader.cjs"),
    );
    expect(ruleWithLoader?.use?.[0]?.options?.contentDir).toBe(
      path.resolve(process.cwd(), "content/docs"),
    );
  });

  it("does not add loader rule for client build", () => {
    const wrapped = withDocument0()({});
    const output = wrapped.webpack?.({}, {
      dir: process.cwd(),
      isServer: false,
      dev: true,
    } as never) as {
      module?: { rules?: Array<unknown> };
    };

    expect(output.module?.rules ?? []).toHaveLength(0);
  });
});
