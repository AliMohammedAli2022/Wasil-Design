<script setup>
import { mergeProps } from "vue";
import { attributes } from "../../services/formFields.js";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <label
    >{{ model.label }}
    <select
      v-bind="
        mergeProps(
          {
            name: model.name,
          },
          attributes(model.attrs),
        )
      "
    >
      <template v-for="[v, t] in Object.entries(model.values)"
        ><option
          v-bind="
            mergeProps(
              {
                value: v,
              },
              attributes(v === model.value ? 'selected' : ''),
            )
          "
        >
          {{ t }}
        </option></template
      >
    </select></label
  >
</template>
