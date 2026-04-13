<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchPage, type PageData } from "@/composables/useSource";
import MdcRenderer from "@/components/MdcRenderer.vue";
import Callout from "@/components/mdc/Callout.vue";
import Breadcrumbs from "@registry/ui/document0-vue/breadcrumbs/Breadcrumbs.vue";
import PageNavigation from "@registry/ui/document0-vue/page-navigation/PageNavigation.vue";
import TableOfContents from "@registry/ui/document0-vue/toc/TableOfContents.vue";

const mdcComponents = {
  callout: Callout,
};

const route = useRoute();
const page = ref<PageData | null>(null);
const loading = ref(true);
const notFound = ref(false);

async function loadPage() {
  loading.value = true;
  notFound.value = false;

  const slugParts = route.params.slug;
  const slug = Array.isArray(slugParts)
    ? slugParts.join("/")
    : slugParts ?? "";

  const data = await fetchPage(slug);

  if (!data) {
    notFound.value = true;
    loading.value = false;
    return;
  }

  page.value = data;
  loading.value = false;
  document.title = `${data.title} | My Docs`;
}

watch(() => route.params.slug, loadPage, { immediate: true });
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-20">
    <p class="text-sm text-muted-foreground">Loading...</p>
  </div>

  <div v-else-if="notFound" class="flex items-center justify-center py-20">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-2">Page not found</h1>
      <p class="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
    </div>
  </div>

  <div v-else-if="page" class="mx-auto flex w-full max-w-5xl gap-8 px-6 py-8">
    <article class="min-w-0 max-w-3xl flex-1">
      <Breadcrumbs
        v-if="page.breadcrumbs.length > 1"
        :items="page.breadcrumbs"
      />
      <h1 class="mb-2 text-3xl font-bold tracking-tight">
        {{ page.title }}
      </h1>
      <p v-if="page.description" class="mb-8 text-muted-foreground">
        {{ page.description }}
      </p>
      <MdcRenderer :body="page.body" :components="mdcComponents" tag="section" />
      <PageNavigation :previous="page.previous" :next="page.next" />
    </article>
    <TableOfContents v-if="page.toc.length > 0" :toc="page.toc" />
  </div>
</template>
