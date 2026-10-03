<script setup>
import LocationPanel from "../../components/LocationPanel.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <LocationPanel :location="model.loc" :name="model.label"></LocationPanel>
</template>
