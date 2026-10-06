<script setup>
import { attributes } from "../../services/formFields.js";
import { mergeProps } from "vue";
import ActionButton from "../ui/ActionButton.vue";
import MaterialIcon from "../shell/MaterialIcon.vue";
import LocationFields from "../ui/LocationFields.vue";
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
            `${model.stage + 1} / 3 — ${["المعلومات الأساسية", "وسيلة التوصيل", "الوثائق والموقع"][model.stage]}`
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
          <ViewContent :content="model.password('password', 'كلمة المرور')" />
          <ViewContent
            :content="model.password('confirmPassword', 'تأكيد كلمة المرور')"
          />
        </fieldset>
        <fieldset v-bind="model.group(1)">
          <div class="courier-divider">
            <span>وسيلة التوصيل · الوثائق</span>
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
          <div class="courier-divider"><span>موقع الانطلاق</span></div>
          <p class="courier-help">حدّد موقعك ليظهر لك الطلب المناسب والقريب.</p>
          <div class="courier-location">
            <LocationFields
              :model="{
                loc: model.r.location,
              }"
            />
          </div>
        </fieldset>
        <template v-if="model.stage > 0"
          ><ActionButton
            :model="{
              action: 'courier-step-back',
            }"
            >السابق</ActionButton
          ></template
        >

        <p class="inline-error" id="courier-error" role="alert">
          {{ ui.formError }}
        </p>
        <button class="courier-create" type="submit">
          <template v-if="model.stage &lt; 2">{{ "التالي " }}</template>
          <template v-else>{{ "مراجعة البيانات " }}</template>
          <MaterialIcon
            :model="{
              n: 'arrow_back',
            }"
          />
        </button>
        <p class="courier-help">
          صور المستمسكات للمعاينة خلال الجلسة فقط؛ لا تُرفع إلى خادم.
        </p>
      </form>
    </div>
  </section>
</template>
