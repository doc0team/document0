<script setup lang="ts">
import Breadcrumbs from "./Breadcrumbs.vue";

const mockBreadcrumbs = [
  { name: "Docs", url: "#" },
  { name: "Components", url: "#" },
  { name: "Breadcrumbs" },
];
</script>

<template>
  <Breadcrumbs :items="mockBreadcrumbs" />
</template>
