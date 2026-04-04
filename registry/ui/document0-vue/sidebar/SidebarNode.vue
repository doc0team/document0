<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import type { TreeNode } from "@document0/core";

const props = defineProps<{
  node: TreeNode;
  depth?: number;
}>();

const route = useRoute();
const depth = computed(() => props.depth ?? 0);
const pathname = computed(() => route.path);
const manualOpen = ref<boolean | null>(null);

function isAncestor(node: TreeNode, path: string): boolean {
  if (node.type === "page") return node.url === path;
  if (node.type === "folder") {
    if (node.index?.url === path) return true;
    return node.children.some((c) => isAncestor(c, path));
  }
  return false;
}

const isActive = computed(() => {
  if (props.node.type === "page") return pathname.value === props.node.url;
  return false;
});

const isOpen = computed(() => {
  if (props.node.type !== "folder") return false;
  const hasActiveDescendant = isAncestor(props.node, pathname.value);
  if (manualOpen.value !== null) return manualOpen.value;
  return hasActiveDescendant || !!props.node.defaultOpen;
});

const indexActive = computed(() => {
  if (props.node.type !== "folder" || !props.node.index) return false;
  return pathname.value === props.node.index.url;
});

function toggleOpen() {
  manualOpen.value = manualOpen.value !== null ? !manualOpen.value : !isOpen.value;
}
</script>

<template>
  <!-- Separator -->
  <template v-if="node.type === 'separator'">
    <li v-if="!node.name" class="list-none py-2">
      <div class="h-px bg-zinc-800/80" />
    </li>
    <li v-else class="list-none">
      <p
        :class="[
          'px-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500',
          depth === 0 ? 'mt-6 mb-2' : 'mt-4 mb-1',
        ]"
      >
        {{ node.name }}
      </p>
    </li>
  </template>

  <!-- Page -->
  <template v-else-if="node.type === 'page'">
    <li class="list-none">
      <RouterLink
        :to="node.url"
        :class="[
          'group flex items-center gap-2 px-2.5 py-1.5 text-[13px] transition-all duration-150',
          depth > 0 ? 'ml-3 border-l border-zinc-800/60 pl-3' : '',
          isActive
            ? 'bg-sky-500/10 text-sky-400 font-medium border-l-2 border-l-sky-400'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40',
        ]"
      >
        <span v-if="node.icon" class="shrink-0 text-sm">{{ node.icon }}</span>
        <span>{{ node.name }}</span>
      </RouterLink>
    </li>
  </template>

  <!-- Folder -->
  <template v-else-if="node.type === 'folder'">
    <li class="list-none">
      <div class="flex items-center gap-0.5">
        <RouterLink
          v-if="node.index"
          :to="node.index.url"
          :class="[
            'flex-1 flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150',
            depth > 0 ? 'ml-3 border-l border-zinc-800/60 pl-3' : '',
            indexActive
              ? 'bg-sky-500/10 text-sky-400'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40',
          ]"
        >
          <span v-if="node.icon" class="shrink-0 text-sm">{{ node.icon }}</span>
          <span>{{ node.name }}</span>
        </RouterLink>
        <button
          v-else
          :class="[
            'flex-1 flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150 text-left',
            depth > 0 ? 'ml-3 border-l border-zinc-800/60 pl-3' : '',
            'text-zinc-300 hover:text-white hover:bg-zinc-800/40',
          ]"
          @click="toggleOpen"
        >
          <span v-if="node.icon" class="shrink-0 text-sm">{{ node.icon }}</span>
          <span class="flex-1">{{ node.name }}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            :class="[
              'shrink-0 text-zinc-500 transition-transform duration-200',
              isOpen ? 'rotate-90' : '',
            ]"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          v-if="node.index && node.children.length > 0"
          class="shrink-0 rounded-md p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors"
          :aria-label="isOpen ? 'Collapse' : 'Expand'"
          @click="toggleOpen"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            :class="[
              'shrink-0 text-zinc-500 transition-transform duration-200',
              isOpen ? 'rotate-90' : '',
            ]"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        :class="[
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ]"
      >
        <div class="overflow-hidden">
          <ul v-if="node.children.length > 0" class="mt-0.5 space-y-0.5 py-0.5">
            <SidebarNode
              v-for="(child, i) in node.children"
              :key="i"
              :node="child"
              :depth="depth + 1"
            />
          </ul>
        </div>
      </div>
    </li>
  </template>
</template>
