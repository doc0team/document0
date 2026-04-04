<script setup lang="ts">
import TableOfContents from "./TableOfContents.vue";

const mockToc = [
  { id: "introduction", text: "Introduction", depth: 1 },
  { id: "installation", text: "Installation", depth: 2 },
  { id: "requirements", text: "Requirements", depth: 3 },
  { id: "quick-start", text: "Quick Start", depth: 2 },
  { id: "configuration", text: "Configuration", depth: 1 },
  { id: "basic-options", text: "Basic Options", depth: 2 },
  { id: "advanced", text: "Advanced", depth: 2 },
  { id: "api-reference", text: "API Reference", depth: 1 },
];
</script>

<template>
  <TableOfContents :toc="mockToc" />
</template>
