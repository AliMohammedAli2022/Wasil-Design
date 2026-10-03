<script setup>
import { attributes } from "../../services/formFields.js";
import { mergeProps } from "vue";
import FormInput from "../ui/FormInput.vue";
import LocationFields from "../ui/LocationFields.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui, state } = useViewState();
</script>
<template>
  <form id="readiness-form" class="form-stack">
    <label class="checkbox"
      ><input
        v-bind="
          mergeProps(
            {
              name: 'available',
              type: 'checkbox',
            },
            attributes(model.state.S.user.available ? 'checked' : ''),
          )
        "
      />
      متاح لاستلام طلبات</label
    >
    <FormInput
      :model="{
        name: 'budget',
        label: 'الميزانية المتاحة لدفع البضائع',
        value: model.state.S.user.budget,
        attrs: 'type=&quot;number&quot; min=&quot;0&quot; required',
      }"
    />
    <FormInput
      :model="{
        name: 'radius',
        label: 'نطاق الاستلام (كم)',
        value: model.state.S.user.radius,
        attrs:
          'type=&quot;number&quot; min=&quot;1&quot; max=&quot;100&quot; required',
      }"
    />
    <LocationFields
      :model="{
        loc: model.state.S.user.location,
      }"
    />
    <p class="inline-error">{{ ui.formError }}</p>
    <button class="primary-button">حفظ الجاهزية</button>
  </form>
</template>
