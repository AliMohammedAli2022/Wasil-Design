<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <template v-if="model.contents[model.op]"
    ><p>{{ model.contents[model.op] }}</p></template
  >
</template>
