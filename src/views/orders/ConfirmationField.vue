<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <label class="checkbox"
    ><input type="checkbox" name="confirmed" :required="true" />
    {{ model.label }}</label
  >
</template>
