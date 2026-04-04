<script setup lang="ts">
interface NavItem {
  name: string;
  url: string;
}

defineProps<{
  previous: NavItem | null;
  next: NavItem | null;
}>();
</script>

<template>
  <nav
    v-if="previous || next"
    class="mt-16 flex justify-between gap-4 border-t border-zinc-800 pt-6"
  >
    <div class="flex-1">
      <RouterLink
        v-if="previous"
        :to="previous.url"
        class="group flex flex-col gap-1 text-sm"
      >
        <span class="text-zinc-500 transition-colors group-hover:text-zinc-400"
          >← Previous</span
        >
        <span
          class="font-medium text-zinc-300 transition-colors group-hover:text-white"
          >{{ previous.name }}</span
        >
      </RouterLink>
    </div>
    <div class="flex-1 text-right">
      <RouterLink
        v-if="next"
        :to="next.url"
        class="group flex flex-col items-end gap-1 text-sm"
      >
        <span class="text-zinc-500 transition-colors group-hover:text-zinc-400"
          >Next →</span
        >
        <span
          class="font-medium text-zinc-300 transition-colors group-hover:text-white"
          >{{ next.name }}</span
        >
      </RouterLink>
    </div>
  </nav>
</template>
