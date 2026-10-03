<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p>
    {{
      "عند التأكيد نقرأ موقعك الحالي. يجب أن تكون ضمن " +
      Math.round((model.state.S.settings.arrivalRadiusKm || 0.3) * 1000) +
      " متر من التاجر؛ بعدها تصبح بانتظار الاستلام ويتوقف العدّاد."
    }}
  </p>
</template>
