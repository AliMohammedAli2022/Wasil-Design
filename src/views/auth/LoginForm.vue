<script setup>
import ActionButton from "../ui/ActionButton.vue";
import MaterialIcon from "../shell/MaterialIcon.vue";
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui, state } = useViewState();
</script>
<template>
  <template v-if="model.state.authRole"
    ><section class="glass-login" aria-labelledby="login-title">
      <ActionButton
        :model="{
          action: 'choose-again',
          extra: '',
          kind: 'entry-back',
        }"
        ><MaterialIcon
          :model="{
            n: 'arrow_forward',
          }"
        />
        {{ " تغيير نوع الحساب" }}</ActionButton
      >
      <h1 id="login-title">نورتنا من جديد</h1>
      <form id="login-form" :novalidate="true" class="form-stack">
        <input type="hidden" name="role" :value="model.state.authRole" />
        <FormInput
          :model="{
            name: 'identifier',
            label: 'اسم المستخدم أو رقم الهاتف',
            value: '',
            attrs:
              'type=&quot;text&quot; autocomplete=&quot;username&quot; autocapitalize=&quot;none&quot; spellcheck=&quot;false&quot; placeholder=&quot;اسم المستخدم أو رقم الهاتف&quot;',
          }"
        />
        <div class="login-password">
          <FormInput
            :model="{
              name: 'password',
              label: 'كلمة المرور',
              value: '',
              attrs:
                'type=&quot;password&quot; autocomplete=&quot;current-password&quot; placeholder=&quot;أدخل كلمة المرور&quot;',
            }"
          />
          <ActionButton
            :model="{
              action: 'toggle-password',
              extra:
                'aria-label=&quot;إظهار كلمة المرور&quot; aria-pressed=&quot;false&quot;',
              kind: 'password-toggle',
            }"
            ><MaterialIcon
              :model="{
                n: 'visibility',
              }"
          /></ActionButton>
        </div>
        <p class="inline-error" role="alert">{{ ui.formError }}</p>
        <button class="login-submit" type="submit">
          {{ "تسجيل الدخول " }}
          <MaterialIcon
            :model="{
              n: 'arrow_back',
            }"
          />
        </button>
      </form>
      <p class="login-create">
        {{ "أول مرة ويانا؟ " }}
        <ActionButton
          :model="{
            action: 'register',
            extra: '',
            kind: 'auth-text-button',
          }"
          >أنشئ حسابك</ActionButton
        >
        <template v-if="model.state.authRole === 'merchant'"
          ><ActionButton
            :model="{
              action: 'register-free',
              extra: '',
              kind: 'auth-text-button',
            }"
            >توصيل شخصي بدون محل</ActionButton
          ></template
        >
      </p>
    </section></template
  >
</template>
