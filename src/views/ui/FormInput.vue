<script setup>
import { computed, mergeProps } from "vue";

import { attributes } from "../../services/formFields.js";
import { useViewState } from "../../composables/useViewState.js";
const props = defineProps({ model: { type: Object, required: true } });
defineOptions({ inheritAttrs: false });
const { ui } = useViewState();
const inputProps = computed(() => {
  const { name, value = "", attrs = "" } = props.model;
  const result = mergeProps({ name, value }, attributes(attrs));
  if (ui.page === "AuthView" && name === "password") {
    result.type = ui.passwordVisible ? "text" : "password";
    result.value = ui.loginPassword;
    result.onInput = (event) => {
      ui.loginPassword = event.target.value;
    };
  }
  if (ui.page === "AuthView" && name === "identifier") {
    result.value = ui.loginIdentifier;
    result.onInput = (event) => {
      ui.loginIdentifier = event.target.value;
    };
  }
  return result;
});
</script>
<template>
  <label>{{ model.label }}<input v-bind="inputProps" /></label>
</template>
