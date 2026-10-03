<script setup>
import { useViewState } from "../../composables/useViewState.js";
const { ui } = useViewState();
defineProps({ phone: { type: String, default: "" } });
</script>

<template>
  <div class="registration-verification">
    <span class="material-symbols-outlined verification-icon" aria-hidden="true"
      >verified_user</span
    >
    <h2>التحقق من رقم الهاتف</h2>
    <p class="muted">أدخل كود التحقق المكوّن من 6 أرقام لإكمال التسجيل</p>
    <p class="verification-phone" dir="ltr">{{ phone }}</p>
    <label for="registration-code">كود التحقق</label>
    <input
      id="registration-code"
      name="verificationCode"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="[0-9]{6}"
      minlength="6"
      maxlength="6"
      dir="ltr"
      placeholder="------"
      required
      aria-describedby="registration-error"
      @input="ui.formError = ''"
    />
  </div>
</template>

<style scoped>
.registration-verification {
  text-align: center;
  padding: 16px 0;
}
.verification-icon {
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff0e3;
  color: #00567a;
  font-size: 32px;
  margin-bottom: 16px;
}
.registration-verification h2 {
  margin-bottom: 12px;
}
.verification-phone {
  font-weight: 700;
  margin: 12px 0 24px;
}
.registration-verification label {
  display: block;
  margin-bottom: 10px;
}
.registration-verification input {
  max-width: 300px;
  text-align: center;
  font-size: 26px;
  letter-spacing: 0.35em;
}
</style>
