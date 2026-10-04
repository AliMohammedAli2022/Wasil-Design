<script setup>
import MapAppPicker from "../../components/MapAppPicker.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <MapAppPicker
    v-if="model.loc"
    :location="model.loc"
    :name="model.label"
    :label="model.label"
  />
</template>
