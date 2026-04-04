<script setup lang="ts">
import { computed } from "vue";

const previewModules = import.meta.glob<{ default: any }>(
  "../../../registry/ui/**/preview.vue"
);

const previews = computed(() => {
  return Object.keys(previewModules).map((key) => {
    const match = key.match(/registry\/ui\/([^/]+)\/([^/]+)\/preview\.vue$/);
    if (!match) return null;
    return { namespace: match[1], component: match[2] };
  }).filter(Boolean) as { namespace: string; component: string }[];
});
</script>

<template>
  <div class="p-8">
    <h1 class="text-xl font-bold mb-4">Vue Component Previews</h1>
    <p v-if="previews.length === 0" class="text-muted-foreground text-sm">
      No preview.vue files found in the registry.
    </p>
    <ul v-else class="space-y-2">
      <li v-for="p in previews" :key="`${p.namespace}/${p.component}`">
        <RouterLink
          :to="`/preview/${p.namespace}/${p.component}`"
          class="text-primary underline underline-offset-2"
        >
          {{ p.namespace }}/{{ p.component }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
