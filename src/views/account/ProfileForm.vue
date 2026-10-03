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
  <form id="profile-form" class="form-stack">
    <FormInput
      :model="{
        name: 'name',
        label: 'الاسم',
        value: model.u.name,
        attrs: 'required',
      }"
    />
    <FormSelect
      :model="{
        name: 'province',
        label: 'المحافظة',
        values: Object.fromEntries(model.provinces.map((p) => [p, p])),
        value: model.u.province,
      }"
    />
    <FormInput
      :model="{
        name: 'area',
        label: 'المنطقة',
        value: model.u.area,
        attrs: 'required',
      }"
    />
    <FormInput
      :model="{
        name: 'address',
        label: 'العنوان',
        value: model.u.address,
        attrs: 'required',
      }"
    />
    <FormInput
      :model="{
        name: 'phone2',
        label: 'هاتف احتياطي',
        value: model.u.phone2 || '',
        attrs: `${model.PHONE_ATTRIBUTES} autocomplete=&quot;tel&quot;`,
      }"
    />
    <LocationFields
      :model="{
        loc: model.u.location,
      }"
    />
    <p class="file-help">
      يرسل التعديل لمراجعة الإدارة مع بقاء رقم الحساب ثابتاً.
    </p>
    <p class="inline-error">{{ ui.formError }}</p>
    <button class="primary-button">إرسال التعديل للمراجعة</button>
  </form>
</template>
