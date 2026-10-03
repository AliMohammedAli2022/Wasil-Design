<script setup>
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="muted">
    هذه معاينة في النسخة التجريبية. تغيير كلمة المرور الفعلي يتفعّل عند ربط
    الحسابات بالخادم.
  </p>
  <form id="password-change-form" class="form-stack">
    <FormInput
      :model="{
        name: 'newPassword',
        label: 'كلمة المرور الجديدة',
        value: '',
        attrs:
          'type=&quot;password&quot; required minlength=&quot;8&quot; autocomplete=&quot;new-password&quot;',
      }"
    />
    <FormInput
      :model="{
        name: 'confirmPassword',
        label: 'تأكيد كلمة المرور',
        value: '',
        attrs:
          'type=&quot;password&quot; required minlength=&quot;8&quot; autocomplete=&quot;new-password&quot;',
      }"
    />
    <button type="submit" class="primary-button">التحقق من كلمة المرور</button>
  </form>
</template>
