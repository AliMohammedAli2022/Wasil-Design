<script setup>
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <FormInput
    :model="{
      name: 'reason',
      label: 'ما مشكلة الطلب؟',
      value: '',
      attrs: 'required maxlength=&quot;300&quot;',
    }"
  />
  <p>
    يُرفع هذا الطلب فقط من حجزك دون استلامه أو دفع قيمته. يبقى محفوظاً بانتظار
    قرار التاجر، وتكمل باقي طلباتك.
  </p>
</template>
