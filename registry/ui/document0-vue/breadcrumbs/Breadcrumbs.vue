<script setup lang="ts">
interface BreadcrumbItem {
  name: string;
  url?: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

<template>
  <nav v-if="items.length > 1" aria-label="Breadcrumb" class="mb-4">
    <ol class="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="flex items-center gap-1.5"
      >
        <span v-if="i > 0" class="text-zinc-700">/</span>
        <RouterLink
          v-if="i < items.length - 1 && item.url"
          :to="item.url"
          class="hover:text-zinc-300 transition-colors"
        >
          {{ item.name }}
        </RouterLink>
        <span v-else class="text-zinc-400">{{ item.name }}</span>
      </li>
    </ol>
  </nav>
</template>
