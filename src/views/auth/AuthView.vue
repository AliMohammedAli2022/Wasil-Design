<script setup>
import AuthBrand from "./AuthBrand.vue";
import LoginForm from "./LoginForm.vue";
import RoleChoices from "./RoleChoices.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div :class="'glass-entry ' + (model.state.authRole ? 'is-login' : '')">
    <div class="glass-orb orb-blue" aria-hidden="true"></div>
    <div class="glass-orb orb-orange" aria-hidden="true"></div>
    <div class="entry-content">
      <AuthBrand :model="model" />
      <LoginForm v-if="model.state.authRole" :model="model" />
      <RoleChoices v-else :model="model" />
      <button
        v-if="!model.state.authRole && model.state.authIntent === 'register'"
        type="button"
        class="auth-text-button"
        data-action="login-page"
      >
        لديك حساب؟ تسجيل الدخول
      </button>
      <p class="entry-signature">توصيل أسرع… لحياة أسهل</p>
    </div>
  </div>
</template>
