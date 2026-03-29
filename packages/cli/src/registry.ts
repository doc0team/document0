export interface RegistryItem {
  name: string;
  namespace: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  category: "mdx" | "core" | "ui";
  frameworks: string[];
  files: string[];
  dependencies: Record<string, string>;
  registryDependencies: string[];
  installPath: string;
  preview?: boolean;
}

export interface RegistryIndex {
  version: number;
  items: RegistryItem[];
}

const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/doc0team/document0/main/registry";

function getRegistryBaseUrl(): string {
  return process.env["DOCUMENT0_REGISTRY"] ?? DEFAULT_REGISTRY_URL;
}

export async function fetchRegistryIndex(): Promise<RegistryIndex> {
  const url = `${getRegistryBaseUrl()}/registry-index.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch registry index: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as RegistryIndex;
}

function getItemDir(item: RegistryItem): string {
  const base = item.category === "ui" ? "ui" : "plugins";
  return `${base}/${item.namespace}/${item.name}`;
}

export async function fetchItemFile(
  item: RegistryItem,
  fileName: string,
): Promise<string> {
  const url = `${getRegistryBaseUrl()}/${getItemDir(item)}/${fileName}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${item.namespace}/${item.name}/${fileName}: ${res.status}`);
  }
  return res.text();
}

export function findItem(
  index: RegistryIndex,
  query: string,
): RegistryItem | undefined {
  if (query.includes("/")) {
    const [ns, name] = query.split("/", 2);
    return index.items.find((i) => i.namespace === ns && i.name === name);
  }
  return index.items.find((i) => i.name === query);
}

export function searchItems(
  index: RegistryIndex,
  query: string,
): RegistryItem[] {
  const q = query.toLowerCase();
  return index.items.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.namespace.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
