<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";
import ActionButton from "../ui/ActionButton.vue";
import WalletNumber from "./WalletNumber.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui, state } = useViewState();
</script>
<template>
  <div class="orbit-motion">
    <section
      class="orbit-wallet"
      aria-labelledby="orbit-title"
      v-wallet-motion="state.S?.balance"
    >
      <div class="orbit-grid" aria-hidden="true"></div>
      <header class="orbit-top">
        <div><h2 id="orbit-title">محفظتك، بكل وضوح</h2></div>
        <span class="orbit-wallet-icon" aria-hidden="true"
          ><MaterialIcon
            :model="{
              n: 'account_balance_wallet',
            }"
        /></span>
      </header>
      <div class="orbit-center">
        <svg
          class="orbit-rings"
          viewBox="0 0 300 250"
          fill="none"
          aria-hidden="true"
        >
          <ellipse
            cx="150"
            cy="125"
            rx="133"
            ry="104"
            stroke="#ffffff12"
          ></ellipse>
          <circle
            cx="150"
            cy="125"
            r="99"
            stroke="#ffffff0f"
            stroke-width="18"
          ></circle>
          <path
            d="M58 87a99 99 0 0 1 185 75"
            stroke="#f47d2f"
            stroke-width="3"
            stroke-linecap="round"
          ></path>
          <path
            d="M242 162a99 99 0 0 1-166 29"
            stroke="#78c9e2"
            stroke-opacity=".3"
            stroke-width="2"
            stroke-dasharray="2 7"
          ></path>
          <circle cx="58" cy="87" r="6" fill="#f47d2f"></circle>
          <circle cx="243" cy="162" r="6" fill="#f47d2f"></circle>
          <circle
            cx="243"
            cy="162"
            r="12"
            stroke="#f47d2f"
            stroke-opacity=".25"
          ></circle>
        </svg>
        <div class="orbit-balance">
          <span>الرصيد الحالي</span>
          <strong dir="ltr">{{ model.money(model.state.S.balance) }}</strong>
          <small>دينار عراقي</small>
          <span class="orbit-account-type">محفظة تشغيلية</span>
        </div>
      </div>
      <div class="orbit-flows">
        <div>
          <span class="orbit-flow-label"
            ><i class="orbit-flow-icon incoming"
              ><MaterialIcon
                :model="{
                  n: 'south_west',
                }"
            /></i>
            إجمالي الإضافات</span
          >
          <strong dir="ltr"
            >{{ model.money(model.credits) }}<small>{{ " IQD" }}</small></strong
          >
        </div>
        <span class="orbit-flow-divider" aria-hidden="true"></span>
        <div>
          <span class="orbit-flow-label"
            ><i class="orbit-flow-icon outgoing"
              ><MaterialIcon
                :model="{
                  n: 'north_east',
                }"
            /></i>
            إجمالي الخصومات</span
          >
          <strong dir="ltr"
            >{{ model.money(model.debits) }}<small>{{ " IQD" }}</small></strong
          >
        </div>
      </div>
      <footer class="orbit-footer">
        <div class="orbit-owner">
          <span>صاحب المحفظة</span>
          <strong>{{ model.state.S.user.name }}</strong>
        </div>
        <ActionButton
          :model="{
            action: 'wallet-statement',
            extra: '',
            kind: 'orbit-statement',
          }"
          >{{ "كشف الحركة " }}
          <MaterialIcon
            :model="{
              n: 'arrow_back',
            }"
        /></ActionButton>
      </footer>
      <ActionButton
        :model="{
          action: 'copy-wallet',
          extra: 'aria-label=&quot;نسخ رقم المحفظة&quot;',
          kind: 'orbit-copy',
        }"
        ><WalletNumber
          v-bind="{
            model: {
              state: model.state,
            },
          }" />
        <MaterialIcon
          :model="{
            n: 'content_copy',
          }"
      /></ActionButton>
      <span class="orbit-shimmer" aria-hidden="true"></span>
    </section>
  </div>
  <section class="surface">
    <p class="info-line">
      <template v-if="model.state.S.settings.freeService"
        >الخدمة مجانية حالياً.</template
      >
      <template v-else>{{
        "عمولة الطلب " +
        model.money(model.state.S.settings.commission) +
        " د.ع • الاشتراك " +
        model.money(model.state.S.settings.subscription) +
        " د.ع"
      }}</template>
    </p>
    <p class="muted">
      رصيد المحفظة مستقل عن ميزانية المندوب وقيمة البضاعة المدفوعة نقداً. تظهر
      هنا الحركات المسجلة فقط.
    </p>
  </section>
  <section class="surface">
    <h3>حركات المحفظة</h3>
    <ViewContent :content="model.ledger(model.state.S.ledger)" />
  </section>
  <section class="surface">
    <h3>سجل البضاعة والتحصيل والأجور</h3>
    <ViewContent :content="model.ledger(model.state.S.cashLedger)" />
  </section>
</template>
