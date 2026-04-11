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
  SearchResult,
} from "../types.js";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";

const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "patch", "delete", "head", "options"];

// --- Type guards for safe property access ---

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

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

const VALID_PARAM_IN = new Set<string>(["query", "path", "header", "cookie"]);

function extractParameters(params: unknown[]): OpenAPIParameter[] {
  if (!Array.isArray(params)) return [];
  return params.filter(isObj).map((p) => {
    const inValue = str(p.in, "query");
    return {
      name: str(p.name),
      in: (VALID_PARAM_IN.has(inValue) ? inValue : "query") as OpenAPIParameter["in"],
      required: bool(p.required),
      description: typeof p.description === "string" ? p.description : undefined,
      schema: isObj(p.schema) ? p.schema : {},
    };
  });
}

function extractRequestBody(body: unknown): OpenAPIRequestBody | undefined {
  if (!isObj(body)) return undefined;
  if (!isObj(body.content)) return undefined;
  return {
    description: typeof body.description === "string" ? body.description : undefined,
    required: bool(body.required),
    content: body.content as Record<string, { schema: Record<string, unknown> }>,
  };
}

function extractResponses(responses: unknown): OpenAPIResponse[] {
  if (!isObj(responses)) return [];
  return Object.entries(responses)
    .filter((entry): entry is [string, Record<string, unknown>] => isObj(entry[1]))
    .map(([status, resp]) => ({
      status,
      description: str(resp.description),
      content: isObj(resp.content)
        ? (resp.content as Record<string, { schema: Record<string, unknown> }>)
        : undefined,
    }));
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

  if (!isObj(schema) || !isObj((schema as Record<string, unknown>).paths)) return [];
  const paths = (schema as Record<string, unknown>).paths as Record<string, unknown>;

  const pages: OpenAPIPageData[] = [];

  for (const [pathStr, pathItem] of Object.entries(paths)) {
    if (!isObj(pathItem)) continue;
    const pathParams = arr(pathItem.parameters);

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!isObj(operation)) continue;

      const operationId = typeof operation.operationId === "string" ? operation.operationId : undefined;
      const slug = slugify(method, pathStr, operationId);
      const summary = str(operation.summary, `${method.toUpperCase()} ${pathStr}`);
      const tags = arr(operation.tags).filter((t): t is string => typeof t === "string");

      const opParams = arr(operation.parameters);
      const mergedParams = [...pathParams, ...opParams];

      pages.push({
        slug,
        url: `${baseUrl}/${slug}`,
        method: method.toUpperCase(),
        path: pathStr,
        operationId,
        summary,
        description: typeof operation.description === "string" ? operation.description : undefined,
        tags,
        deprecated: bool(operation.deprecated),
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
 * Builds search result entries from OpenAPI operations.
 */
export function buildOpenAPISearchIndex(
  operations: OpenAPIPageData[]
): SearchResult[] {
  return operations.map((op) => ({
    title: op.summary,
    description: `${op.method} ${op.path}`,
    url: op.url,
    score: 0,
  }));
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
