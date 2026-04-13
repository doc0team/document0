<script setup lang="ts">
import { ref, watch } from "vue";

const mockResults = [
  { title: "Introduction", description: "Get started with document0", url: "#" },
  { title: "Installation", description: "Install the core packages", url: "#" },
  { title: "Quick Start", description: "Build your first docs site in 5 minutes", url: "#" },
];

const query = ref("");
const selected = ref(0);

watch(query, () => {
  selected.value = 0;
});

const filtered = ref<typeof mockResults>([]);
watch(
  query,
  (q) => {
    filtered.value = q.trim()
      ? mockResults.filter(
          (r) =>
            r.title.toLowerCase().includes(q.toLowerCase()) ||
            r.description.toLowerCase().includes(q.toLowerCase())
        )
      : [];
  },
  { immediate: true }
);
</script>

<template>
  <div class="relative h-[300px]">
    <div class="absolute inset-0 rounded-lg bg-black/60 backdrop-blur-sm" />
    <div class="absolute inset-x-0 top-[10%] mx-auto w-full max-w-lg px-4">
      <div
        class="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
      >
        <div class="flex items-center gap-3 border-b border-zinc-800 px-4">
          <svg
            class="h-4 w-4 shrink-0 text-zinc-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            v-model="query"
            type="text"
            placeholder="Search docs..."
            class="flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <kbd
            class="inline-flex items-center rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500"
          >
            ESC
          </kbd>
        </div>
        <div class="max-h-[200px] overflow-y-auto">
          <div
            v-if="query && filtered.length === 0"
            class="px-4 py-8 text-center text-sm text-zinc-500"
          >
            No results for "{{ query }}"
          </div>
          <ul v-else-if="filtered.length > 0" class="py-2">
            <li v-for="(result, i) in filtered" :key="result.title">
              <div
                :class="[
                  'flex w-full cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-left transition-colors',
                  selected === i ? 'bg-zinc-800' : 'hover:bg-zinc-800/60',
                ]"
                @mouseenter="selected = i"
              >
                <span
                  :class="[
                    'text-sm font-medium',
                    selected === i ? 'text-white' : 'text-zinc-200',
                  ]"
                >
                  {{ result.title }}
                </span>
                <span class="line-clamp-1 text-xs text-zinc-500">
                  {{ result.description }}
                </span>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="px-4 py-8 text-center text-sm text-zinc-500"
          >
            Type to search documentation
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
