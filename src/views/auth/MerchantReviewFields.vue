<script setup>
import DetailRow from "../ui/DetailRow.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <DetailRow
    :model="{
      label: 'الاسم الثلاثي',
      value: model.r.name,
    }"
  />
  <DetailRow
    :model="{
      label: 'اسم النشاط التجاري',
      value: model.r.businessName,
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
      label: 'الدور',
      value: model.roleNames[model.r.role],
    }"
  />
  <DetailRow
    :model="{
      label: 'العنوان',
      value: model.r.province + ' — ' + model.r.area + ' — ' + model.r.address,
    }"
  />
  <div class="photo-preview">
    <template v-for="p in model.r.photos"
      ><img alt="صورة التسجيل" :src="p"
    /></template>
  </div>
  <p class="status-note blue">سيصبح الحساب جاهزا بعد ادخال كود التحقق</p>
</template>
