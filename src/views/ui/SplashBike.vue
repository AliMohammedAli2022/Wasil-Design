<script setup>
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <g stroke-linecap="round" stroke-linejoin="round"
    ><circle
      cx="22"
      cy="53"
      r="10"
      fill="#fff"
      stroke="#00567a"
      stroke-width="5"
    ></circle>
    <circle
      cx="80"
      cy="53"
      r="10"
      fill="#fff"
      stroke="#00567a"
      stroke-width="5"
    ></circle>
    <path
      d="M10 43q10-16 25-8l13 9h16l8-22h8l5 23H64l-8 11H39q-1-16-21-13"
      fill="#f47d2f"
    ></path>
    <path d="m76 24-5-8h-9" stroke="#00567a" stroke-width="4"></path>
    <path d="m48 27-9 9 15 4-2 11h9l3-17-10-7" fill="#004460"></path>
    <path d="m46 12-9 16h19l4-12" fill="#00567a"></path>
    <path d="m56 17 7 10 10-2" stroke="#00567a" stroke-width="6"></path>
    <circle cx="53" cy="7" r="7" fill="#f0b78e"></circle>
    <path d="M45 7c-2-13 19-13 18 0Z" fill="#00567a"></path>
    <path d="M54 0q6 1 7 7" stroke="#f47d2f" stroke-width="3"></path>
    <rect x="18" y="15" width="20" height="19" rx="3" fill="#00567a"></rect>
    <path d="M28 15v19" stroke="#f47d2f" stroke-width="4"></path
  ></g>
</template>
