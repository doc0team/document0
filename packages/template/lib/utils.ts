import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TreeNode } from "@document0/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isActiveOrAncestor(node: TreeNode, currentUrl: string): boolean {
  if (node.type === "page") return node.url === currentUrl;
  if (node.type === "folder") {
    if (node.index?.url === currentUrl) return true;
    return node.children.some((child) => isActiveOrAncestor(child, currentUrl));
  }
  return false;
}
