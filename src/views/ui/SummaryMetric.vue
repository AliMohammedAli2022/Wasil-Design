<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <button
    v-bind="{
      type: 'button',
      class: 'metric ' + (model.color || ''),
      ...model.attributes,
    }"
  >
    <div class="metric-label">
      {{ model.label }}
      <MaterialIcon
        :model="{
          n: model.ic,
        }"
      />
    </div>
    <div class="metric-value">{{ model.value }}</div>
  </button>
</template>
