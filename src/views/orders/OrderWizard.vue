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
    <h2 v-if="model.d.kind === 'free'" class="free-order-title">
      {{ model.state.wizard.id ? "تعديل الطلب" : "طلب توصيل حر" }}
    </h2>
    <WizardSteps
      :model="{
        step: model.state.wizard.step,
        labels: ['الشحنة', 'المرسل', 'المستلم', 'المراجعة'],
      }"
    />
    <h2 v-if="model.d.kind !== 'free'" style="margin-bottom: 16px">
      {{ model.state.wizard.id ? "تعديل الطلب" : "إنشاء طلب جديد" }}
    </h2>
    <form id="order-form" class="form-stack">
      <ViewContent :content="model.fields" />
      <p class="inline-error" id="form-error">{{ ui.formError }}</p>
      <div class="wizard-footer">
        <template v-if="model.state.wizard.step"
          ><ActionButton
            :model="{
              action: 'wizard-back',
            }"
            >السابق</ActionButton
          ></template
        >
        <template v-else
          ><ActionButton
            :model="{
              action: 'nav',
              extra: 'data-screen=&quot;home&quot;',
            }"
            >إلغاء</ActionButton
          ></template
        >
        <template v-if="model.state.wizard.step &lt; 3"
          ><button class="primary-button" type="submit">
            التالي
          </button></template
        >
        <template v-else
          ><ActionButton
            :model="{
              action: 'save-order',
              extra: 'data-publish=&quot;false&quot;',
              kind: 'secondary-button',
            }"
            ><template v-if="model.state.wizard.id">حفظ التعديل</template
            ><template v-else>حفظ دون نشر</template></ActionButton
          >
          <template v-if="model.state.wizard.id"></template>
          <template v-else
            ><ActionButton
              :model="{
                action: 'save-order',
                extra: 'data-publish=&quot;true&quot;',
                kind: 'primary-button',
              }"
              >نشر الطلب</ActionButton
            ></template
          ></template
        >
      </div>
    </form>
  </section>
</template>
<style scoped>
.free-order-title {
  margin-bottom: 24px;
  text-align: center;
}
</style>
