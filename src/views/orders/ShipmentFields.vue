<script setup>
import FormSelect from "../ui/FormSelect.vue";
import FormInput from "../ui/FormInput.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div class="form-grid">
    <FormInput
      v-if="model.d.kind !== 'free'"
      :model="{
        name: 'amount',
        label: 'قيمة البضاعة (د.ع)',
        value: model.d.amount,
        attrs:
          'type=&quot;number&quot; min=&quot;0&quot; max=&quot;100000000&quot; required',
      }"
    />
    <FormInput
      :model="{
        name: 'count',
        label: 'عدد القطع',
        value: model.d.count,
        attrs:
          'type=&quot;number&quot; min=&quot;1&quot; max=&quot;1000&quot; required',
      }"
    />
    <FormInput
      :model="{
        name: 'weight',
        label: 'الوزن (كغم)',
        value: model.d.weight,
        attrs:
          'type=&quot;number&quot; min=&quot;0.1&quot; step=&quot;0.1&quot; required',
      }"
    />
    <FormInput
      :model="{
        name: 'length',
        label: 'الطول (سم)',
        value: model.d.length,
        attrs: 'type=&quot;number&quot; min=&quot;1&quot; required',
      }"
    />
    <FormInput
      :model="{
        name: 'width',
        label: 'العرض (سم)',
        value: model.d.width,
        attrs: 'type=&quot;number&quot; min=&quot;1&quot; required',
      }"
    />
    <FormInput
      :model="{
        name: 'height',
        label: 'الارتفاع (سم)',
        value: model.d.height,
        attrs: 'type=&quot;number&quot; min=&quot;1&quot; required',
      }"
    />
    <FormSelect
      :model="{
        name: 'nature',
        label: 'طبيعة الشحنة',
        values: model.natureNames,
        value: model.d.nature,
      }"
    />
    <div class="vehicle-select-field">
      <span id="vehicle-select-label">المركبة المناسبة</span>
      <details
        class="vehicle-dropdown"
        @keydown="
          (event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary').focus();
            }
          }
        "
      >
        <summary aria-labelledby="vehicle-select-label vehicle-selection">
          <span id="vehicle-selection">{{
            model
              .orderVehicles(model.d)
              .map((v) => model.vehicleNames[v])
              .join(" أو ") || "اختر المركبة"
          }}</span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div class="vehicle-choices">
          <p class="muted">اختر وسيلة واحدة أو وسيلتين</p>
          <template v-for="[value, label] in Object.entries(model.vehicleNames)"
            ><label class="checkbox"
              ><input
                type="checkbox"
                name="vehicles"
                :value="value"
                :checked="model.orderVehicles(model.d).includes(value)"
                :disabled="
                  !model.vehicleFits(value, model.d, model.state.S.settings)
                "
              />
              {{ label }}</label
            ></template
          >
          <button
            type="button"
            class="secondary-button"
            @click="
              (event) => {
                const menu = event.currentTarget.closest('details');
                menu.open = false;
                menu.querySelector('summary').focus();
              }
            "
          >
            تم الاختيار
          </button>
        </div>
      </details>
    </div>
    <FormSelect
      :model="{
        name: 'service',
        label: 'نوع الخدمة',
        values: {
          normal: 'عادي',
          vip: 'VIP — مندوب مخصص',
        },
        value: model.d.service,
      }"
    />
    <FormInput
      :model="{
        name: 'baseFee',
        label: 'أجرة التوصيل العادي (د.ع)',
        value: model.d.baseFee,
        attrs: 'type=&quot;number&quot; min=&quot;0&quot; required',
      }"
    />
    <FormSelect
      :model="{
        name: 'feePayer',
        label: 'من يتحمل أجرة التوصيل؟',
        values: {
          customer: model.d.kind === 'free' ? 'المستلم' : 'الزبون',
          merchant: model.d.kind === 'free' ? 'المرسل' : 'التاجر / المرسل',
        },
        value: model.d.feePayer,
      }"
    />
    <label class="checkbox"
      ><input
        type="checkbox"
        name="hasReturn"
        :checked="model.d.returnFee > 0"
        @change="
          (e) => {
            e.target.form.elements.returnFee.disabled = !e.target.checked;
          }
        "
      />
      يتضمن أجرة راجع</label
    >
    <FormInput
      :model="{
        name: 'returnFee',
        label: 'أجرة الراجع (د.ع)',
        value: model.d.returnFee,
        attrs:
          'type=&quot;number&quot; min=&quot;0&quot; required' +
          (model.d.returnFee > 0 ? '' : ' disabled'),
      }"
    />
  </div>
  <p class="status-note blue">
    {{ "تُضاف " }}
    {{ model.money(model.state.S.settings.vipSurcharge) }}
    {{ " د.ع لأجرة VIP. أجرة الراجع لا تتجاوز أجرة التوصيل." }}
  </p>
</template>
