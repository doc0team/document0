export interface MdcNode {
  type: "element" | "text";
  tag?: string;
  props?: Record<string, unknown>;
  children?: MdcNode[];
  value?: string;
}

export interface MdcRoot {
  type: "root";
  children: MdcNode[];
}

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

export interface ProcessedMdc {
  body: MdcRoot;
  frontmatter: Record<string, unknown>;
  toc: TocEntry[];
}

export interface ProcessedMdcHtml {
  html: string;
  frontmatter: Record<string, unknown>;
  toc: TocEntry[];
}
