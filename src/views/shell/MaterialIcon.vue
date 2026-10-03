<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <span class="material-symbols-outlined" aria-hidden="true">{{
    model.n
  }}</span>
</template>
