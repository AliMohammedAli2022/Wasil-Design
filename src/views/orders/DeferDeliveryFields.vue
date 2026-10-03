<script setup>
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <FormInput
    :model="{
      name: 'when',
      label: 'موعد التسليم الجديد',
      value: '',
      attrs: 'type=&quot;datetime-local&quot; required',
    }"
  />
  <FormInput
    :model="{
      name: 'reason',
      label: 'سبب التأجيل بطلب الزبون',
      value: '',
      attrs: 'required maxlength=&quot;300&quot;',
    }"
  />
  <p>تبقى الشحنة بحوزتك دون تسوية أو تسجيل تعذر. ينتظر الموعد موافقة التاجر.</p>
</template>
