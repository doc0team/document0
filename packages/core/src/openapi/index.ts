import { dereference } from "@scalar/openapi-parser";
import fs from "node:fs";
import type {
  OpenAPIPageData,
  OpenAPIParameter,
  OpenAPIRequestBody,
  OpenAPIResponse,
  OpenAPISourceOptions,
  TreeNode,
  PageNode,
  SearchIndex,
} from "../types.js";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";

const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "patch", "delete", "head", "options"];

function slugify(method: string, path: string, operationId?: string): string {
  if (operationId) {
    return operationId
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  }
  const cleaned = path
    .replace(/[{}]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${method.toLowerCase()}-${cleaned}`;
}

function extractParameters(params: unknown[]): OpenAPIParameter[] {
  if (!Array.isArray(params)) return [];
  return params.map((raw) => {
    const p = raw as Record<string, unknown>;
    return {
    name: (p.name as string) ?? "",
    in: (p.in as OpenAPIParameter["in"]) ?? "query",
    required: (p.required as boolean) ?? false,
    description: p.description as string | undefined,
    schema: (p.schema as Record<string, unknown>) ?? {},
  };
  });
}

function extractRequestBody(body: unknown): OpenAPIRequestBody | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  const content = b.content as Record<string, { schema: Record<string, unknown> }> | undefined;
  if (!content) return undefined;
  return {
    description: b.description as string | undefined,
    required: (b.required as boolean) ?? false,
    content,
  };
}

function extractResponses(responses: unknown): OpenAPIResponse[] {
  if (!responses || typeof responses !== "object") return [];
  return Object.entries(responses as Record<string, Record<string, unknown>>).map(
    ([status, resp]) => ({
      status,
      description: (resp.description as string) ?? "",
      content: resp.content as Record<string, { schema: Record<string, unknown> }> | undefined,
    })
  );
}

/**
 * Parses an OpenAPI 3.x spec and returns structured page data for each operation.
 */
export async function createOpenAPISource(
  input: string | Record<string, unknown>,
  options: OpenAPISourceOptions
): Promise<OpenAPIPageData[]> {
  const baseUrl = options.baseUrl;

  let spec: Record<string, unknown>;
  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://")) {
      const res = await fetch(input);
      spec = (await res.json()) as Record<string, unknown>;
    } else {
      const raw = fs.readFileSync(input, "utf-8");
      spec = JSON.parse(raw) as Record<string, unknown>;
    }
  } else {
    spec = input;
  }

  const { schema } = await dereference(spec);
  if (!schema) throw new Error("Failed to dereference OpenAPI spec");

  const paths = (schema as Record<string, unknown>).paths as Record<
    string,
    Record<string, unknown>
  > | undefined;
  if (!paths) return [];

  const pages: OpenAPIPageData[] = [];

  for (const [pathStr, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== "object") continue;
    const pathParams = (pathItem as Record<string, unknown>).parameters as unknown[] | undefined;

    for (const method of HTTP_METHODS) {
      const operation = (pathItem as Record<string, unknown>)[method] as
        | Record<string, unknown>
        | undefined;
      if (!operation) continue;

      const operationId = operation.operationId as string | undefined;
      const slug = slugify(method, pathStr, operationId);
      const summary =
        (operation.summary as string) ??
        `${method.toUpperCase()} ${pathStr}`;
      const tags = (operation.tags as string[]) ?? [];

      const opParams = (operation.parameters as unknown[]) ?? [];
      const mergedParams = [...(pathParams ?? []), ...opParams];

      pages.push({
        slug,
        url: `${baseUrl}/${slug}`,
        method: method.toUpperCase(),
        path: pathStr,
        operationId,
        summary,
        description: operation.description as string | undefined,
        tags,
        deprecated: (operation.deprecated as boolean) ?? false,
        parameters: extractParameters(mergedParams),
        requestBody: extractRequestBody(operation.requestBody),
        responses: extractResponses(operation.responses),
      });
    }
  }

  return pages;
}

/**
 * Builds sidebar tree nodes from OpenAPI operations, grouped by tag.
 * Returns a flat list of separator + page nodes (no wrapper folder).
 */
export function buildOpenAPITree(
  operations: OpenAPIPageData[]
): TreeNode[] {
  const tagMap = new Map<string, PageNode[]>();
  const untagged: PageNode[] = [];

  for (const op of operations) {
    const node: PageNode = {
      type: "page",
      name: `${op.method} ${op.path}`,
      url: op.url,
      slug: op.slug,
    };

    if (op.tags.length === 0) {
      untagged.push(node);
    } else {
      for (const tag of op.tags) {
        if (!tagMap.has(tag)) tagMap.set(tag, []);
        tagMap.get(tag)!.push(node);
      }
    }
  }

  const nodes: TreeNode[] = [];

  for (const [tag, pages] of tagMap) {
    nodes.push({ type: "separator", name: tag });
    nodes.push(...pages);
  }

  if (untagged.length > 0) {
    if (nodes.length > 0) {
      nodes.push({ type: "separator", name: "Other" });
    }
    nodes.push(...untagged);
  }

  return nodes;
}

/**
 * Builds search index entries from OpenAPI operations.
 */
export function buildOpenAPISearchIndex(
  operations: OpenAPIPageData[]
): SearchIndex[] {
  return operations.map((op) => {
    const paramNames = op.parameters.map((p) => p.name).join(", ");
    const content = [
      `${op.method} ${op.path}`,
      op.description ?? "",
      paramNames ? `Parameters: ${paramNames}` : "",
    ]
      .filter(Boolean)
      .join(" — ");

    return {
      id: op.slug,
      title: op.summary,
      description: `${op.method} ${op.path}`,
      url: op.url,
      content,
    };
  });
}

/**
 * Generates an LLM-friendly text summary of all API operations.
 */
export function generateOpenAPILlmsTxt(
  operations: OpenAPIPageData[],
  options?: { baseUrl?: string; title?: string }
): string {
  const baseUrl = options?.baseUrl ?? "";
  const title = options?.title ?? "API Reference";
  const lines: string[] = [];

  lines.push(`## ${title}`, "");

  for (const op of operations) {
    const url = baseUrl ? `${baseUrl}${op.url}` : op.url;
    lines.push(`### ${op.method} ${op.path}`);
    lines.push(`- **${op.summary}**`);
    if (op.description) lines.push(`- ${op.description}`);
    lines.push(`- URL: ${url}`);

    if (op.parameters.length > 0) {
      lines.push(`- Parameters:`);
      for (const p of op.parameters) {
        const req = p.required ? " (required)" : "";
        lines.push(`  - \`${p.name}\` (${p.in})${req}${p.description ? `: ${p.description}` : ""}`);
      }
    }

    if (op.requestBody) {
      lines.push(`- Request body${op.requestBody.required ? " (required)" : ""}${op.requestBody.description ? `: ${op.requestBody.description}` : ""}`);
    }

    if (op.responses.length > 0) {
      lines.push(`- Responses: ${op.responses.map((r) => r.status).join(", ")}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}
