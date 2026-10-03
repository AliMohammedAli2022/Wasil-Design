<script setup>
import WizardSteps from "../ui/WizardSteps.vue";
import ActionButton from "../ui/ActionButton.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui } = useViewState();
</script>
<template>
  <section class="surface wizard">
    <WizardSteps
      :model="{
        step: model.r.step,
        labels: ['الأساسيات', 'النشاط', 'الصور والموقع', 'المراجعة'],
      }"
    />
    <form id="register-form" class="form-stack">
      <ViewContent :content="model.fields" />
      <p class="inline-error">{{ ui.formError }}</p>
      <div class="wizard-footer">
        <template v-if="model.r.step"
          ><ActionButton
            :model="{
              action: 'register-back',
            }"
            >السابق</ActionButton
          ></template
        >
        <template v-else
          ><ActionButton
            :model="{
              action: 'login-page',
            }"
            >رجوع</ActionButton
          ></template
        >
        <button class="primary-button">
          <template v-if="model.r.step === 3">إنشاء الحساب</template>
          <template v-else>التالي</template>
        </button>
      </div>
    </form>
  </section>
</template>
