<script setup>
import { computed } from "vue";
const props = defineProps({ model: { type: Object, required: true } });
const ratings = computed(() =>
  props.model.state.S.ratings.filter((r) => r.target === props.model.u.id),
);
</script>
<template>
  <template v-if="ratings.length"
    ><p
      v-for="(rating, index) in ratings"
      :key="rating.id || index"
      class="info-line"
    >
      {{ "★".repeat(rating.stars) }} — {{ rating.text }} ({{ rating.orderId }})
    </p></template
  >
  <p v-else class="muted">لا توجد تقييمات بعد.</p>
</template>
