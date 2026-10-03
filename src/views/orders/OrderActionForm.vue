<script setup>
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui } = useViewState();
</script>
<template>
  <form
    id="action-form"
    class="form-stack"
    :data-id="model.o.id"
    :data-op="model.op"
    :data-offer="model.extra.offer || ''"
  >
    <ViewContent :content="model.fields" />
    <p class="inline-error">{{ ui.formError }}</p>
    <button class="primary-button">تأكيد</button>
  </form>
</template>
