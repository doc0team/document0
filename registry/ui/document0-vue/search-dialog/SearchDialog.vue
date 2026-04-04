<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

interface SearchResult {
  title: string;
  description?: string;
  url: string;
  score: number;
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const query = ref("");
const results = ref<SearchResult[]>([]);
const loading = ref(false);
const selected = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const router = useRouter();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      query.value = "";
      results.value = [];
      selected.value = 0;
      nextTick(() => inputEl.value?.focus());
    }
  }
);

function fetchResults(q: string) {
  if (!q.trim()) {
    results.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  fetch(`/internal/search?q=${encodeURIComponent(q)}`)
    .then((r) => r.json())
    .then((data: SearchResult[]) => {
      results.value = data;
      selected.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  query.value = value;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchResults(value), 150);
}

function navigate(url: string) {
  emit("close");
  router.push(url);
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selected.value = Math.min(selected.value + 1, results.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selected.value = Math.max(selected.value - 1, 0);
  } else if (e.key === "Enter" && results.value[selected.value]) {
    navigate(results.value[selected.value].url);
  } else if (e.key === "Escape") {
    emit("close");
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100]" @click="emit('close')">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div class="fixed inset-x-0 top-[15%] mx-auto w-full max-w-lg px-4">
        <div
          class="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          @click.stop
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
              ref="inputEl"
              type="text"
              :value="query"
              placeholder="Search docs..."
              class="flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-zinc-500"
              @input="handleInput"
              @keydown="handleKeyDown"
            />
            <kbd
              class="hidden items-center rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline-flex"
            >
              ESC
            </kbd>
          </div>
          <div class="max-h-[320px] overflow-y-auto">
            <div
              v-if="loading"
              class="px-4 py-8 text-center text-sm text-zinc-500"
            >
              Searching...
            </div>
            <div
              v-else-if="query && results.length === 0"
              class="px-4 py-8 text-center text-sm text-zinc-500"
            >
              No results for "{{ query }}"
            </div>
            <ul v-else-if="results.length > 0" class="py-2">
              <li v-for="(result, i) in results" :key="result.url">
                <button
                  type="button"
                  :class="[
                    'flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors',
                    selected === i
                      ? 'bg-sky-500/10'
                      : 'hover:bg-zinc-800/60',
                  ]"
                  @click="navigate(result.url)"
                  @mouseenter="selected = i"
                >
                  <span
                    :class="[
                      'text-sm font-medium',
                      selected === i ? 'text-sky-400' : 'text-zinc-200',
                    ]"
                  >
                    {{ result.title }}
                  </span>
                  <span
                    v-if="result.description"
                    class="line-clamp-1 text-xs text-zinc-500"
                  >
                    {{ result.description }}
                  </span>
                </button>
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
  </Teleport>
</template>
