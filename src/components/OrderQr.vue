<script setup>
import { computed } from "vue";
import QRCode from "qrcode";
const props = defineProps({
  code: String,
  label: { type: String, default: "رمز الاستلام" },
});
const qr = computed(() => {
  if (!/^\d{6}$/.test(props.code || "")) return null;
  const matrix = QRCode.create(props.code, {
    errorCorrectionLevel: "M",
  }).modules;
  let path = "";
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (matrix.get(y, x)) path += `M${x + 4} ${y + 4}h1v1h-1z`;
    }
  }
  return { path, size: matrix.size + 8 };
});
</script>
<template>
  <svg
    v-if="qr"
    class="order-qr"
    :viewBox="`0 0 ${qr.size} ${qr.size}`"
    role="img"
    :aria-label="`${label} QR`"
    style="
      display: block;
      width: 200px;
      max-width: 100%;
      height: auto;
      margin: 12px auto;
      shape-rendering: crispEdges;
    "
  >
    <rect width="100%" height="100%" fill="#fff" />
    <path :d="qr.path" fill="#003e57" />
  </svg>
</template>
