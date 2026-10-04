<script setup>
import { computed, ref, watch } from "vue";
import { attributes, phoneDigits } from "../../services/formFields.js";
import LocationPanel from "../../components/LocationPanel.vue";
import { provinces } from "../../services/geography.js";
import { addressLocation } from "../../services/coordinates.js";

defineOptions({ inheritAttrs: false });
const props = defineProps({ model: { type: Object, required: true } });
const phone = ref(props.model.r.phone || "");
const customerName = ref(props.model.r.name || "");
const phone2 = ref(props.model.r.phone2 || "");
const landmark = ref(props.model.r.landmark || "");
const notes = ref(props.model.d.notes || "");
const province = ref(props.model.r.province || props.model.u.province);
const provinceOptions = [
  ...new Set([province.value, ...provinces].filter(Boolean)),
];
const regionOptions = computed(() => props.model.areas[province.value] || []);
const area = ref(
  regionOptions.value.includes(props.model.r.area)
    ? props.model.r.area
    : props.model.r.area
      ? "other"
      : "",
);
const otherArea = ref(area.value === "other" ? props.model.r.area : "");
const latitude = ref(props.model.r.location?.lat ?? "");
const longitude = ref(props.model.r.location?.lng ?? "");
const location = computed(() =>
  addressLocation(latitude.value, longitude.value),
);
watch(province, () => {
  area.value = "";
  otherArea.value = "";
  latitude.value = "";
  longitude.value = "";
});
</script>
<template>
  <datalist id="recipient-names">
    <option
      v-for="customer in (model.u.customers || []).filter(
        (customer) => phone && customer.phone === phone,
      )"
      :key="customer.id"
      :value="customer.name"
    />
  </datalist>
  <label
    >رقم موبايل<input
      v-bind="attributes(model.PHONE_ATTRIBUTES)"
      v-model="phone"
      @input="phone = phoneDigits($event.target.value)"
      name="phone"
      required
      autocomplete="tel"
  /></label>
  <label
    >اسم الزبون<input
      v-model.trim="customerName"
      name="name"
      required
      maxlength="80"
      autocomplete="off"
      list="recipient-names"
      placeholder="اكتب اسم الزبون أو اختر اسماً محفوظاً"
  /></label>
  <label
    >رقم موبايل إضافي (اختياري)<input
      v-bind="attributes(model.PHONE_ATTRIBUTES)"
      v-model="phone2"
      @input="phone2 = phoneDigits($event.target.value)"
      name="phone2"
      autocomplete="tel"
  /></label>
  <label
    >المحافظة<select v-model="province" name="province" required>
      <option v-for="item in provinceOptions" :key="item" :value="item">
        {{ item }}
      </option>
    </select></label
  >
  <label
    >المنطقة<select v-model="area" name="area" required>
      <option value="" disabled>اختر المنطقة</option>
      <option v-for="item in regionOptions" :key="item" :value="item">
        {{ item }}
      </option>
      <option value="other">منطقة أخرى</option>
    </select></label
  >
  <label v-if="area === 'other'" class="other-area-field"
    >المنطقة الأخرى<input
      v-model.trim="otherArea"
      name="otherArea"
      required
      maxlength="80"
  /></label>
  <label
    >أقرب نقطة دالة<input
      v-model.trim="landmark"
      name="landmark"
      maxlength="200"
  /></label>
  <div class="recipient-coordinates">
    <label
      >خط العرض<input
        v-model="latitude"
        name="latitude"
        dir="ltr"
        inputmode="decimal"
        placeholder="33.300000"
    /></label>
    <label
      >خط الطول<input
        v-model="longitude"
        name="longitude"
        dir="ltr"
        inputmode="decimal"
        placeholder="44.430000"
    /></label>
  </div>
  <p class="file-help">الصق إحداثيات الزبون أو حدد موقعه على الخريطة.</p>
  <LocationPanel
    :location="location"
    editable
    :show-gps="false"
    :infer-area="false"
    :show-external-actions="false"
    name="موقع الزبون"
    @update:location="
      latitude = $event.lat;
      longitude = $event.lng;
    "
  />
  <p class="file-help">
    تُحفظ بيانات الزبون وموقعه تلقائياً مع الطلب، مع الاحتفاظ ببقية الأسماء
    والمواقع لنفس الرقم.
  </p>
  <label
    >ملاحظات التوصيل<textarea
      v-model="notes"
      name="notes"
      maxlength="500"
    ></textarea>
  </label>
</template>
<style scoped>
.recipient-coordinates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.recipient-coordinates label {
  min-width: 0;
}
</style>
