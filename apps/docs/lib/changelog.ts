/**
 * Split root CHANGELOG.md into a preamble and release sections (## [version] - date).
 */
export interface ChangelogRelease {
  /** e.g. "0.5.0" or "Unreleased" */
  version: string;
  /** ISO date from heading, if present */
  dateIso: string | null;
  /** Body markdown after the ## line */
  bodyMd: string;
}

export function parseChangelogMarkdown(full: string): {
  preambleMd: string;
  releases: ChangelogRelease[];
} {
  const text = full.replace(/^#\s+Changelog\s*\n+/m, "");
  const parts = text.split(/^## /m);
  const preambleMd = (parts[0] ?? "").trim();
  const releases: ChangelogRelease[] = [];

  for (let i = 1; i < parts.length; i++) {
    const block = parts[i] ?? "";
    const nl = block.indexOf("\n");
    const titleLine = (nl === -1 ? block : block.slice(0, nl)).trim();
    const bodyMd = (nl === -1 ? "" : block.slice(nl + 1)).trim();

    const m = titleLine.match(/^\[(Unreleased|[^\]]+)\](?:\s*-\s*(.+))?$/);
    if (!m) continue;

    const version = m[1]!;
    const dateIso = m[2]?.trim() || null;
    releases.push({ version, dateIso, bodyMd });
  }

  return { preambleMd, releases };
}

const SUMMARY_HEADING = /^###\s+Summary\s*$/;

/**
 * If the release body starts with `### Summary`, extract that block for the sidebar
 * and return the remainder for the main column (Added / Changed / etc.).
 */
export function splitReleaseSummary(bodyMd: string): {
  summaryMd: string | null;
  restMd: string;
} {
  const lines = bodyMd.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;

  if (i >= lines.length || !SUMMARY_HEADING.test(lines[i].trim())) {
    return { summaryMd: null, restMd: bodyMd.trim() };
  }

  i++;
  const summaryLines: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (/^###\s+/.test(line)) break;
    summaryLines.push(line);
    i++;
  }

  const summaryMd = summaryLines.join("\n").trim();
  const restMd = lines.slice(i).join("\n").trim();

  return {
    summaryMd: summaryMd.length > 0 ? summaryMd : null,
    restMd,
  };
}

export function formatChangelogSidebarDate(
  version: string,
  dateIso: string | null,
): string {
  if (version === "Unreleased") return "UNRELEASED";
  if (!dateIso) return version.toUpperCase();
  const d = new Date(`${dateIso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}
