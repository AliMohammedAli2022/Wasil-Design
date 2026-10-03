<script setup>
import CloseIcon from "../../components/CloseIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <CloseIcon></CloseIcon>
</template>
