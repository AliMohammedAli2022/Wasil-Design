<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <span dir="ltr">{{ model.state.S.user.walletId }}</span>
</template>
