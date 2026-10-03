<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <span class="nav-symbol"
    ><svg class="nav-progress-ring" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="21" pathLength="100"></circle>
    </svg>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <template v-if="model.key === 'home'">
        <path
          d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"
        ></path>
      </template>
      <template v-if="model.key === 'registry'">
        <rect x="5" y="3" width="14" height="18" rx="3"></rect>

        <path d="M9 8h6M9 12h6M9 16h3"></path>
      </template>
      <template v-if="model.key === 'new'">
        <path d="M12 5v14M5 12h14"></path>
      </template>
      <template v-if="model.key === 'wallet'">
        <path
          d="M20 8V6a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v10H6a3 3 0 0 1-3-3V7"
        ></path>

        <path d="M20 12h-5a2 2 0 0 0 0 4h5"></path>
      </template>
      <template v-if="model.key === 'account'">
        <circle cx="12" cy="8" r="4"></circle>

        <path d="M4 21v-2a8 8 0 0 1 16 0v2"></path>
      </template>
      <template v-if="model.key === 'available'">
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"></path>

        <circle cx="12" cy="10" r="2.5"></circle>
      </template></svg
  ></span>
</template>
