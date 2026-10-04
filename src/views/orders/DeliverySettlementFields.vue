<script setup>
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p>
    {{ "أجرة على المرسل: " }}
    {{ model.money(model.o.feePayer === "merchant" ? model.o.fee : 0) }}
    {{ " د.ع." }}
    <template v-if="model.o.kind !== 'free'">
      قيمة تحصيل تُعاد للمرسل: {{ model.money(0) }} د.ع.
    </template>
  </p>
  <ViewContent
    :content="model.confirm('اكتملت تسوية هذه المبالغ مع المرسل.')"
  />
</template>
