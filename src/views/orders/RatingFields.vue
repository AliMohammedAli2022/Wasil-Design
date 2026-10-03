<script setup>
import FormSelect from "../ui/FormSelect.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <FormSelect
    :model="{
      name: 'stars',
      label: 'التقييم',
      values: {
        5: '★★★★★',
        4: '★★★★',
        3: '★★★',
        2: '★★',
        1: '★',
      },
      value: '5',
    }"
  />
  <label>ملاحظتك <textarea name="text" maxlength="500"></textarea></label>
</template>
