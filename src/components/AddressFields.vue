<script setup>
import { computed, useId } from "vue";
import LocationPanel from "./LocationPanel.vue";
import { provinces } from "../services/geography.js";
import { areas } from "../services/orderPolicy.js";
import { addressLocation } from "../services/coordinates.js";

const props = defineProps({
  form: { type: Object, required: true },
  defaultProvince: String,
  requiredLocation: Boolean,
  names: {
    type: Object,
    default: () => ({
      name: "addressName",
      province: "province",
      area: "area",
      address: "address",
    }),
  },
});
const areaOptionsId = useId();
const provinceOptions = computed(() => [
  ...new Set(
    [props.defaultProvince, props.form.province, ...provinces].filter(Boolean),
  ),
]);
const location = computed(() =>
  addressLocation(props.form.lat, props.form.lng),
);
</script>
<template>
  <label
    >اسم العنوان<input
      v-model.trim="form.name"
      :name="names.name"
      required
      maxlength="80"
  /></label>
  <label
    >المحافظة<select v-model="form.province" :name="names.province" required>
      <option
        v-for="province in provinceOptions"
        :key="province"
        :value="province"
      >
        {{ province }}
      </option>
    </select></label
  >
  <label
    >المنطقة<input
      v-model.trim="form.area"
      :name="names.area"
      :list="areaOptionsId"
      required
      maxlength="80"
  /></label>
  <datalist :id="areaOptionsId">
    <option
      v-for="area in areas[form.province] || []"
      :key="area"
      :value="area"
    />
  </datalist>
  <label
    >العنوان و أقرب نقطة دالة<textarea
      v-model.trim="form.address"
      :name="names.address"
      required
      maxlength="200"
      rows="3"
    ></textarea>
  </label>
  <div class="address-coordinate-grid">
    <label
      >خط العرض<input
        v-model="form.lat"
        name="latitude"
        dir="ltr"
        inputmode="decimal"
        placeholder="33.300000"
    /></label>
    <label
      >خط الطول<input
        v-model="form.lng"
        name="longitude"
        dir="ltr"
        inputmode="decimal"
        placeholder="44.430000"
    /></label>
  </div>
  <p class="file-help">
    الصق الإحداثيات، أو اضغط على الخارطة، أو استخدم «تحديد موقعي الحالي».
  </p>
  <LocationPanel
    :location="location"
    :required="requiredLocation"
    :area-field="names.area"
    editable
    name="الموقع على الخارطة"
    :show-external-actions="false"
    @update:location="
      form.lat = $event.lat;
      form.lng = $event.lng;
    "
  />
</template>
<style scoped>
.address-coordinate-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.address-coordinate-grid label {
  min-width: 0;
}
</style>
