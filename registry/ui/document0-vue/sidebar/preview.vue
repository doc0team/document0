<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import type { TreeNode } from "@document0/core";

const mockTree: TreeNode[] = [
  { type: "page", name: "Introduction", url: "#", slug: "intro" },
  { type: "separator", name: "Getting Started" },
  { type: "page", name: "Installation", url: "#", slug: "install" },
  { type: "page", name: "Quick Start", url: "#", slug: "quickstart" },
  { type: "separator", name: "Guides" },
  {
    type: "folder",
    name: "Components",
    defaultOpen: true,
    index: { type: "page", name: "Overview", url: "#", slug: "overview" },
    children: [
      { type: "page", name: "Buttons", url: "#", slug: "buttons" },
      { type: "page", name: "Forms", url: "#", slug: "forms" },
      { type: "page", name: "Tables", url: "#", slug: "tables" },
    ],
  },
  { type: "page", name: "API Reference", url: "#", slug: "api" },
] as TreeNode[];
</script>

<template>
  <Sidebar :tree="mockTree" />
</template>
