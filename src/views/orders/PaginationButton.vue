<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <button
    type="button"
    data-action="home-page"
    :data-page="model.page"
    :disabled="model.disabled"
    :aria-current="model.current ? 'page' : undefined"
    :aria-label="
      typeof model.label === 'number' ? `الصفحة ${model.label}` : model.label
    "
  >
    {{ model.label }}
  </button>
</template>
