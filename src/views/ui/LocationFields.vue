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
    :show-hint="model.showHint !== false"
    :show-external-actions="model.showExternalActions !== false"
  ></LocationPanel>
</template>
