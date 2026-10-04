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
  showName: { type: Boolean, default: true },
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
  <label v-if="showName"
    >اسم العنوان<input
      v-model.trim="form.name"
      :name="names.name"
      required
      maxlength="80"
  /></label>
  <label
    >المحافظة<select v-model="form.province" :name="names.province" required>
      <option value="" disabled>اختر المحافظة</option>
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
  <LocationPanel
    :location="location"
    :required="requiredLocation"
    :area-field="names.area"
    editable
    name="الموقع على الخارطة"
    :show-external-actions="false"
    @update:location="
      form.lat = $event?.lat ?? '';
      form.lng = $event?.lng ?? '';
    "
  />
</template>
