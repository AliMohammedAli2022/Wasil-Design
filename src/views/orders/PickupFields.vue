<script setup>
import ScanCodeField from "../../components/ScanCodeField.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p v-if="model.o.kind !== 'free'" class="status-note">
    {{ "المطلوب دفعه للمرسل: " }}
    {{ model.money(model.o.kind === "free" ? 0 : model.o.amount) }}
    {{ " د.ع" }}
  </p>
  <label class="checkbox"
    ><input type="checkbox" name="inspected" :required="true" /> راجعت عدد القطع
    والتغليف والمطابقة وعالجت أي اختلاف.</label
  >
  <label class="checkbox"
    ><input type="checkbox" name="paid" :required="true" />
    {{
      model.o.kind === "free"
        ? "تسلمت الشحنة من المرسل."
        : "دفعت القيمة المستحقة وتسلمت الشحنة."
    }}</label
  >
  <ScanCodeField
    :key="`${model.o.id}-pickup`"
    :label="
      model.o.kind === 'free'
        ? 'رمز الاستلام من المرسل (أو أدخله يدوياً)'
        : 'رمز الاستلام من التاجر (أو أدخله يدوياً)'
    "
  ></ScanCodeField>
</template>
