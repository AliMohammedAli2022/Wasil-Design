<script setup>
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p>
    {{ "أجرة على المرسل: " }}
    {{ model.money(model.o.feePayer === "merchant" ? model.o.fee : 0) }}
    {{ " د.ع. قيمة تحصيل تُعاد للمرسل: " }}
    {{ model.money(model.o.kind === "free" ? model.o.amount : 0) }}
    {{ " د.ع." }}
  </p>
  <ViewContent
    :content="model.confirm('اكتملت تسوية هذه المبالغ مع المرسل.')"
  />
</template>
