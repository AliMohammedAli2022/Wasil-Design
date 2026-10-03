<script setup>
defineProps({ compact: { type: Boolean, default: false } });
</script>
<template>
  <section
    :class="['vip-experience', { 'is-compact': compact }]"
    aria-label="طلب VIP بمندوب مخصص"
  >
    <span class="vip-emblem" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M5 10l6 5 5-10 5 10 6-5-3 14H8L5 10Zm4 18h14"
          stroke="currentColor"
          :stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <div class="vip-copy">
      <strong>واصل VIP</strong>
      <span>{{
        compact ? "مندوب مخصص لشحنتك" : "شحنتك وحدها تستحق الاهتمام"
      }}</span>
      <p v-if="!compact">حجز حصري • مندوب متفرغ • متابعة مراحل التوصيل</p>
    </div>
    <span class="vip-exclusive">حصري</span>
  </section>
</template>
