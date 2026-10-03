<script setup>
import { attributes } from "../../services/formFields.js";
import { mergeProps } from "vue";
import MaterialIcon from "../shell/MaterialIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <label class="courier-field"
    >{{ model.label }}
    <span class="courier-input"
      ><MaterialIcon
        :model="{
          n: model.ic,
        }" />
      <input
        v-bind="
          mergeProps(
            {
              name: model.name,
              type: model.type,
              value: model.r[model.name] || '',
              placeholder: model.label,
              required: true,
            },
            attributes(model.extra),
          )
        " /></span
  ></label>
</template>
