<script setup>
import { computed, ref, useId } from "vue";
import { mapLinks, nativeMapLink, shareMapLink } from "../services/mapLinks.js";
const props = defineProps({
  location: Object,
  name: { type: String, default: "الموقع" },
  mode: { type: String, default: "open" },
  label: String,
});
const expanded = ref(false),
  pending = ref(false),
  status = ref(""),
  sharedUrl = ref("");
const id = useId();
const links = computed(() => mapLinks(props.location, props.name));
const android = /Android/i.test(globalThis.navigator?.userAgent || "");
async function share(link) {
  if (pending.value) return;
  pending.value = true;
  status.value = "";
  sharedUrl.value = "";
  try {
    const result = await shareMapLink(link.url, props.name);
    if (result === "shared") expanded.value = false;
    if (result === "copied" || result === "manual") {
      sharedUrl.value = link.url;
      status.value =
        result === "copied"
          ? "تم نسخ رابط الموقع للمشاركة."
          : "انسخ رابط الموقع أدناه للمشاركة.";
    }
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div
    class="map-app-picker location-share"
    @keydown.esc.stop="expanded = false"
  >
    <button
      type="button"
      class="secondary-button map-app-trigger"
      :disabled="!links.length || pending"
      :aria-expanded="expanded"
      :aria-controls="id"
      @click.stop="expanded = !expanded"
    >
      <span class="material-symbols-outlined" aria-hidden="true">{{
        mode === "share" ? "share" : "map"
      }}</span>
      {{ label || (mode === "share" ? "مشاركة الموقع" : "فتح الخريطة") }}
    </button>
    <div
      v-if="expanded"
      :id="id"
      class="map-app-options"
      role="group"
      :aria-label="
        mode === 'share' ? 'اختر رابط الخريطة للمشاركة' : 'اختر تطبيق الخريطة'
      "
    >
      <p>
        {{ mode === "share" ? "شارك رابط الموقع عبر" : "افتح الموقع باستخدام" }}
      </p>
      <a
        v-if="mode === 'open' && android"
        :href="nativeMapLink(location, name)"
        class="map-app-option"
        data-map-app="device"
        >تطبيقات الجهاز</a
      >
      <template v-for="link in links" :key="link.id">
        <button
          v-if="mode === 'share'"
          type="button"
          class="map-app-option"
          :data-map-app="link.id"
          :disabled="pending"
          @click.stop="share(link)"
        >
          {{ link.label }}
        </button>
        <a
          v-else
          class="map-app-option"
          :data-map-app="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          >{{ link.label }}</a
        >
      </template>
    </div>
    <template v-if="status">
      <p class="map-share-status" role="status">{{ status }}</p>
      <input
        class="map-share-url"
        :value="sharedUrl"
        readonly
        dir="ltr"
        aria-label="رابط الموقع للمشاركة"
        @click="$event.target.select()"
      />
    </template>
  </div>
</template>

<style scoped>
.map-app-picker {
  min-width: 0;
  max-width: 100%;
}
.map-app-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 46px;
}
.map-app-trigger .material-symbols-outlined {
  font-size: 20px;
}
.map-app-options {
  display: grid;
  gap: 8px;
  margin-top: 8px;
  padding: 10px;
  border: 1px solid #cbdfe7;
  border-radius: 12px;
  background: #f8fcfd;
  color: #00567a;
}
.map-app-options p {
  margin: 0 0 4px;
  font-size: 12px;
}
.map-app-options .map-app-option {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 8px !important;
  margin: 0 !important;
  border: 1px solid #cbdfe7 !important;
  border-radius: 10px;
  color: inherit !important;
  background: transparent !important;
  text-decoration: none;
  font: inherit;
  font-size: 13px;
  text-align: center;
}
.map-share-status {
  font-size: 12px;
}
.map-share-url {
  width: 100%;
  min-width: 0;
  padding: 8px;
  border: 1px solid #cbdfe7;
  border-radius: 10px;
  background: transparent;
  color: inherit;
}
:global(html[data-theme="dark"] .map-app-options) {
  background: #142f3d;
  color: #dcebf2;
  border-color: #426070;
}
</style>
