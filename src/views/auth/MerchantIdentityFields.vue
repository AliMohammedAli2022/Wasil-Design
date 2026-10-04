<script setup>
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <FormInput
    :model="{
      name: 'name',
      label: 'الاسم الثلاثي',
      value: model.r.name,
      attrs: 'required maxlength=&quot;80&quot;',
    }"
  />
  <FormInput
    :model="{
      name: 'phone',
      label: 'رقم الهاتف',
      value: model.r.phone,
      attrs: `required ${model.PHONE_ATTRIBUTES} autocomplete=&quot;tel&quot; placeholder=&quot;07700000000&quot;`,
    }"
  />
  <FormInput
    :model="{
      name: 'password',
      label: 'كلمة المرور',
      value: model.r.password,
      attrs:
        'type=&quot;password&quot; required minlength=&quot;3&quot; autocomplete=&quot;new-password&quot;',
    }"
  />
  <p class="file-help">
    رقم عراقي من 11 رقماً يبدأ بـ077 أو078 أو079. تُقبل الأرقام الإنجليزية فقط.
  </p>
</template>
