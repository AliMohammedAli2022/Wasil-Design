<script setup>
import SplashBike from "./SplashBike.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <svg class="splash-sky" viewBox="0 0 420 100" fill="none" aria-hidden="true">
    <g stroke="#00567a" stroke-width="1.5" opacity=".22">
      <path
        d="M27 48h60c13 0 13-17 1-18-2-23-35-24-39-5-19-4-26 12-22 23Z"
      ></path>
      <path
        d="M297 37h58c16 0 15-19 0-20-6-17-26-17-33-3-16-5-28 9-25 23Z"
      ></path>
      <path d="m184 30 9-9 9 9v15h-18Z"></path>
      <path d="M191 45V34h5v11"></path>
    </g>
    <g stroke="#f47d2f" stroke-width="2" opacity=".55">
      <path d="M125 67h12m-6-6v12M270 61h10m-5-5v10"></path>
      <circle cx="364" cy="72" r="4"></circle>
    </g>
  </svg>
  <svg class="splash-city" viewBox="0 0 600 160" fill="none" aria-hidden="true">
    <g fill="#00567a" opacity=".08">
      <path
        d="M0 130V76h45v54m13 0V42h48v88m15 0V64h49v66m245 0V58h51v72m15 0V31h45v99m14 0V81h60v49"
      ></path>
      <path d="M70 42V28h22v14m400-11V17h22v14"></path>
    </g>
    <g stroke="#00567a" opacity=".15" stroke-width="2">
      <path
        d="M0 133h600M69 57h26m-26 14h26m330 4h30m-30 14h30M492 48h22m-22 15h22"
      ></path>
    </g>
    <path
      class="city-road"
      d="M0 150h600"
      stroke="#f47d2f"
      stroke-width="2"
      stroke-dasharray="18 20"
      opacity=".38"
    ></path>
    <g class="city-rider">
      <g transform="translate(220,59) scale(1.15)">
        <SplashBike :model="{}" />
      </g>
    </g>
  </svg>
</template>
