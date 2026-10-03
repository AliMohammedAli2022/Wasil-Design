<script setup>
import FormInput from "../ui/FormInput.vue";
import FormSelect from "../ui/FormSelect.vue";
import LocationFields from "../ui/LocationFields.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui } = useViewState();
</script>
<template>
  <form id="free-register-form" class="form-stack">
    <FormInput
      :model="{
        name: 'name',
        label: 'الاسم',
        value: '',
        attrs: 'required',
      }"
    />
    <FormInput
      :model="{
        name: 'phone',
        label: 'الهاتف',
        value: '',
        attrs: `required ${model.PHONE_ATTRIBUTES}`,
      }"
    />
    <FormSelect
      :model="{
        name: 'province',
        label: 'المحافظة',
        values: Object.fromEntries(model.provinces.map((p) => [p, p])),
        value: 'بغداد',
      }"
    />
    <FormInput
      :model="{
        name: 'area',
        label: 'المنطقة',
        value: '',
        attrs: 'required',
      }"
    />
    <FormInput
      :model="{
        name: 'address',
        label: 'العنوان',
        value: '',
        attrs: 'required',
      }"
    />
    <LocationFields
      :model="{
        loc: {
          lat: 33.3,
          lng: 44.43,
        },
      }"
    />
    <p class="inline-error">{{ ui.formError }}</p>
    <button class="primary-button" type="submit">إنشاء الحساب</button>
  </form>
</template>
