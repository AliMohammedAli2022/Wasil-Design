<script setup>
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="muted">{{ `عدد الطلبات: ${model.orders.length}` }}</p>
  <ViewContent :content="[model.orderList(model.orders)].flat()" />
</template>
