<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

const props = defineProps<{
  toc: TocEntry[];
}>();

const activeId = ref("");

function updateActive() {
  const atBottom =
    window.innerHeight + window.scrollY >= document.body.scrollHeight - 50;
  if (atBottom && props.toc.length > 0) {
    activeId.value = props.toc[props.toc.length - 1].id;
    return;
  }

  const threshold = 80;
  let current = props.toc.length > 0 ? props.toc[0].id : "";
  for (const { id } of props.toc) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= threshold) {
      current = id;
    }
  }
  activeId.value = current;
}

onMounted(() => {
  updateActive();
  window.addEventListener("scroll", updateActive, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateActive);
});
</script>

<template>
  <div class="sticky top-20">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
      On this page
    </p>
    <ul class="space-y-1">
      <li
        v-for="entry in toc"
        :key="entry.id"
        :style="{ paddingLeft: `${(entry.depth - 1) * 12}px` }"
      >
        <a
          :href="`#${entry.id}`"
          :class="[
            'block py-0.5 text-sm transition-colors',
            activeId === entry.id
              ? 'text-sky-400 font-medium'
              : 'text-zinc-500 hover:text-zinc-300',
          ]"
        >
          {{ entry.text }}
        </a>
      </li>
    </ul>
  </div>
</template>
