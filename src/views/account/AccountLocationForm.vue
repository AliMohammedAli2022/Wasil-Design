<script setup>
import LocationFields from "../ui/LocationFields.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui } = useViewState();
</script>
<template>
  <form id="account-location-form" class="account-location-form">
    <h3>موقع الحساب</h3>
    <p class="file-help">
      اختر نقطة بالضغط على الخريطة أو اسحب العلامة، ثم اضغط حفظ الموقع. يمكنك
      تعديل الموقع حتى مع وجود طلبات نشطة.
    </p>
    <LocationFields
      :model="{
        loc: model.u.location,
      }"
    />
    <p class="inline-error" role="alert">{{ ui.formError }}</p>
    <button type="submit" class="primary account-location-save">
      حفظ الموقع
    </button>
  </form>
</template>
