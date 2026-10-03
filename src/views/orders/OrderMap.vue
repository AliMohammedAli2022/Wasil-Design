<script setup>
import LocationMap from "../../components/LocationMap.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <LocationMap :groups="model.groups"></LocationMap>
</template>
