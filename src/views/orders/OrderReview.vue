<script setup>
import DetailRow from "../ui/DetailRow.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div class="review-group">
    <h3>المرسل والمستلم</h3>
    <p>
      <template v-if="model.d.kind === 'free'">{{
        model.d.sender.name
      }}</template>
      <template v-else>{{ model.u.name }}</template>
      {{ " ← " }}{{ model.r.name }}
    </p>
    <p>
      {{
        [model.r.province, model.r.area, model.r.address]
          .filter(Boolean)
          .join("، ")
      }}
    </p>
    <p>
      {{ model.r.phone }}{{ " " }}
      <template v-if="model.r.phone2">{{ " / " + model.r.phone2 }}</template>
    </p>
  </div>
  <div class="review-group">
    <h3>تفاصيل الشحنة</h3>
    <p>
      {{ model.d.count }}{{ " قطع • " }}{{ model.d.weight }}{{ " كغم • "
      }}{{ model.d.length }}×{{ model.d.width }}×{{ model.d.height }}{{ " سم" }}
    </p>
    <p>
      {{ model.natureNames[model.d.nature] }}{{ " • "
      }}{{
        model
          .orderVehicles(model.d)
          .map((v) => model.vehicleNames[v])
          .join(" أو ")
      }}{{ " • " }}
      <template v-if="model.d.service === 'vip'">VIP</template>
      <template v-else>عادي</template>
    </p>
  </div>
  <DetailRow
    v-if="model.d.kind !== 'free'"
    :model="{
      label: 'قيمة البضاعة',
      value: model.money(model.d.amount) + ' د.ع',
    }"
  />
  <DetailRow
    :model="{
      label: 'أجرة التوصيل',
      value:
        model.money(model.d.fee) +
        ' د.ع — على ' +
        (model.d.feePayer === 'merchant'
          ? model.d.kind === 'free'
            ? 'المرسل'
            : 'التاجر'
          : model.d.kind === 'free'
            ? 'المستلم'
            : 'الزبون'),
    }"
  />
  <DetailRow
    :model="{
      label: 'أجرة الراجع',
      value: model.money(model.d.returnFee) + ' د.ع',
    }"
  />
  <DetailRow
    :model="{
      label:
        model.d.kind === 'free' ? 'المطلوب من المستلم' : 'المطلوب من الزبون',
      value: model.money(model.customerDue(model.d)) + ' د.ع',
    }"
  />
  <DetailRow
    :model="{
      label: 'الملاحظات',
      value: model.d.notes || 'لا توجد',
    }"
  />
  <template v-if="model.state.wizard.id"
    ><p class="status-note">
      تعديل الطلب المحجوز يلغي الحجز السابق ويعيد نشره، دون احتسابه إلغاءً على
      المندوب.
    </p></template
  >

  <p class="muted">النشر يجعل الطلب متاحاً للمندوبين المتاحين</p>
</template>
