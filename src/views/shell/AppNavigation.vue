<script setup>
import NavigationIcon from "../ui/NavigationIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div>
    <template v-for="[key, label] in model.list"
      ><button
        type="button"
        data-action="nav"
        :data-screen="key"
        :class="{
          new: key === 'new',
          active: key === model.state.screen,
        }"
        :aria-current="key === model.state.screen ? 'page' : undefined"
      >
        <NavigationIcon
          :model="{
            key: key,
          }"
        />
        <span>{{ label }}</span>
      </button></template
    >
  </div>
</template>
