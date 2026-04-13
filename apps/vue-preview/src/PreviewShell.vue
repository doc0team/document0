<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

const props = defineProps<{
  namespace: string;
  component: string;
}>();

const previewModules = import.meta.glob<{ default: any }>(
  "../.registry/ui/**/preview.vue"
);

const PreviewComponent = computed(() => {
  const key = `../.registry/ui/${props.namespace}/${props.component}/preview.vue`;
  const loader = previewModules[key];
  if (!loader) return null;
  return defineAsyncComponent(loader);
});
</script>

<template>
  <div v-if="PreviewComponent" class="p-6">
    <component :is="PreviewComponent" />
  </div>
  <div v-else class="flex items-center justify-center p-12 text-muted-foreground text-sm">
    Preview not found for {{ namespace }}/{{ component }}
  </div>
</template>
