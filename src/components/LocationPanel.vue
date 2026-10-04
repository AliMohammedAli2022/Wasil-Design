<script setup>
import { ref, watch } from "vue";
import LocationMap from "./LocationMap.vue";
import LocationShare from "./LocationShare.vue";
import MapAppPicker from "./MapAppPicker.vue";
import { nearestArea } from "../services/orderPolicy.js";
import { addressLocation } from "../services/coordinates.js";
const props = defineProps({
  location: Object,
  editable: Boolean,
  required: Boolean,
  showGps: { type: Boolean, default: true },
  inferArea: { type: Boolean, default: true },
  showHint: { type: Boolean, default: true },
  showExternalActions: { type: Boolean, default: true },
  name: { type: String, default: "الموقع" },
  areaField: { type: String, default: "area" },
  groups: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:location"]);
const point = ref(props.location || null);
const latitude = ref(props.location?.lat ?? "");
const longitude = ref(props.location?.lng ?? "");
const root = ref(null),
  busy = ref(false),
  error = ref("");
watch(
  () => props.location,
  (value) => {
    if (value?.lat === point.value?.lat && value?.lng === point.value?.lng)
      return;
    point.value = value || null;
    latitude.value = value?.lat ?? "";
    longitude.value = value?.lng ?? "";
  },
  { deep: true },
);
function choose(value) {
  point.value = value;
  latitude.value = value.lat;
  longitude.value = value.lng;
  error.value = "";
  emit("update:location", value);
  const form = root.value?.closest("form");
  if (props.inferArea && form?.elements.namedItem(props.areaField)) {
    const area = nearestArea(value);
    if (area) {
      const field = form.elements.namedItem(props.areaField);
      if (
        field.tagName === "SELECT" &&
        ![...field.options].some((o) => o.value === area)
      ) {
        field.value = "other";
        if (form.elements.otherArea) form.elements.otherArea.value = area;
      } else field.value = area;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}
function updateCoordinates() {
  point.value = addressLocation(latitude.value, longitude.value);
  error.value = "";
  emit("update:location", point.value);
}
function gps() {
  if (!navigator.geolocation) {
    error.value = "حدد الموقع بالضغط على الخريطة.";
    return;
  }
  busy.value = true;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      choose({ lat: p.coords.latitude, lng: p.coords.longitude });
      busy.value = false;
    },
    () => {
      error.value = "تعذر تحديد موقعك؛ اختره بالضغط على الخريطة.";
      busy.value = false;
    },
    { enableHighAccuracy: true, timeout: 15000 },
  );
}
</script>
<template>
  <section ref="root" class="location-panel">
    <h3 v-if="name !== 'الموقع'" class="location-panel-title">{{ name }}</h3>
    <template v-if="editable">
      <div class="location-coordinates">
        <label
          >خط العرض<input
            v-model="latitude"
            @input="updateCoordinates"
            name="latitude"
            dir="ltr"
            inputmode="decimal"
            placeholder="33.300000"
        /></label>
        <label
          >خط الطول<input
            v-model="longitude"
            @input="updateCoordinates"
            name="longitude"
            dir="ltr"
            inputmode="decimal"
            placeholder="44.430000"
        /></label>
      </div>
      <p class="file-help">
        الصق الإحداثيات، أو اضغط على الخارطة<span v-if="showGps"
          >، أو استخدم «تحديد موقعي الحالي»</span
        >.
      </p>
    </template>
    <LocationMap
      :key="editable ? 'picker' : `${point?.lat},${point?.lng}`"
      v-if="editable || point"
      :groups="
        editable ? groups : [{ id: name, name, location: point, count: 1 }]
      "
      :movable-location="editable ? point || { lat: 33.3, lng: 44.43 } : null"
      @location-change="choose"
    />
    <p v-else class="file-help">لم يتم تحديد الموقع بعد.</p>
    <template v-if="editable">
      <input type="hidden" name="lat" :value="point?.lat ?? ''" />
      <input type="hidden" name="lng" :value="point?.lng ?? ''" />
      <input
        v-if="required || latitude !== '' || longitude !== ''"
        class="location-validation"
        tabindex="-1"
        required
        :value="point ? 'محدد' : ''"
        aria-label="حدد الموقع أو أدخل إحداثيات صحيحة"
        @invalid="
          error =
            'أدخل خط عرض بين ‎-90 و90 وخط طول بين ‎-180 و180، أو حدد الموقع على الخريطة.'
        "
      />
      <p v-if="showHint" class="file-help">
        {{
          point
            ? "تم تحديد الموقع. اسحب العلامة لتعديله."
            : showGps
              ? "اضغط على الخريطة لتحديد الموقع أو استخدم موقعك الحالي."
              : "اضغط على الخريطة لتحديد الموقع أو الصق الإحداثيات."
        }}
      </p>
    </template>
    <div class="location-panel-actions">
      <MapAppPicker
        v-if="point && showExternalActions"
        :location="point"
        :name="name"
      />
      <LocationShare
        v-if="point && showExternalActions"
        :location="point"
        :name="name"
      />
      <button
        v-if="editable && showGps"
        type="button"
        class="location-gps"
        :disabled="busy"
        @click.stop="gps"
      >
        {{ busy ? "جارٍ تحديد الموقع…" : "تحديد موقعي الحالي" }}
      </button>
    </div>
    <p v-if="error" class="inline-error" role="alert">{{ error }}</p>
  </section>
</template>
<style scoped>
.location-coordinates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.location-coordinates label {
  min-width: 0;
}
</style>
