<script setup>
import DetailRow from "../ui/DetailRow.vue";

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
  <p class="status-note blue">
    يصبح الحساب جاهزاً بعد إكمال التسجيل. التحقق الآلي عبر SMS غير مربوط في
    النسخة المحلية.
  </p>
</template>
