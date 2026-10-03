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
      اختر مكاناً محفوظاً أو أضف مكاناً جديداً؛ يُحفظ تلقائياً عند حفظ الطلب أو
      نشره.
    </p>
    <FormSelect
      :model="{
        name: 'pickupAddress',
        label: 'عنوان الاستلام',
        values: {
          '': 'عنوان النشاط الأساسي',
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
        label: 'اسم المتجر',
        value: model.u.name,
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
        label: 'الهاتف',
        value: model.u.phone,
      }" />
    <LocationPanel
      :location="model.d.sender.location"
      :editable="true"
      :required="true"
      name="موقع الاستلام"
    ></LocationPanel
  ></template>
</template>
