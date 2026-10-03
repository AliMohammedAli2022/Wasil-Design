<script setup>
import CourierMap from "../../components/CourierMap.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <CourierMap :groups="model.groups"></CourierMap>
</template>
