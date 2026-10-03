<script setup>
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div class="detail-row">
    <span><ViewContent :content="model.label" /></span>
    <strong><ViewContent :content="model.value" /></strong>
  </div>
</template>
