<script setup>
import { isVNode } from "vue";
defineOptions({ inheritAttrs: false });
defineProps({ content: null });
</script>

<template>
  <template v-if="Array.isArray(content)">
    <ViewContent
      v-for="(item, index) in content"
      :key="index"
      :content="item"
    />
  </template>
  <component v-else-if="isVNode(content)" :is="content" />
  <template v-else-if="content != null && typeof content !== 'boolean'">{{
    content
  }}</template>
</template>
