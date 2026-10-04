<script setup>
import { attributes } from "../../services/formFields.js";
import { mergeProps, reactive } from "vue";
import FormInput from "../ui/FormInput.vue";
import LocationFields from "../ui/LocationFields.vue";
import FormSelect from "../ui/FormSelect.vue";
import DetailRow from "../ui/DetailRow.vue";
import AddressFields from "../../components/AddressFields.vue";

defineOptions({ inheritAttrs: false });
const props = defineProps({ model: { type: Object, required: true } });
const sender = props.model.d.sender;
const addressForm = reactive({
  name:
    sender.addressName ??
    props.model.u.addresses?.find((a) => a.id === sender.addressId)?.name ??
    (props.model.d.pickupChoice === "new" ? "" : "عنوان الملف الشخصي"),
  province: sender.province ?? props.model.u.province,
  area: sender.area || "",
  address: sender.address || "",
  lat: sender.location?.lat ?? "",
  lng: sender.location?.lng ?? "",
});
</script>
<template>
  <template v-if="model.d.kind === 'free'"
    ><FormInput
      :model="{
        name: 'senderName',
        label: 'اسم المرسل',
        value: model.d.sender.name,
        attrs: 'required maxlength=&quot;80&quot;',
      }"
    />
    <FormInput
      :model="{
        name: 'senderPhone',
        label: 'هاتف المرسل',
        value: model.d.sender.phone,
        attrs: `required ${model.PHONE_ATTRIBUTES} autocomplete=&quot;tel&quot;`,
      }"
    />
    <FormInput
      :model="{
        name: 'senderAddress',
        label: 'عنوان المرسل',
        value: model.d.sender.address,
        attrs: 'required maxlength=&quot;200&quot;',
      }"
    />
    <FormInput
      :model="{
        name: 'senderArea',
        label: 'منطقة المرسل',
        value: model.d.sender.area,
        attrs: 'required maxlength=&quot;80&quot;',
      }"
    />
    <LocationFields
      :model="{
        loc: model.d.sender.location,
      }"
    />
    <label
      >صورة الشحنة من الكاميرا
      <input
        v-bind="
          mergeProps(
            {
              name: 'photo',
              type: 'file',
              accept: 'image/*',
              capture: 'environment',
            },
            attributes(model.d.photo ? '' : 'required'),
          )
        "
    /></label>
    <template v-if="model.d.photo"
      ><p class="file-help">صورة مرفقة. اختر صورة أخرى لاستبدالها.</p></template
    >

    <p class="status-note">
      التوصيل الحر مقابل أجرة فقط، دون دفع أو تحصيل قيمة البضاعة.
    </p></template
  >
  <template v-else>
    <DetailRow :model="{ label: 'اسم التاجر', value: model.u.name }" />
    <DetailRow
      :model="{
        label: 'اسم النشاط',
        value: model.u.businessName || 'غير محدد',
      }" />
    <DetailRow :model="{ label: 'رقم الموبايل', value: model.u.phone }" />
    <FormInput
      :model="{
        name: 'senderPhone2',
        label: 'رقم موبايل احتياط (اختياري)',
        value: model.d.sender.phone2 ?? model.u.phone2,
        attrs: model.PHONE_ATTRIBUTES,
      }" />
    <FormSelect
      :model="{
        name: 'pickupAddress',
        label: 'عنوان استلام الطلب',
        values: {
          new: 'إضافة عنوان جديد',
          '': 'العنوان الأساسي من الملف الشخصي',
          ...Object.fromEntries(
            (model.u.addresses || []).map((a) => [
              a.id,
              a.name + ' — ' + a.address,
            ]),
          ),
        },
        value: model.d.pickupChoice ?? model.d.sender.addressId ?? '',
      }" />
    <AddressFields
      :form="addressForm"
      :default-province="model.u.province"
      required-location
      :names="{
        name: 'senderAddressName',
        province: 'senderProvince',
        area: 'senderArea',
        address: 'senderAddress',
      }"
  /></template>
</template>
