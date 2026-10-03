<script setup>
import FormInput from "../ui/FormInput.vue";
import FormSelect from "../ui/FormSelect.vue";
import LocationPanel from "../../components/LocationPanel.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <datalist id="recipient-names">
    <template
      v-for="(c) in (model.u.customers || []).filter(c => model.r.phone &amp;&amp; c.phone === model.r.phone)"
      ><option :value="c.name"></option
    ></template>
  </datalist>
  <FormInput
    :model="{
      name: 'phone',
      label: 'رقم هاتف المستلم',
      value: model.r.phone,
      attrs: `required ${model.PHONE_ATTRIBUTES} autocomplete=&quot;tel&quot;`,
    }"
  />
  <FormInput
    :model="{
      name: 'name',
      label: 'المستلمون',
      value: model.r.name,
      attrs:
        'required maxlength=&quot;80&quot; autocomplete=&quot;off&quot; list=&quot;recipient-names&quot; placeholder=&quot;اكتب اسم المستلم أو اختر اسماً محفوظاً&quot;',
    }"
  />
  <div class="form-grid">
    <FormInput
      :model="{
        name: 'phone2',
        label: 'رقم إضافي (اختياري)',
        value: model.r.phone2,
        attrs: `${model.PHONE_ATTRIBUTES} autocomplete=&quot;tel&quot;`,
      }"
    />
    <FormInput
      :model="{
        name: 'province',
        label: 'المحافظة',
        value: model.u.province,
        attrs: 'readonly',
      }"
    />
    <FormSelect
      :model="{
        name: 'area',
        label: 'المنطقة',
        values: {
          '': 'اختر المنطقة',
          ...Object.fromEntries(
            (model.areas[model.u.province] || []).map((a) => [a, a]),
          ),
          other: 'منطقة أخرى',
        },
        value: (model.areas[model.u.province] || []).includes(model.r.area)
          ? model.r.area
          : model.r.area
            ? 'other'
            : '',
        attrs: 'required',
      }"
    />
    <div
      class="other-area-field"
      :hidden="
        (model.areas[model.u.province] || []).includes(model.r.area) ||
        !model.r.area
      "
    >
      <FormInput
        :model="{
          name: 'otherArea',
          label: 'المنطقة الأخرى (عند اختيار أخرى)',
          value: model.r.area,
          attrs: 'maxlength=&quot;80&quot;',
        }"
      />
    </div>
    <FormInput
      :model="{
        name: 'landmark',
        label: 'أقرب نقطة دالة',
        value: model.r.landmark,
        attrs: 'maxlength=&quot;200&quot;',
      }"
    />
    <LocationPanel
      :location="model.r.location"
      :editable="true"
    ></LocationPanel>
  </div>
  <p class="file-help">
    تُحفظ بيانات هذا المستلم وموقعه تلقائياً مع الطلب، مع الاحتفاظ ببقية الأسماء
    والمواقع لنفس الرقم.
  </p>
  <label
    >ملاحظات التوصيل
    <textarea name="notes" maxlength="500">{{ model.d.notes }}</textarea>
  </label>
</template>
