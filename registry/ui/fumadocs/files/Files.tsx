"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { FileIcon, FolderIcon, FolderOpen } from "lucide-react";
import { type HTMLAttributes, type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

/**
 * File tree display component with collapsible folders.
 *
 * Ported from fumadocs-ui (Base UI variant).
 *
 * Usage:
 * ```tsx
 * <Files>
 *   <Folder name="src" defaultOpen>
 *     <File name="index.ts" />
 *     <File name="utils.ts" />
 *   </Folder>
 *   <File name="package.json" />
 * </Files>
 * ```
 */
export function Files({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        "not-prose rounded-lg border bg-card p-2 text-sm",
        className,
      )}
    >
      {props.children}
    </div>
  );
}

export interface FileProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  icon?: ReactNode;
}

export interface FolderProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export function File({
  name,
  icon = <FileIcon className="size-4" />,
  className,
  ...rest
}: FileProps) {
  return (
    <div
      className={twMerge(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground [&_svg]:size-4",
        className,
      )}
      {...rest}
    >
      {icon}
      {name}
    </div>
  );
}

export function Folder({ name, defaultOpen = false, children, ...props }: FolderProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground [&_svg]:size-4"
      >
        {open ? <FolderOpen className="size-4" /> : <FolderIcon className="size-4" />}
        {name}
      </Collapsible.Trigger>
      <Collapsible.Panel className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="ms-2 flex flex-col border-l ps-2">{children}</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
