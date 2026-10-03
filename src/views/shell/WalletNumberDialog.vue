<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="wallet-copy-value" dir="ltr">{{ model.state.S.user.walletId }}</p>
  <p class="muted">اضغط مطولاً على الرقم لنسخه.</p>
</template>
