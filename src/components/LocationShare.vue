<script setup>
import MapAppPicker from "./MapAppPicker.vue";
defineProps({ location: Object, name: String });
</script>
<template>
  <MapAppPicker :location="location" :name="name" mode="share" />
</template>
