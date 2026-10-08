<script setup>
import CloseIcon from "./CloseIcon.vue";
import ViewContent from "./ViewContent.vue";
defineProps({
  title: String,
  subtitle: String,
  content: [Object, Array, String],
  error: String,
});
defineEmits(["close"]);
</script>
<template>
  <dialog
    id="app-dialog"
    aria-labelledby="dialog-title"
    @cancel="$emit('close')"
  >
    <div class="dialog-head">
      <h2 id="dialog-title">
        {{ title }}
        <small v-if="subtitle" class="dialog-subtitle">{{ subtitle }}</small>
      </h2>
      <button
        type="button"
        id="close-dialog"
        class="wasel-close"
        aria-label="إغلاق"
        @click="$emit('close')"
      >
        <CloseIcon />
      </button>
    </div>
    <div id="dialog-content">
      <ViewContent :content="content" />
      <p v-if="error" class="inline-error" role="alert">{{ error }}</p>
    </div>
  </dialog>
</template>
<style scoped>
.dialog-subtitle {
  display: block;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}
</style>
