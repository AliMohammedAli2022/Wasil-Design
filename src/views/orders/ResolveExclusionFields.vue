<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p>{{ "سبب الاستثناء: " + model.o.exclusionReason }}</p>
  <label
    >قرار التاجر
    <select name="resolution" :required="true">
      <option value="draft">إبقاؤه محفوظاً للتعديل</option>
      <option value="published">إعادة نشره بعد التأكد من جاهزيته</option>
    </select></label
  >
</template>
