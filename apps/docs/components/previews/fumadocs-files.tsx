"use client";

import { Files, File, Folder } from "../../../../registry/ui/fumadocs/files/Files";

export function FilesPreview() {
  return (
    <Files>
      <Folder name="src" defaultOpen>
        <Folder name="components" defaultOpen>
          <File name="sidebar.tsx" />
          <File name="header.tsx" />
          <File name="footer.tsx" />
        </Folder>
        <Folder name="lib">
          <File name="source.ts" />
          <File name="utils.ts" />
        </Folder>
        <File name="index.ts" />
      </Folder>
      <File name="package.json" />
      <File name="tsconfig.json" />
    </Files>
  );
}
