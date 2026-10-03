<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <svg class="entry-route" viewBox="0 0 320 100" fill="none" aria-hidden="true">
    <path
      class="route-base"
      d="M24 76h65c42 0 26-44 70-44h55c40 0 30 44 77 44"
    ></path>
    <path
      class="route-progress"
      d="M24 76h65c42 0 26-44 70-44h55c40 0 30 44 77 44"
    ></path>
    <circle cx="24" cy="76" r="7"></circle>
    <circle cx="291" cy="76" r="7"></circle>
    <g class="route-package">
      <g transform="translate(0,-13)" stroke-linejoin="round">
        <path
          d="M0-13 12-7v14L0 13-12 7V-7Z"
          fill="#f47d2f"
          stroke="#fff"
          stroke-width="1.5"
        ></path>
        <path
          d="M-12-7 0-1 12-7M0-1v14"
          stroke="#00567a"
          stroke-width="1.5"
        ></path>
        <path d="m-6-10 12 6v5" stroke="#fff0e5" stroke-width="3"></path>
      </g>
      <animateMotion
        dur="2.6s"
        repeatCount="indefinite"
        calcMode="paced"
        path="M24 76h65c42 0 26-44 70-44h55c40 0 30 44 77 44"
      ></animateMotion>
    </g>
  </svg>
</template>
