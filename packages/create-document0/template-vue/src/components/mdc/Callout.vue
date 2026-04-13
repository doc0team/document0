<script setup lang="ts">
const props = defineProps<{
  type?: "note" | "warning" | "tip" | "danger";
}>();

const config: Record<string, { icon: string; classes: string }> = {
  note: { icon: "ℹ️", classes: "border-blue-500/30 bg-blue-500/5 text-blue-200" },
  warning: { icon: "⚠️", classes: "border-amber-500/30 bg-amber-500/5 text-amber-200" },
  tip: { icon: "💡", classes: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200" },
  danger: { icon: "🚨", classes: "border-red-500/30 bg-red-500/5 text-red-200" },
};

const variant = config[props.type || "note"] || config.note;
</script>

<template>
  <div :class="['my-5 flex gap-3 rounded-lg border p-4 text-sm leading-relaxed', variant.classes]">
    <span class="text-base leading-none select-none">{{ variant.icon }}</span>
    <div class="min-w-0 flex-1 [&>p]:my-0 [&>p]:text-inherit">
      <slot />
    </div>
  </div>
</template>
