<script setup>
import DetailRow from "../ui/DetailRow.vue";
import ActionButton from "../ui/ActionButton.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <DetailRow
    :model="{
      label: 'الاسم',
      value: model.r.name,
    }"
  />
  <DetailRow
    :model="{
      label: 'الهاتف',
      value: model.r.phone,
    }"
  />
  <DetailRow
    :model="{
      label: 'المركبة',
      value: model.vehicleNames[model.r.vehicle],
    }"
  />
  <DetailRow
    :model="{
      label: 'اللوحة',
      value: model.r.plate,
    }"
  />
  <DetailRow
    :model="{
      label: 'العنوان',
      value: model.r.province + ' — ' + model.r.area + ' — ' + model.r.address,
    }"
  />
  <div class="courier-review-docs">
    <template v-for="[key, label] in Object.entries(model.courierDocs)"
      ><figure>
        <img :src="model.r.documents[key]" :alt="label" />
        <figcaption>{{ label }}</figcaption>
      </figure></template
    >
  </div>
  <div class="camera-actions">
    <ActionButton
      :model="{
        action: 'courier-confirm',
        extra: '',
        kind: 'primary-button',
      }"
      >إنشاء الحساب</ActionButton
    >
    <ActionButton
      :model="{
        action: 'courier-edit',
        extra: '',
        kind: 'secondary-button',
      }"
      >تعديل البيانات</ActionButton
    >
  </div>
</template>
