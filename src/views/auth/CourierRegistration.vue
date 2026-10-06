<script setup>
import { attributes } from "../../services/formFields.js";
import { mergeProps } from "vue";
import ActionButton from "../ui/ActionButton.vue";
import MaterialIcon from "../shell/MaterialIcon.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui } = useViewState();
</script>
<template>
  <section class="courier-registration">
    <div class="courier-registration-inner">
      <header class="courier-registration-header">
        <ActionButton
          :model="{
            action: 'login-page',
            extra: '',
            kind: 'courier-back',
          }"
          ><MaterialIcon
            :model="{
              n: 'arrow_forward',
            }"
          />
          {{ " رجوع" }}</ActionButton
        >
        <span class="auth-logo-art" role="img" aria-label="شعار واصل"></span>
        <h1>حساب المندوب</h1>
        <p>أدخل بياناتك الشخصية ووسيلة التوصيل</p>
      </header>
      <form id="courier-register-form" class="courier-glass">
        <input type="hidden" name="role" value="courier" />
        <p class="status-note">
          {{
            `${model.stage + 1} / 3 — ${["المعلومات الأساسية", "وسيلة النقل والعنوان", "الوثائق"][model.stage]}`
          }}
        </p>
        <fieldset v-bind="model.group(0)">
          <ViewContent
            :content="
              model.field(
                'name',
                'الاسم',
                'person',
                'text',
                'autocomplete=&quot;name&quot; maxlength=&quot;80&quot;',
              )
            "
          />
          <ViewContent
            :content="
              model.field(
                'phone',
                'رقم الموبايل',
                'call',
                'text',
                `${model.PHONE_ATTRIBUTES} autocomplete=&quot;tel&quot;`,
              )
            "
          />
          <ViewContent :content="model.password('password', 'كلمة المرور')" />
          <ViewContent
            :content="model.password('confirmPassword', 'تأكيد كلمة المرور')"
          />
        </fieldset>
        <fieldset v-bind="model.group(1)">
          <div class="courier-divider">
            <span>معلومات وسيلة النقل</span>
          </div>
          <fieldset class="vehicle-fieldset">
            <legend>وسيلة التوصيل</legend>
            <div class="courier-vehicles">
              <template v-for="[v, label] in Object.entries(model.vehicleNames)"
                ><label class="courier-vehicle"
                  ><input
                    v-bind="
                      mergeProps(
                        {
                          type: 'radio',
                          name: 'vehicle',
                          value: v,
                          required: true,
                        },
                        attributes(model.r.vehicle === v ? 'checked' : ''),
                      )
                    "
                  />
                  <span class="vehicle-icon"
                    ><MaterialIcon
                      :model="{
                        n: {
                          motorcycle: 'two_wheeler',
                          sedan: 'directions_car',
                          truck: 'local_shipping',
                          refrigerated: 'ac_unit',
                        }[v],
                      }"
                  /></span>
                  <strong>{{ label }}</strong></label
                ></template
              >
            </div>
          </fieldset>
          <ViewContent
            :content="
              model.field(
                'plate',
                'رقم لوحة المركبة',
                'pin',
                'text',
                'maxlength=&quot;40&quot;',
              )
            "
          />
          <div class="courier-divider"><span>معلومات العنوان</span></div>
          <label class="courier-field"
            >المحافظة
            <span class="courier-input"
              ><MaterialIcon
                :model="{
                  n: 'map',
                }"
              />
              <select name="province" :required="true">
                <template v-for="p in model.provinces"
                  ><option
                    v-bind="
                      mergeProps(
                        {},
                        attributes(model.r.province === p ? 'selected' : ''),
                      )
                    "
                  >
                    {{ p }}
                  </option></template
                >
              </select></span
            ></label
          >
          <ViewContent
            :content="
              model.field(
                'area',
                'المنطقة',
                'near_me',
                'text',
                'maxlength=&quot;80&quot;',
              )
            "
          />
          <ViewContent
            :content="
              model.field(
                'address',
                'العنوان و أقرب نقطة دالة',
                'location_on',
                'text',
                'autocomplete=&quot;street-address&quot; maxlength=&quot;200&quot;',
              )
            "
          />
        </fieldset>
        <fieldset v-bind="model.group(2)">
          <h2 class="document-heading">بطاقة السكن</h2>
          <div class="document-grid single">
            <ViewContent :content="model.doc('residenceFront')" />
          </div>
          <h2 class="document-heading">البطاقة الوطنية</h2>
          <div class="document-grid">
            <ViewContent :content="model.doc('nationalFront')" />
            <ViewContent :content="model.doc('nationalBack')" />
          </div>
          <h2 class="document-heading">إجازة السوق</h2>
          <div class="document-grid">
            <ViewContent :content="model.doc('licenseFront')" />
            <ViewContent :content="model.doc('licenseBack')" />
          </div>
        </fieldset>
        <p class="inline-error" id="courier-error" role="alert">
          {{ ui.formError }}
        </p>
        <div class="courier-step-actions">
          <button
            v-if="model.stage > 0"
            class="courier-previous"
            type="button"
            data-action="courier-step-back"
          >
            <MaterialIcon :model="{ n: 'arrow_forward' }" />
            السابق
          </button>
          <button class="courier-create" type="submit">
            التالي
            <MaterialIcon :model="{ n: 'arrow_back' }" />
          </button>
        </div>
        <p class="courier-help">
          صور المستمسكات للمعاينة خلال الجلسة فقط؛ لا تُرفع إلى خادم.
        </p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.courier-step-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}
.courier-step-actions .courier-create {
  grid-column: 2;
  margin: 0;
}
.courier-previous {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 54px;
  border: 1px solid #f47d2f80;
  border-radius: 14px;
  background: #f47d2f12;
  color: inherit;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
</style>
