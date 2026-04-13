<script setup lang="ts">
import PageNavigation from "./PageNavigation.vue";

const mockPrevious = { name: "Installation", url: "#" };
const mockNext = { name: "Configuration", url: "#" };
</script>

<template>
  <PageNavigation :previous="mockPrevious" :next="mockNext" />
</template>
