<script setup>
import { accountType } from "../../services/accounts.js";
import DetailRow from "../ui/DetailRow.vue";
import ActionButton from "../ui/ActionButton.vue";
import AccountLocationForm from "./AccountLocationForm.vue";
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <h2>{{ model.u.name }}</h2>
  <DetailRow
    :model="{
      label: 'رقم الحساب',
      value: model.u.id,
    }"
  />
  <DetailRow
    :model="{
      label: 'رقم المحفظة',
      value: model.u.walletId,
    }"
  />
  <DetailRow
    :model="{
      label: 'الهاتف',
      value: model.u.phone,
    }"
  />
  <DetailRow
    v-if="model.u.phone2"
    :model="{
      label: 'الهاتف الإضافي',
      value: model.u.phone2,
    }"
  />
  <DetailRow
    :model="{
      label: 'نوع الحساب',
      value: model.roleNames[accountType(model.u)],
    }"
  />
  <DetailRow
    :model="{
      label: 'المحافظة',
      value: model.u.province,
    }"
  />
  <DetailRow
    :model="{
      label: 'المنطقة',
      value: model.u.area,
    }"
  />
  <DetailRow
    :model="{
      label: 'العنوان',
      value: model.u.address,
    }"
  />
  <DetailRow
    v-if="model.u.vehicle"
    :model="{
      label: 'نوع المركبة',
      value: model.vehicleNames[model.u.vehicle] || model.u.vehicle,
    }"
  />
  <DetailRow
    v-if="model.u.plate"
    :model="{
      label: 'رقم لوحة المركبة',
      value: model.u.plate,
    }"
  />
  <template v-if="model.u.role === 'courier'"
    ><DetailRow
      :model="{
        label: 'ميزانية العمل',
        value: model.money(model.u.budget) + ' د.ع',
      }" /><DetailRow
      :model="{
        label: 'نطاق العمل',
        value: (model.u.radius || 0) + ' كم',
      }"
  /></template>
  <p v-if="model.u.pendingProfile" class="status-note">
    تعديل بيانات الحساب بانتظار موافقة الإدارة.
  </p>
  <p v-if="model.state.S.profileLocked" class="profile-lock">
    تعديل الملف مقفل حتى إكمال الطلبات والتسويات.
  </p>
  <div class="account-profile-actions">
    <ActionButton
      v-if="!model.state.S.profileLocked"
      :model="{
        action: 'edit-profile',
      }"
      >تعديل معلومات الحساب</ActionButton
    ><ActionButton
      :model="{
        action: 'change-password',
      }"
      >تغيير كلمة مرور الحساب</ActionButton
    >
  </div>
  <AccountLocationForm :model="model" />
</template>
