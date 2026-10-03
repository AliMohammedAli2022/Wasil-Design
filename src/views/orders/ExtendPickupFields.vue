<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p>
    التمديد مباشر؛ مجموع الإضافات لا يتجاوز نصف المهلة الأصلية مقرباً للأعلى.
  </p>
  <label
    >دقائق التمديد
    <select name="minutes" :required="true">
      <option v-for="minute in model.remaining" :key="minute" :value="minute">
        {{ minute }} دقيقة
      </option>
    </select></label
  >
  <p>إذا انتهت المهلة ولم تصل، يُلغى الحجز ويُعاد نشر الطلب تلقائياً.</p>
</template>
