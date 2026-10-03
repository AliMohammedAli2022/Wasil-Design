<script setup>
import { computed, mergeProps } from "vue";
import ViewContent from "../../components/ViewContent.vue";
import { attributes } from "../../services/formFields.js";
import { useViewState } from "../../composables/useViewState.js";
const props = defineProps({ model: { type: Object, required: true } });
defineOptions({ inheritAttrs: false });
const { ui } = useViewState();
const buttonProps = computed(() => {
  const { action, kind = "secondary-button", extra = "" } = props.model;
  const result = mergeProps(
    { type: "button", class: kind, "data-action": action },
    attributes(extra),
  );
  if (action === "install" && ui.installed) result.hidden = true;
  if (action === "toggle-password") {
    result["aria-label"] = ui.passwordVisible
      ? "إخفاء كلمة المرور"
      : "إظهار كلمة المرور";
    result["aria-pressed"] = String(ui.passwordVisible);
  }
  return result;
});
</script>
<template>
  <button v-bind="buttonProps">
    <span
      v-if="model.action === 'toggle-password'"
      class="material-symbols-outlined"
      aria-hidden="true"
      >{{ ui.passwordVisible ? "visibility_off" : "visibility" }}</span
    ><slot v-else><ViewContent :content="model.label" /></slot>
  </button>
</template>
