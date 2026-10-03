<script setup>
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p>
    {{
      "قيمة البضاعة الكلية: " +
      model.money(model.o.amount) +
      " د.ع — " +
      model.o.count +
      " قطع"
    }}
  </p>
  <FormInput
    :model="{
      name: 'returnCount',
      label: 'عدد القطع المرتجعة',
      value: '',
      attrs: `type=&quot;number&quot; min=&quot;1&quot; max=&quot;${model.o.count - 1}&quot; step=&quot;1&quot; required`,
    }"
  />
  <FormInput
    :model="{
      name: 'returnAmount',
      label: 'قيمة البضاعة المرتجعة فقط',
      value: '',
      attrs: `type=&quot;number&quot; min=&quot;1&quot; max=&quot;${model.o.amount - 1}&quot; step=&quot;1&quot; required`,
    }"
  />
  <p
    class="status-note"
    id="partial-return-preview"
    aria-live="polite"
    :data-total="model.o.amount"
  >
    المبلغ المتبقي للجزء المسلَّم يُحسب تلقائياً. أجور التوصيل والإرجاع منفصلة
    عن قيمة البضاعة.
  </p>
  <p>
    هذا اقتراح ينتظر موافقة التاجر؛ لا تسوية مالية قبل تأكيد تحصيل الجزء
    المسلَّم.
  </p>
</template>
