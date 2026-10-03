<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <ol class="wizard-steps">
    <template v-for="(label, i) in model.labels"
      ><li :class="i === model.step ? 'active' : ''">
        <span
          ><template v-if="i &lt; model.step">✓</template>
          <template v-else>{{ i + 1 }}</template></span
        >
        {{ label }}
      </li></template
    >
  </ol>
</template>
