<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <template v-if="model.loc"
    ><a
      target="_blank"
      rel="noopener noreferrer"
      :href="
        'https://www.google.com/maps/search/?api=1&amp;query=' +
        encodeURIComponent(model.loc.lat + ',' + model.loc.lng)
      "
      ><MaterialIcon
        :model="{
          n: 'location_on',
        }"
      />
      {{ " " }}
      {{ model.label }}</a
    ></template
  >
</template>
