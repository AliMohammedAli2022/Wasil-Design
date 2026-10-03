<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
const props = defineProps({ order: { type: Object, required: true } });
const now = ref(Date.now());
const visible = computed(
  () =>
    props.order.deadline &&
    ["reserved", "approaching"].includes(props.order.status),
);
const seconds = computed(() =>
  Math.max(0, Math.ceil((Date.parse(props.order.deadline) - now.value) / 1000)),
);
const time = computed(
  () =>
    `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, "0")}`,
);
const estimate = computed(
  () =>
    `المدة الأصلية تقريباً ${props.order.originalMinutes} دقيقة${Number.isFinite(props.order.pickupDistanceKm) ? ` — ${props.order.pickupDistanceKm.toFixed(1)} كم إلى التاجر` : ""}`,
);
let timer;
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
onBeforeUnmount(() => clearInterval(timer));
</script>
<template>
  <div v-if="visible" class="status-note">
    <strong>مهلة الاستلام: {{ time }}</strong>
    <p>{{ estimate }}</p>
    <small
      >تقدير حسب المسافة المباشرة مع هامش للتأخير؛ حركة المرور غير
      محسوبة.</small
    >
    <p v-if="seconds <= 120" role="status">
      {{
        seconds
          ? "الوقت قرب ينتهي؛ أكّد الوصول أو اختر تمديد المهلة ضمن الحد المتاح."
          : "انتهت مهلة الوصول؛ جارٍ تحديث حالة الحجز."
      }}
    </p>
  </div>
</template>
