<script setup>
import { reactive } from "vue";
import AddressFields from "../../components/AddressFields.vue";
import ActionButton from "../ui/ActionButton.vue";
import RegistrationVerification from "./RegistrationVerification.vue";
import { useViewState } from "../../composables/useViewState.js";
import {
  attributes,
  PHONE_ATTRIBUTES,
  phoneDigits,
} from "../../services/formFields.js";

defineOptions({ inheritAttrs: false });
const props = defineProps({ model: { type: Object, required: true } });
const { ui } = useViewState();
const form = reactive({
  name: props.model.r.name || "",
  phone: props.model.r.phone || "",
  password: props.model.r.password || "",
  province: props.model.r.province || "بغداد",
  area: props.model.r.area || "",
  address: props.model.r.address || "",
  lat: props.model.r.location?.lat ?? "",
  lng: props.model.r.location?.lng ?? "",
});
</script>
<template>
  <section class="surface wizard">
    <form id="register-form" class="form-stack">
      <RegistrationVerification v-if="model.r.step" :phone="model.r.phone" />
      <template v-else>
        <h2>إنشاء حساب توصيل حر</h2>
        <h3>المعلومات</h3>
        <label
          >الاسم<input
            v-model.trim="form.name"
            name="name"
            required
            maxlength="80"
            autocomplete="name"
        /></label>
        <label
          >رقم الموبايل<input
            v-bind="attributes(PHONE_ATTRIBUTES)"
            v-model="form.phone"
            @input="form.phone = phoneDigits($event.target.value)"
            name="phone"
            required
            autocomplete="tel"
        /></label>
        <label
          >كلمة المرور<input
            v-model="form.password"
            name="password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
        /></label>
        <h3>العنوان</h3>
        <AddressFields :form="form" :show-name="false" required-location />
      </template>
      <p id="registration-error" class="inline-error" role="alert">
        {{ ui.formError }}
      </p>
      <div class="wizard-footer">
        <ActionButton
          :model="{ action: model.r.step ? 'register-back' : 'login-page' }"
        >
          {{ model.r.step ? "السابق" : "رجوع" }}
        </ActionButton>
        <button class="primary-button" type="submit">
          {{ model.r.step ? "تحقق وادخل" : "إنشاء الحساب" }}
        </button>
      </div>
    </form>
  </section>
</template>
