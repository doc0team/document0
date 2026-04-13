<script setup lang="ts">
import type { TreeNode } from "@document0/core";
import SidebarNode from "./SidebarNode.vue";

defineProps<{
  tree: TreeNode[];
}>();
</script>

<template>
  <nav
    class="hidden md:flex w-[240px] shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-14 h-[calc(100vh-3.5rem)]"
  >
    <div
      class="overflow-y-auto px-3 py-5 flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800"
    >
      <ul class="space-y-0.5">
        <SidebarNode v-for="(node, i) in tree" :key="i" :node="node" />
      </ul>
    </div>
  </nav>
</template>
