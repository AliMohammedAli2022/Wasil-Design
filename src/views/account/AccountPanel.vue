<script setup>
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div class="account-panel-content">
    <ViewContent :content="model.content" />
  </div>
</template>
