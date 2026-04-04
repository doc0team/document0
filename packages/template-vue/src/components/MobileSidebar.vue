<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Menu, X } from "lucide-vue-next";
import type { TreeNode } from "@document0/core";
import SidebarNode from "@registry/ui/document0-vue/sidebar/SidebarNode.vue";

defineProps<{
  tree: TreeNode[];
}>();

const open = ref(false);
const route = useRoute();

watch(() => route.path, () => {
  open.value = false;
});
</script>

<template>
  <button
    class="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
    @click="open = !open"
  >
    <Menu class="h-5 w-5" />
    <span class="sr-only">Toggle sidebar</span>
  </button>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 bg-black/50" @click="open = false" />
    </Transition>
    <Transition name="slide">
      <div
        v-if="open"
        class="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background p-0"
      >
        <div class="flex items-center justify-between px-4 pt-4">
          <span class="text-sm font-semibold">Navigation</span>
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="h-full overflow-y-auto px-3 py-4">
          <ul class="space-y-0.5">
            <SidebarNode v-for="(node, i) in tree" :key="i" :node="node" />
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
