<script setup>
import ScanCodeField from "../../components/ScanCodeField.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="status-note">
    {{ "المطلوب دفعه للمرسل: " }}
    {{ model.money(model.o.kind === "free" ? 0 : model.o.amount) }}
    {{ " د.ع" }}
  </p>
  <label class="checkbox"
    ><input type="checkbox" name="inspected" :required="true" /> راجعت عدد القطع
    والتغليف والمطابقة وعالجت أي اختلاف.</label
  >
  <label class="checkbox"
    ><input type="checkbox" name="paid" :required="true" /> دفعت القيمة المستحقة
    وتسلمت الشحنة.</label
  >
  <ScanCodeField
    :key="`${model.o.id}-pickup`"
    label="رمز الاستلام من التاجر (أو أدخله يدوياً)"
  ></ScanCodeField>
</template>
