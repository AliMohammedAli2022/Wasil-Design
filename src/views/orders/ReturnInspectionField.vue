<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <label class="checkbox"
    ><input type="checkbox" name="inspected" :required="true" /> فحصت القطع
    المرتجعة واستلمتها. تبقى التسوية المالية مفتوحة.</label
  >
</template>
