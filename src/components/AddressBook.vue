<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import LocationPanel from "./LocationPanel.vue";
import { api } from "../services/api.js";
import { areas } from "../services/orderPolicy.js";
import { provinces } from "../services/geography.js";
import { toEnglishDigits } from "../services/formFields.js";

const props = defineProps({ user: { type: Object, required: true } });
const emit = defineEmits(["refresh"]);
const view = ref("list"),
  query = ref(""),
  selectedId = ref("");
const busy = ref(false),
  error = ref(""),
  message = ref("");
const heading = ref(),
  confirmation = ref(),
  deleteTarget = ref(null);
const form = reactive({});
const addresses = computed(() => props.user.addresses || []);
const selected = computed(() =>
  addresses.value.find((a) => a.id === selectedId.value),
);
const filtered = computed(() =>
  addresses.value.filter((a) =>
    [a.name, a.province, a.area, a.address]
      .join(" ")
      .includes(query.value.trim()),
  ),
);
const provinceOptions = computed(() => [
  ...new Set(
    [props.user.province, form.province, ...provinces].filter(Boolean),
  ),
]);
function coordinate(value) {
  const text = toEnglishDigits(value ?? "")
    .trim()
    .replace(/[،,٫]/g, ".");
  return text ? Number(text) : NaN;
}
const location = computed(() => {
  const lat = coordinate(form.lat),
    lng = coordinate(form.lng);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? { lat, lng }
    : null;
});
async function navigate(target) {
  view.value = target;
  error.value = "";
  await nextTick();
  heading.value?.focus();
  heading.value?.scrollIntoView({ block: "nearest" });
}
function details(address) {
  selectedId.value = address.id;
  navigate("detail");
}
function edit(address) {
  for (const key of Object.keys(form)) delete form[key];
  Object.assign(form, {
    id: address?.id,
    name: address?.name || "",
    province: address?.province || props.user.province,
    area: address?.area || "",
    address: address?.address || "",
    lat: address?.location?.lat ?? "",
    lng: address?.location?.lng ?? "",
  });
  message.value = "";
  navigate("form");
}
async function save() {
  if (busy.value) return;
  if (!location.value) {
    error.value =
      "أدخل خط عرض بين ‎-90 و90 وخط طول بين ‎-180 و180، أو حدد الموقع على الخريطة.";
    return;
  }
  busy.value = true;
  error.value = "";
  try {
    await api("/api/addresses", {
      id: form.id,
      name: form.name.trim(),
      province: form.province,
      area: form.area.trim(),
      address: form.address.trim(),
      location: location.value,
    });
    emit("refresh");
    message.value = form.id ? "تم تعديل العنوان" : "تمت إضافة العنوان";
    query.value = "";
    await navigate("list");
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}
async function askDelete(address) {
  deleteTarget.value = address;
  error.value = "";
  await nextTick();
  confirmation.value.showModal();
}
async function remove() {
  if (busy.value || !deleteTarget.value) return;
  busy.value = true;
  try {
    await api("/api/addresses", {
      action: "delete",
      id: deleteTarget.value.id,
    });
    confirmation.value.close();
    emit("refresh");
    message.value = "تم حذف العنوان";
    await navigate("list");
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="address-book">
    <div class="address-book-toolbar">
      <h3 ref="heading" tabindex="-1">
        {{
          view === "list"
            ? "العناوين المحفوظة"
            : view === "detail"
              ? "تفاصيل العنوان"
              : form.id
                ? "تعديل العنوان"
                : "إضافة عنوان جديد"
        }}
      </h3>
      <button
        v-if="view !== 'list'"
        type="button"
        :disabled="busy"
        @click="navigate('list')"
      >
        العودة للعناوين
      </button>
      <button v-else class="primary-button" type="button" @click="edit()">
        إضافة عنوان جديد
      </button>
    </div>
    <p v-if="message" class="status-note" role="status">{{ message }}</p>
    <p v-if="error && !confirmation?.open" class="inline-error" role="alert">
      {{ error }}
    </p>
    <template v-if="view === 'list'">
      <label
        >بحث في العناوين<input
          v-model="query"
          type="search"
          placeholder="اسم العنوان أو المنطقة"
      /></label>
      <div class="address-card-grid">
        <article
          v-for="address in filtered"
          :key="address.id"
          class="address-card"
        >
          <span class="address-card-icon" aria-hidden="true">⌖</span>
          <h4>{{ address.name }}</h4>
          <p class="address-card-region">
            {{ address.province || user.province }} · {{ address.area }}
          </p>
          <p class="address-card-street">{{ address.address }}</p>
          <button
            type="button"
            :aria-label="'تفاصيل ' + address.name"
            @click="details(address)"
          >
            التفاصيل
          </button>
        </article>
      </div>
      <p v-if="!filtered.length" class="muted">
        {{
          addresses.length
            ? "لا توجد عناوين مطابقة للبحث."
            : "لم تضف عناوين بعد. أضف عنوانك الأول لتختاره عند إنشاء الطلب."
        }}
      </p>
    </template>
    <div v-else-if="view === 'detail' && selected" class="address-details">
      <dl>
        <div>
          <dt>اسم العنوان</dt>
          <dd>{{ selected.name }}</dd>
        </div>
        <div>
          <dt>المحافظة</dt>
          <dd>{{ selected.province || user.province }}</dd>
        </div>
        <div>
          <dt>المنطقة</dt>
          <dd>{{ selected.area }}</dd>
        </div>
        <div>
          <dt>العنوان و أقرب نقطة دالة</dt>
          <dd>{{ selected.address }}</dd>
        </div>
        <template v-if="selected.location">
          <div>
            <dt>خط العرض</dt>
            <dd dir="ltr">{{ selected.location.lat }}</dd>
          </div>
          <div>
            <dt>خط الطول</dt>
            <dd dir="ltr">{{ selected.location.lng }}</dd>
          </div>
        </template>
      </dl>
      <LocationPanel :location="selected.location" name="الموقع على الخارطة" />
      <div class="address-actions">
        <button class="primary-button" type="button" @click="edit(selected)">
          تعديل العنوان
        </button>
        <button type="button" @click="askDelete(selected)">حذف العنوان</button>
      </div>
    </div>
    <form
      v-else-if="view === 'form'"
      class="form-stack address-form"
      @submit.prevent="save"
    >
      <label
        >اسم العنوان<input v-model.trim="form.name" required maxlength="80"
      /></label>
      <label
        >المحافظة<select v-model="form.province" required>
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
          name="area"
          list="address-area-options"
          required
          maxlength="80"
      /></label>
      <datalist id="address-area-options">
        <option
          v-for="area in areas[form.province] || []"
          :key="area"
          :value="area"
        />
      </datalist>
      <label
        >العنوان و أقرب نقطة دالة<textarea
          v-model.trim="form.address"
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
        editable
        name="الموقع على الخارطة"
        :show-external-actions="false"
        @update:location="
          form.lat = $event.lat;
          form.lng = $event.lng;
        "
      />
      <div class="address-actions">
        <button class="primary-button" :disabled="busy">
          {{ busy ? "جارٍ الحفظ…" : "حفظ العنوان" }}
        </button>
        <button type="button" :disabled="busy" @click="navigate('list')">
          إلغاء
        </button>
      </div>
    </form>
    <dialog
      ref="confirmation"
      class="address-delete-dialog"
      aria-labelledby="address-delete-title"
      @cancel="busy && $event.preventDefault()"
    >
      <h3 id="address-delete-title">حذف العنوان؟</h3>
      <p>هل تريد حذف «{{ deleteTarget?.name }}» من عناوينك المحفوظة؟</p>
      <p v-if="error" class="inline-error" role="alert">{{ error }}</p>
      <div class="address-actions">
        <button
          type="button"
          autofocus
          :disabled="busy"
          @click="confirmation.close()"
        >
          إلغاء
        </button>
        <button
          class="primary-button"
          type="button"
          :disabled="busy"
          @click="remove"
        >
          {{ busy ? "جارٍ الحذف…" : "تأكيد الحذف" }}
        </button>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.address-book-toolbar,
.address-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin: 12px 0;
}
.address-book-toolbar h3 {
  flex: 1 1 130px;
  margin: 0;
  outline: none;
}
.address-book-toolbar button {
  padding: 10px 12px;
  font-size: 14px;
}
.address-card-grid,
.address-coordinate-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.address-book .address-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 12px 0 0;
  padding: 12px;
  border: 1px solid #c8dfe8;
  border-top: 3px solid #ffbf94;
  border-radius: 18px;
  background: var(--surface, #fff);
}
.address-card-icon {
  color: #f47d2f;
  font-size: 26px;
  line-height: 1;
}
.address-card h4 {
  margin: 10px 0 4px;
  overflow-wrap: anywhere;
}
.address-card p {
  margin: 4px 0;
  font-size: 13px;
}
.address-card-street {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.address-card button {
  width: 100%;
  margin-top: auto;
  padding: 8px;
  min-height: 44px;
}
.address-card-region {
  color: var(--muted, #526578);
}
.address-details dl {
  margin: 16px 0;
}
.address-details dl > div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #c8dfe860;
}
.address-details dt {
  color: var(--muted, #526578);
}
.address-details dd {
  margin: 0;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.address-coordinate-grid label {
  min-width: 0;
}
.address-actions > button {
  flex: 1;
}
.address-delete-dialog {
  width: min(90vw, 420px);
  padding: 24px;
  border: 1px solid #c8dfe8;
  border-radius: 24px;
  background: var(--surface, #fff);
  color: var(--text, #00567a);
}
.address-delete-dialog::backdrop {
  background: #001d2bb3;
}
</style>
