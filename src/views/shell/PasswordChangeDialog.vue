<script setup>
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="muted">تغيير كلمة المرور يتفعّل عند ربط الحسابات بالخادم.</p>
  <form id="password-change-form" class="form-stack">
    <FormInput
      :model="{
        name: 'newPassword',
        label: 'كلمة المرور الجديدة',
        value: '',
        attrs: {
          type: 'password',
          required: true,
          autocomplete: 'new-password',
          minlength: model.courier ? undefined : 8,
        },
      }"
    />
    <FormInput
      :model="{
        name: 'confirmPassword',
        label: 'تأكيد كلمة المرور',
        value: '',
        attrs: {
          type: 'password',
          required: true,
          autocomplete: 'new-password',
          minlength: model.courier ? undefined : 8,
        },
      }"
    />
    <button type="submit" class="primary-button">التحقق من كلمة المرور</button>
  </form>
</template>
