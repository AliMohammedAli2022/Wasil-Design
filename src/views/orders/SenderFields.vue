<script setup>
import { attributes } from "../../services/formFields.js";
import { mergeProps } from "vue";
import FormInput from "../ui/FormInput.vue";
import LocationFields from "../ui/LocationFields.vue";
import FormSelect from "../ui/FormSelect.vue";
import DetailRow from "../ui/DetailRow.vue";
import LocationPanel from "../../components/LocationPanel.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
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
  <template v-else
    ><p class="muted">
      تُعبّأ بيانات التاجر تلقائياً من ملفه الشخصي. يمكنك اختيار موقع استلام
      بديل من «عناويني» أو إضافة عنوان للشحنة.
    </p>
    <FormSelect
      :model="{
        name: 'pickupAddress',
        label: 'عنوان الاستلام',
        values: {
          '': 'عنوان الملف الشخصي',
          new: 'إضافة مكان جديد',
          ...Object.fromEntries(
            (model.u.addresses || []).map((a) => [
              a.id,
              a.name + ' — ' + a.address,
            ]),
          ),
        },
        value: model.d.pickupChoice ?? model.d.sender.addressId ?? '',
      }" />
    <DetailRow
      :model="{
        label: 'اسم التاجر',
        value: model.u.name,
      }" />
    <FormInput
      :model="{
        name: 'senderProvince',
        label: 'المحافظة',
        value: model.d.sender.province || model.u.province,
        attrs: 'required maxlength=&quot;80&quot;',
      }" />
    <FormInput
      :model="{
        name: 'senderArea',
        label: 'منطقة الاستلام',
        value: model.d.sender.area,
        attrs: 'required maxlength=&quot;80&quot;',
      }" />
    <FormInput
      :model="{
        name: 'senderAddress',
        label: 'عنوان الاستلام',
        value: model.d.sender.address,
        attrs: 'required maxlength=&quot;200&quot;',
      }" />
    <DetailRow
      :model="{
        label: 'الهاتف الأساسي',
        value: model.u.phone,
      }" />
    <DetailRow
      v-if="model.u.phone2"
      :model="{ label: 'الهاتف الاحتياطي', value: model.u.phone2 }" />
    <LocationPanel
      area-field="senderArea"
      :location="model.d.sender.location"
      :editable="true"
      :required="true"
      name="موقع الاستلام"
    ></LocationPanel
  ></template>
</template>
