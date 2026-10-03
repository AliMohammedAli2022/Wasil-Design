<script setup>
import { workflowRole } from "../../services/accounts.js";
import LocationFields from "../ui/LocationFields.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <LocationFields
    :model="{
      loc: model.r.location,
      showHint: false,
      showExternalActions: false,
    }"
  />
  <template v-if="workflowRole(model.r.role) === 'merchant'"
    ><label
      >صورة المحل من الداخل
      <input type="file" name="inside" accept="image/*" :required="true"
    /></label>
    <label
      >صورة المحل من الخارج
      <input
        type="file"
        name="outside"
        accept="image/*"
        :required="true" /></label
  ></template>
  <template v-else
    ><template v-if="model.r.role === 'courier'"
      ><label
        >الصورة الشخصية
        <input
          name="inside"
          type="file"
          accept="image/*"
          :required="true" /></label
    ></template>
    <template v-else></template
  ></template>
</template>
