<script setup lang="ts">
import Sidebar from "@registry/ui/document0-vue/sidebar/Sidebar.vue";
import MobileSidebar from "@/components/MobileSidebar.vue";
import { usePageTree } from "@/composables/useSource";

const tree = usePageTree();
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header
      class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
    >
      <div class="flex h-14 items-center gap-4 px-4">
        <MobileSidebar :tree="tree" />
        <span class="text-sm font-semibold tracking-tight">My Docs</span>
      </div>
    </header>
    <div class="flex flex-1">
      <Sidebar :tree="tree" />
      <main class="min-w-0 flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>
