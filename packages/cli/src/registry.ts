export interface RegistryPlugin {
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  category: string;
  files: string[];
  dependencies: Record<string, string>;
  registryDependencies: string[];
  installPath: string;
}

export interface RegistryIndex {
  version: number;
  plugins: RegistryPlugin[];
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

export async function fetchPluginFile(
  pluginName: string,
  fileName: string,
): Promise<string> {
  const url = `${getRegistryBaseUrl()}/plugins/${pluginName}/${fileName}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${pluginName}/${fileName}: ${res.status}`);
  }
  return res.text();
}

export function findPlugin(
  index: RegistryIndex,
  name: string,
): RegistryPlugin | undefined {
  return index.plugins.find(
    (p) => p.name === name || p.name === name.replace(/^@document0\/plugin-/, ""),
  );
}

export function searchPlugins(
  index: RegistryIndex,
  query: string,
): RegistryPlugin[] {
  const q = query.toLowerCase();
  return index.plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
