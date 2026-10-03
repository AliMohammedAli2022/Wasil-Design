<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";
import ActionButton from "../ui/ActionButton.vue";
import VipBanner from "../../components/VipBanner.vue";
import ArrivalCountdown from "../../components/ArrivalCountdown.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <template v-if="model.os.length"
    ><template v-for="o in model.os"
      ><article
        :class="'order-card' + (o.service === 'vip' ? ' order-card-vip' : '')"
      >
        <template v-if="model.selection"
          ><label class="order-card-selection"
            ><input
              type="checkbox"
              :checked="model.selection.checked"
              :disabled="model.selection.busy"
              :aria-label="'تحديد الطلب ' + o.id"
              @change="
                (event) => model.selection.toggle(o.id, event.target.checked)
              " /></label
        ></template>

        <div class="order-top">
          <div class="order-id">
            <span class="order-index"
              ><MaterialIcon
                :model="{
                  n: o.kind === 'free' ? 'bolt' : 'inventory_2',
                }"
            /></span>
            <h3>{{ o.id }}</h3>
          </div>
          <span :class="'chip ' + o.status">{{
            model.state.S.statuses[o.status]
          }}</span>
        </div>
        <template v-if="o.service === 'vip'"
          ><VipBanner :compact="true"></VipBanner
        ></template>

        <ArrivalCountdown :order="o"></ArrivalCountdown>
        <div class="order-strip">
          <div>
            <strong>{{
              o.recipient.name || "بيانات المستلم تظهر بعد الاستلام"
            }}</strong>
            <p class="muted">
              {{ o.sender.area || o.sender.province }}
              {{ " ← " }}
              {{ o.recipient.area }}
              {{ " • " }}
              {{
                model
                  .orderVehicles(o)
                  .map((v) => model.vehicleNames[v])
                  .join(" أو ")
              }}
            </p>
          </div>
          <template v-if="o.service === 'vip'"
            ><span class="vip-badge" aria-label="طلب VIP — مندوب مخصص"
              ><MaterialIcon
                :model="{
                  n: 'workspace_premium',
                }"
              />
              VIP</span
            ></template
          >
        </div>
        <div class="money-grid">
          <div>
            <span>البضاعة</span>
            <strong>{{ model.money(o.amount) }} {{ " د.ع" }}</strong>
          </div>
          <div>
            <span>التوصيل</span>
            <strong>{{ model.money(o.fee) }} {{ " د.ع" }}</strong>
          </div>
          <div>
            <span>أجرة الراجع</span>
            <strong>{{ model.money(o.returnFee) }} {{ " د.ع" }}</strong>
          </div>
        </div>
        <div class="order-bottom">
          <span class="muted"
            >{{ o.count }}
            {{ " قطع • " }}
            {{ o.weight }}
            {{ " كغم • الأجرة على " }}
            <template v-if="o.feePayer === 'merchant'">التاجر</template>
            <template v-else>الزبون</template>
            {{ " " }}
            <template v-if="o.settled">• مسوّى</template>
            <template v-else></template
          ></span>
          <ActionButton
            :model="{
              action: 'order',
              extra: `data-id=&quot;${o.id}&quot;`,
            }"
            >تفاصيل الطلب</ActionButton
          >
        </div>
      </article></template
    ></template
  >
  <template v-else><div class="empty">لا توجد طلبات بهذه الحالة</div></template>
</template>
