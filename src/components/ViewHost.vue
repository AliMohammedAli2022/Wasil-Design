<script setup>
import { computed } from "vue";
import ViewContent from "./ViewContent.vue";
const props = defineProps({
  factory: { type: Function, required: true },
  revision: Number,
});
const content = computed(() => {
  props.revision;
  return props.factory();
});
</script>
<template>
  <ViewContent :content="content" />
</template>
