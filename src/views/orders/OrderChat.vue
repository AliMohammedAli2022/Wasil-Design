<script setup>
import ActionButton from "../ui/ActionButton.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui, state } = useViewState();
</script>
<template>
  <p class="muted">محادثة مستقلة مرتبطة بهذا الطلب فقط.</p>
  <ActionButton
    :model="{
      action: 'refresh-chat',
      extra: `data-id=&quot;${model.o.id}&quot;`,
    }"
    >تحديث المحادثة</ActionButton
  >
  <div class="stack" style="margin-top: 12px">
    <template
      v-if="
        model.state.S.messages
          .filter((m) => m.orderId === model.o.id)
          .slice()
          .reverse()?.length
      "
      ><template
        v-for="m in model.state.S.messages
          .filter((m) => m.orderId === model.o.id)
          .slice()
          .reverse()"
        ><div
          :class="
            'chat-message ' + (m.owner === model.state.S.user.id ? 'mine' : '')
          "
        >
          {{ m.text }}
          <small
            >{{ m.name }}
            {{ " • " }}
            {{ model.date(m.at) }}</small
          >
        </div></template
      ></template
    ><template v-else><p class="muted">لا توجد رسائل بعد.</p></template>
  </div>
  <form
    id="action-form"
    class="form-stack"
    :data-id="model.o.id"
    data-op="chat"
    style="margin-top: 14px"
  >
    <label
      >رسالتك
      <textarea name="text" :required="true" maxlength="2000"></textarea>
    </label>
    <p class="inline-error">{{ ui.formError }}</p>
    <button class="primary-button">إرسال إلى محادثة الطلب</button>
  </form>
</template>
