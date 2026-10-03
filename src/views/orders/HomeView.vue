<script setup>
import PaginationButton from "./PaginationButton.vue";
import MaterialIcon from "../shell/MaterialIcon.vue";
import ActionButton from "../ui/ActionButton.vue";
import SummaryMetric from "../ui/SummaryMetric.vue";
import AdSlider from "../../components/AdSlider.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <template v-if="model.u.role === 'merchant'"><AdSlider></AdSlider></template>
  <template v-else
    ><section class="surface">
      <div class="row">
        <div>
          <h2>{{ model.u.name }}</h2>
          <p class="muted">
            <MaterialIcon
              :model="{
                n: 'location_on',
              }"
            />
            {{ " " }}{{ model.u.province }}{{ "، " }}{{ model.u.area }}{{ " " }}
            <b>{{ "• " }}{{ model.u.id }}</b>
          </p>
        </div>
        <ActionButton
          :model="{
            action: 'refresh',
            extra: 'aria-label=&quot;تحديث البيانات&quot;',
            kind: 'icon-button',
          }"
          ><MaterialIcon
            :model="{
              n: 'sync',
            }"
        /></ActionButton>
      </div>
      <div class="order-strip" style="margin-top: 14px">
        <div>
          <strong
            ><template v-if="model.u.available">متاح لاستلام الطلبات</template>
            <template v-else>غير متاح حالياً</template></strong
          >
          <p class="muted">
            {{ "الميزانية " }}{{ model.money(model.u.budget)
            }}{{ " د.ع • نطاق " }}{{ model.u.radius }}{{ " كم" }}
          </p>
        </div>
        <ActionButton
          :model="{
            action: 'readiness',
          }"
          >تحديث الجاهزية</ActionButton
        >
        <ActionButton
          :model="{
            action: 'tracking',
          }"
          ><template v-if="model.state.trackingId === null"
            >مشاركة الموقع أثناء العمل</template
          ><template v-else>إيقاف مشاركة الموقع</template></ActionButton
        >
      </div>
      <template
        v-if="model.u.restrictedUntil &amp;&amp; Date.parse(model.u.restrictedUntil) > Date.now()"
        ><p class="status-note">
          {{ "الحجوزات الجديدة مقيّدة حتى "
          }}{{ model.date(model.u.restrictedUntil) }}. يمكنك إكمال الشحنات
          بعهدتك.
        </p></template
      >
    </section></template
  >
  <div class="metrics-grid">
    <SummaryMetric
      :model="{
        label: 'شحنات نشطة',
        value: model.active.length,
        ic: 'local_shipping',
        color: '',
        attributes: model.showMetric('شحنات نشطة', model.active),
      }"
    />
    <SummaryMetric
      :model="{
        label: 'قبل الاستلام',
        value: model.pickup.length,
        ic: 'inventory_2',
        color: 'orange',
        attributes: model.showMetric('قبل الاستلام', model.pickup),
      }"
    />
    <SummaryMetric
      :model="{
        label: 'رصيد المحفظة',
        value: model.money(model.state.S.balance),
        ic: 'payments',
        color: 'teal',
        attributes: {
          'data-action': 'nav',
          'data-screen': 'wallet',
          'aria-label': 'رصيد المحفظة، عرض تفاصيل المحفظة',
        },
      }"
    />
    <SummaryMetric
      :model="{
        label: 'تعذر ومرتجعات',
        value: model.returns.length,
        ic: 'assignment_return',
        color: 'red',
        attributes: model.showMetric('تعذر ومرتجعات', model.returns),
      }"
    />
  </div>
  <template v-if="model.u.role === 'merchant'"
    ><div class="row">
      <h2 class="section-title live-shipments-title">الشحنات المباشرة</h2>
      <ActionButton
        :model="{
          action: 'nav',
          extra: 'data-screen=&quot;registry&quot;',
        }"
        >عرض السجل</ActionButton
      >
    </div></template
  >
  <template v-else><h2 class="section-title">الطلبات بعهدتي</h2></template>
  <ViewContent :content="model.statusPicker()" />
  <template v-if="model.pagination.total"
    ><p class="home-page-summary" role="status">
      {{
        `عرض ${model.pagination.start}–${model.pagination.end} من ${model.pagination.total} شحنة`
      }}
    </p></template
  >

  <ViewContent :content="model.orderList(model.pagination.items)" />
  <nav
    v-if="model.pagination.pages > 1"
    class="shipment-pagination"
    aria-label="صفحات الشحنات"
  >
    <PaginationButton
      :model="{
        label: 'السابق',
        page: model.pagination.page - 1,
        disabled: model.pagination.page === 1,
      }"
    />
    <template v-for="(number, index) in model.pagination.numbers" :key="number"
      ><span
        v-if="index > 0 &amp;&amp; number - model.pagination.numbers[index - 1] > 1"
        aria-hidden="true"
        >…</span
      ><PaginationButton
        :model="{
          label: number,
          page: number,
          current: number === model.pagination.page,
        }"
    /></template>
    <PaginationButton
      :model="{
        label: 'التالي',
        page: model.pagination.page + 1,
        disabled: model.pagination.page === model.pagination.pages,
      }"
    />
  </nav>
</template>
