<script setup>
import ScanCodeField from "../../components/ScanCodeField.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="status-note">
    امسح رمز المرتجع من التاجر عند الوصول، أو أدخل الرمز يدوياً. هذا لا يغلق
    التسوية المالية.
  </p>
  <ScanCodeField
    :key="`${model.o.id}-return`"
    label="رمز المرتجع من التاجر"
  ></ScanCodeField>
</template>
