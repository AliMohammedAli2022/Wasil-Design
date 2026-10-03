<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div class="entry-brand">
    <span class="auth-logo-art" role="img" aria-label="شعار واصل"></span>
    <strong>واصل</strong>
    <span class="entry-english">WASIL · FOR DELIVERY</span>
    <template v-if="model.state.authRole"
      ><div class="login-role-label">
        {{ "حساب " }} {{ model.roleNames[model.state.authRole] }}
      </div></template
    >
  </div>
</template>
