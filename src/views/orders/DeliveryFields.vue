<script setup>
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="status-note blue">
    {{ "المطلوب من الزبون: " }}
    {{ model.money(model.customerDue(model.o)) }}
    {{ " د.ع" }}
  </p>
  <ViewContent
    :content="model.confirm('تم تسليم الشحنة وتحصيل المبلغ أعلاه.')"
  />
  <label
    >وصف إثبات التسليم
    <textarea
      name="proof"
      minlength="8"
      :required="true"
      placeholder="اسم المستلم وتفاصيل تأكيد التسليم"
    ></textarea>
  </label>
  <p class="file-help">
    لا توجد رسالة SMS فعلية؛ الإثبات هنا وصف محلي يحتاج ربط مزود تحقق قبل
    التشغيل.
  </p>
</template>
