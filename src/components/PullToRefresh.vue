<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  enabled: Boolean,
  refresh: { type: Function, required: true },
});
const distance = ref(0);
const busy = ref(false);
const threshold = 72;
const ready = computed(() => distance.value >= threshold);
let start = null;

function cancel() {
  start = null;
  distance.value = 0;
}
function blocked() {
  return (
    !props.enabled ||
    busy.value ||
    Boolean(document.querySelector("dialog[open], [popover]:popover-open"))
  );
}
function begin(event) {
  cancel();
  if (blocked() || event.touches.length !== 1 || window.scrollY > 1) return;
  const target = event.target;
  if (
    !(target instanceof Element) ||
    target.closest(
      ".geographic-map, .leaflet-container, input, textarea, select, button, a, [contenteditable]",
    )
  )
    return;
  // An inner scrolling area must keep its own gesture (including maps and lists).
  for (
    let node = target;
    node && node !== document.body;
    node = node.parentElement
  ) {
    if (
      node.scrollHeight > node.clientHeight + 1 &&
      /auto|scroll/.test(getComputedStyle(node).overflowY)
    )
      return;
  }
  const touch = event.touches[0];
  start = { x: touch.clientX, y: touch.clientY };
}
function move(event) {
  if (!start) return;
  if (blocked() || event.touches.length !== 1) return cancel();
  const touch = event.touches[0];
  const dy = touch.clientY - start.y;
  const dx = Math.abs(touch.clientX - start.x);
  if (dy < 0 || dx > Math.max(12, dy) || window.scrollY > 1) return cancel();
  if (dy < 8) return;
  if (event.cancelable) event.preventDefault();
  distance.value = Math.min(100, dy * 0.55);
}
async function finish() {
  const refresh = start && ready.value && !blocked();
  cancel();
  if (!refresh) return;
  busy.value = true;
  try {
    await props.refresh();
  } finally {
    busy.value = false;
  }
}
watch(() => props.enabled, cancel);
const listeners = [
  ["touchstart", begin, { passive: true }],
  ["touchmove", move, { passive: false }],
  ["touchend", finish, { passive: true }],
  ["touchcancel", cancel, { passive: true }],
];
onMounted(() =>
  listeners.forEach(([type, fn, options]) =>
    document.addEventListener(type, fn, options),
  ),
);
onBeforeUnmount(() =>
  listeners.forEach(([type, fn, options]) =>
    document.removeEventListener(type, fn, options),
  ),
);
</script>

<template>
  <div
    v-if="distance > 8 || busy"
    class="pull-refresh"
    role="status"
    :aria-busy="busy"
    :class="{ ready, busy }"
  >
    <span class="pull-refresh-icon" aria-hidden="true">↻</span>
    {{
      busy ? "جارٍ التحديث…" : ready ? "اترك للتحديث" : "اسحب للأسفل للتحديث"
    }}
  </div>
</template>

<style scoped>
.pull-refresh {
  position: fixed;
  z-index: 70;
  inset-block-start: calc(env(safe-area-inset-top, 0px) + 12px);
  inset-inline: 16px;
  width: max-content;
  max-width: calc(100% - 32px);
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border: 1px solid #f47d2f80;
  border-radius: 24px;
  background: #fff5eb;
  color: #00567a;
  box-shadow: 0 4px 18px #00263826;
  font-size: 14px;
  pointer-events: none;
}
.pull-refresh-icon {
  font-size: 24px;
  line-height: 1;
}
.ready {
  border-color: #f47d2f;
}
.busy .pull-refresh-icon {
  animation: refresh-spin 0.8s linear infinite;
}
:global(html[data-theme="dark"]) .pull-refresh {
  background: #193446;
  color: #90cef7;
}
@keyframes refresh-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .busy .pull-refresh-icon {
    animation: none;
  }
}
</style>
