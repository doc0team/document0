export interface PageFrontmatter {
  title: string;
  description?: string;
  icon?: string;
  full?: boolean;
  [key: string]: unknown;
}

export interface PageData {
  slug: string;
  slugs: string[];
  url: string;
  filePath: string;
  frontmatter: PageFrontmatter;
  content: string;
}

export interface FolderData {
  name: string;
  path: string;
  index?: PageData;
}

export type TreeNode = PageNode | FolderNode | SeparatorNode;

export interface PageNode {
  type: "page";
  name: string;
  url: string;
  slug: string;
  icon?: string;
  external?: boolean;
}

export interface FolderNode {
  type: "folder";
  name: string;
  root?: boolean;
  defaultOpen?: boolean;
  index?: PageNode;
  children: TreeNode[];
  icon?: string;
}

export interface SeparatorNode {
  type: "separator";
  name: string;
}

export interface MetaFile {
  title?: string;
  pages?: string[];
  defaultOpen?: boolean;
  icon?: string;
}

export interface SourceOptions {
  /**
   * The root directory to scan for docs files.
   */
  rootDir: string;
  /**
   * Base URL path that prefixes all page URLs.
   * @default "/docs"
   */
  baseUrl?: string;
  /**
   * File extensions to include.
   * @default [".md", ".mdx"]
   */
  extensions?: string[];
  /**
   * Document0 plugins to apply to pages and page tree.
   */
  plugins?: import("./plugin.js").Document0Plugin[];
}

export interface NavigationItem {
  name: string;
  url: string;
  active: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export interface PageNeighbours {
  previous: { name: string; url: string } | null;
  next: { name: string; url: string } | null;
}

export interface SearchResult {
  title: string;
  description?: string;
  url: string;
  score: number;
}

// --- OpenAPI types ---

export interface OpenAPIParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required: boolean;
  description?: string;
  schema: Record<string, unknown>;
}

export interface OpenAPIRequestBody {
  description?: string;
  required: boolean;
  content: Record<string, { schema: Record<string, unknown> }>;
}

export interface OpenAPIResponse {
  status: string;
  description: string;
  content?: Record<string, { schema: Record<string, unknown> }>;
}

export interface OpenAPIPageData {
  slug: string;
  url: string;
  method: string;
  path: string;
  operationId?: string;
  summary: string;
  description?: string;
  tags: string[];
  deprecated: boolean;
  parameters: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: OpenAPIResponse[];
}

export interface OpenAPISourceOptions {
  /** URL base path for generated pages (e.g. "/api", "/docs/api"). */
  baseUrl: string;
  /** How to generate pages. @default "operation" */
  per?: "operation" | "tag";
}
