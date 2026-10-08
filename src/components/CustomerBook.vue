<script setup>
import { computed, nextTick, reactive, ref, useId } from "vue";
import AddressFields from "./AddressFields.vue";
import LocationPanel from "./LocationPanel.vue";
import { api } from "../services/api.js";
import { accountType } from "../services/accounts.js";
import { addressLocation } from "../services/coordinates.js";
import { phoneDigits } from "../services/formFields.js";

const props = defineProps({ user: { type: Object, required: true } });
const emit = defineEmits(["refresh"]);
const noun = computed(() =>
  accountType(props.user) === "free" ? "المستلم" : "الزبون",
);
const plural = computed(() =>
  accountType(props.user) === "free" ? "المستلمين" : "الزبائن",
);
const view = ref("list"),
  query = ref(""),
  selectedId = ref("");
const busy = ref(false),
  error = ref(""),
  message = ref("");
const heading = ref(),
  confirmation = ref(),
  deleteTarget = ref(null);
const confirmationTitle = useId();
const form = reactive({});
const customers = computed(() => props.user.customers || []);
const selected = computed(() =>
  customers.value.find((customer) => customer.id === selectedId.value),
);
const filtered = computed(() =>
  customers.value.filter((customer) =>
    [
      customer.name,
      customer.phone,
      customer.phone2,
      customer.province,
      customer.area,
      customer.address,
    ]
      .join(" ")
      .includes(query.value.trim()),
  ),
);
async function navigate(target) {
  view.value = target;
  error.value = "";
  await nextTick();
  heading.value?.focus({ preventScroll: true });
  heading.value?.closest("dialog")?.scrollTo({ top: 0, behavior: "instant" });
}
function details(customer) {
  selectedId.value = customer.id;
  message.value = "";
  navigate("detail");
}
function edit(customer) {
  for (const key of Object.keys(form)) delete form[key];
  Object.assign(form, {
    id: customer?.id,
    name: customer?.name || "",
    phone: customer?.phone || "",
    phone2: customer?.phone2 || "",
    province: customer?.province || props.user.province,
    area: customer?.area || "",
    address: customer?.address || "",
    lat: customer?.location?.lat ?? "",
    lng: customer?.location?.lng ?? "",
  });
  message.value = "";
  navigate("form");
}
async function save() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await api("/api/customers", {
      ...customers.value.find((customer) => customer.id === form.id),
      id: form.id,
      name: form.name.trim(),
      phone: form.phone,
      phone2: form.phone2,
      province: form.province,
      area: form.area.trim(),
      address: form.address.trim(),
      location: addressLocation(form.lat, form.lng),
    });
    emit("refresh");
    message.value = form.id ? "تم حفظ التعديلات" : "تمت الإضافة بنجاح";
    query.value = "";
    await navigate("list");
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}
async function askDelete(customer) {
  deleteTarget.value = customer;
  error.value = "";
  await nextTick();
  confirmation.value.showModal();
}
async function remove() {
  if (busy.value || !deleteTarget.value) return;
  busy.value = true;
  error.value = "";
  try {
    await api("/api/customers", {
      action: "delete",
      id: deleteTarget.value.id,
    });
    confirmation.value.close();
    emit("refresh");
    message.value = "تم الحذف بنجاح";
    await navigate("list");
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="customer-book">
    <div class="customer-toolbar">
      <h3 ref="heading" tabindex="-1">
        {{
          view === "list"
            ? plural
            : view === "detail"
              ? "تفاصيل " + noun
              : (form.id ? "تعديل " : "إضافة ") + noun
        }}
      </h3>
      <button
        v-if="view === 'list'"
        class="primary-button"
        type="button"
        @click="edit()"
      >
        {{ noun === "المستلم" ? "إضافة مستلم جديد" : "إضافة زبون جديد" }}
      </button>
      <button v-else type="button" :disabled="busy" @click="navigate('list')">
        العودة للقائمة
      </button>
    </div>
    <p v-if="message" role="status" class="status-note">{{ message }}</p>
    <p v-if="error && !confirmation?.open" role="alert" class="inline-error">
      {{ error }}
    </p>
    <template v-if="view === 'list'">
      <label
        >بحث بالاسم أو الهاتف أو العنوان<input v-model="query" type="search"
      /></label>
      <div class="customer-grid">
        <button
          v-for="customer in filtered"
          :key="customer.id"
          class="customer-card"
          type="button"
          :aria-label="'تفاصيل ' + customer.name"
          @click="details(customer)"
        >
          <span class="customer-avatar" aria-hidden="true">{{
            customer.name?.trim().charAt(0)
          }}</span>
          <strong>{{ customer.name }}</strong>
          <span class="customer-phone" dir="ltr">{{ customer.phone }}</span>
          <span class="customer-region"
            >{{ customer.province || user.province }} ·
            {{ customer.area }}</span
          >
          <span class="customer-street">{{ customer.address }}</span>
          <span class="customer-detail-link">عرض التفاصيل ‹</span>
        </button>
      </div>
      <p v-if="!filtered.length" class="muted">
        {{
          customers.length
            ? "لا توجد نتائج مطابقة للبحث."
            : "القائمة فارغة. يمكنك الإضافة من الزر أعلاه."
        }}
      </p>
    </template>
    <div v-else-if="view === 'detail' && selected" class="customer-details">
      <dl>
        <div>
          <dt>الاسم</dt>
          <dd>{{ selected.name }}</dd>
        </div>
        <div>
          <dt>رقم الموبايل</dt>
          <dd dir="ltr">{{ selected.phone }}</dd>
        </div>
        <div v-if="selected.phone2">
          <dt>رقم موبايل إضافي</dt>
          <dd dir="ltr">{{ selected.phone2 }}</dd>
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
      <div class="customer-actions">
        <button class="primary-button" type="button" @click="edit(selected)">
          تعديل البيانات
        </button>
        <button type="button" @click="askDelete(selected)">
          حذف {{ noun }}
        </button>
      </div>
    </div>
    <form
      v-else-if="view === 'form'"
      class="form-stack customer-form"
      @submit.prevent="save"
    >
      <label
        >الاسم<input
          v-model.trim="form.name"
          name="name"
          required
          maxlength="80"
      /></label>
      <label
        >رقم الموبايل<input
          v-model="form.phone"
          @input="form.phone = phoneDigits($event.target.value)"
          name="phone"
          inputmode="numeric"
          pattern="07[789][0-9]{8}"
          maxlength="11"
          required
          dir="ltr"
      /></label>
      <label
        >رقم موبايل إضافي (اختياري)<input
          v-model="form.phone2"
          @input="form.phone2 = phoneDigits($event.target.value)"
          name="phone2"
          inputmode="numeric"
          pattern="07[789][0-9]{8}"
          maxlength="11"
          dir="ltr"
      /></label>
      <AddressFields
        :form="form"
        :show-name="false"
        :default-province="user.province"
      />
      <div class="customer-actions">
        <button class="primary-button" :disabled="busy">
          {{ busy ? "جارٍ الحفظ…" : "حفظ" }}
        </button>
        <button
          type="button"
          :disabled="busy"
          @click="navigate(form.id ? 'detail' : 'list')"
        >
          إلغاء
        </button>
      </div>
    </form>
    <dialog
      ref="confirmation"
      class="customer-delete-dialog"
      :aria-labelledby="confirmationTitle"
      @cancel="busy && $event.preventDefault()"
    >
      <h3 :id="confirmationTitle">حذف {{ noun }}؟</h3>
      <p>هل تريد حذف «{{ deleteTarget?.name }}» من قائمة {{ plural }}؟</p>
      <p v-if="error" class="inline-error" role="alert">{{ error }}</p>
      <div class="customer-actions">
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
.customer-toolbar,
.customer-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}
.customer-toolbar h3 {
  flex: 1 1 100px;
  margin: 0;
  outline: none;
}
.customer-toolbar button {
  padding: 10px 12px;
  font-size: 14px;
}
.customer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.customer-book .customer-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  width: 100%;
  margin: 0;
  padding: 14px 12px;
  border: 1px solid #c8dfe8;
  border-top: 3px solid #ffbf94;
  border-radius: 18px;
  background: var(--surface, #fff);
  color: inherit;
  text-align: start;
  font: inherit;
  cursor: pointer;
}
.customer-card:focus-visible {
  outline: 3px solid #f47d2f;
  outline-offset: 3px;
}
.customer-avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f47d2f20;
  color: #b34c0c;
  font-weight: 700;
}
.customer-card strong,
.customer-region,
.customer-street {
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.customer-phone,
.customer-region,
.customer-street {
  font-size: 13px;
}
.customer-region,
.customer-street {
  color: var(--muted, #526578);
}
.customer-detail-link {
  margin-top: auto;
  padding-top: 8px;
  color: var(--brand, #00567a);
  font-size: 13px;
  font-weight: 700;
}
.customer-details dl > div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #c8dfe860;
}
.customer-details dt {
  color: var(--muted, #526578);
}
.customer-details dd {
  margin: 0;
  font-weight: 700;
  overflow-wrap: anywhere;
  min-width: 0;
}
.customer-actions > button {
  flex: 1;
}
.customer-delete-dialog {
  width: min(90vw, 420px);
  padding: 24px;
  border: 1px solid #c8dfe8;
  border-radius: 24px;
  background: var(--surface, #fff);
  color: var(--text, #00567a);
}
.customer-delete-dialog::backdrop {
  background: #001d2bb3;
}
</style>
