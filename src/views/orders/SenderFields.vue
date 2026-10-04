<script setup>
import { reactive } from "vue";
import FormInput from "../ui/FormInput.vue";
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
  <DetailRow
    :model="{
      label: model.d.kind === 'free' ? 'الاسم' : 'اسم التاجر',
      value: model.u.name,
    }"
  />
  <DetailRow
    v-if="model.d.kind !== 'free'"
    :model="{
      label: 'اسم النشاط',
      value: model.u.businessName || 'غير محدد',
    }"
  />
  <DetailRow :model="{ label: 'رقم الموبايل', value: model.u.phone }" />
  <FormInput
    :model="{
      name: 'senderPhone2',
      label: 'رقم موبايل احتياط (اختياري)',
      value: model.d.sender.phone2 ?? model.u.phone2,
      attrs: model.PHONE_ATTRIBUTES,
    }"
  />
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
    }"
  />
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
  />
</template>
