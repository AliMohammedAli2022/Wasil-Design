<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";
import ActionButton from "../ui/ActionButton.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <label class="courier-field"
    >{{ model.label }}
    <span class="courier-input"
      ><MaterialIcon
        :model="{
          n: 'lock',
        }"
      />
      <input
        :name="model.name"
        type="password"
        :value="model.r[model.name] || ''"
        :placeholder="model.label"
        minlength="3"
        :required="true"
        autocomplete="new-password"
      />
      <ActionButton
        :model="{
          action: 'courier-password',
          extra: {
            'data-field': model.name,
            'aria-label': 'إظهار ' + model.label,
            'aria-pressed': 'false',
          },
          kind: 'courier-password-button',
        }"
        >إظهار</ActionButton
      ></span
    ></label
  >
</template>
