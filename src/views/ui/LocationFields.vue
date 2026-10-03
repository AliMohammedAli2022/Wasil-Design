<script setup>
import LocationPanel from "../../components/LocationPanel.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <LocationPanel
    :location="model.loc"
    :editable="!model.readonly"
    :required="!model.readonly"
  ></LocationPanel>
</template>
