<script setup>
import FormInput from "../ui/FormInput.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p v-if="model.o.kind !== 'free'">
    {{ "قيمة البضاعة الواجب استردادها: " }}
    {{
      model.money(
        model.o.goodsPaid
          ? model.o.amount -
              (model.o.partialDelivered ? model.o.partial.amount : 0)
          : 0,
      )
    }}
    {{ " د.ع" }}
  </p>
  <FormInput
    :model="{
  name: 'fees',
  label: 'أجور الذهاب والراجع المسواة',
  value: Number(model.o.returnFee) + (model.o.partialDelivered &amp;&amp; model.o.feePayer === 'customer' ? 0 : Number(model.o.fee)),
  attrs: 'type=&quot;number&quot; min=&quot;0&quot; required'
}"
  />
  <ViewContent
    :content="
      model.confirm(
        model.o.kind === 'free'
          ? 'تم تسليم الشحنة المرتجعة وتسوية الأجور.'
          : 'استرددت قيمة المرتجع وسُويت الأجور. هذا تأكيد محلي لا ينفذ تحويلاً.',
      )
    "
  />
</template>
