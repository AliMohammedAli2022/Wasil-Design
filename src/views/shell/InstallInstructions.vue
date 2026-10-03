<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <template v-if="model.ios"
    ><p>
      افتح الرابط في Safari، ثم اضغط «مشاركة» واختر «إضافة إلى الشاشة الرئيسية»،
      ثم «إضافة».
    </p></template
  >
  <template v-else
    ><p>
      من قائمة المتصفح ⋮ اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».
    </p>
    <p>
      إذا فتحت الرابط داخل تطبيق آخر، افتحه في Chrome أو Edge أولاً. قد تحتاج
      زيارة الصفحة مجددًا حتى يتيح المتصفح التثبيت.
    </p></template
  >
</template>
