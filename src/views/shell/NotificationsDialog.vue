<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <ul class="notice-list">
    <template v-if="model.state.S.notifications?.length"
      ><template v-for="n in model.state.S.notifications"
        ><li>
          {{ n.text }}
          <small class="muted" style="display: block"
            >{{ model.date(n.at) }}
            {{ " " }}
            {{ n.orderId || "" }}</small
          >
        </li></template
      ></template
    ><template v-else><li>لا توجد إشعارات بعد.</li></template>
  </ul>
  <p class="file-help">
    تظهر التحديثات أثناء فتح التطبيق. إشعارات الدفع خارج التطبيق تحتاج إعداد
    خدمة Push.
  </p>
</template>
