<script setup>
import SplashScenery from "../ui/SplashScenery.vue";
import RouteLines from "../ui/RouteLines.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div>
    <SplashScenery :model="{}" />
    <div class="splash-content">
      <span class="auth-logo-art" role="img" aria-label="شعار واصل"></span>
      <strong>واصل</strong>
      <span class="splash-english" dir="ltr" lang="en"
        >WASIL · FOR DELIVERY</span
      >
      <p>من بابك… لكل وجهة</p>
      <RouteLines :model="{}" />
    </div>
  </div>
</template>
