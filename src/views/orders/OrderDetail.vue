<script setup>
import DetailRow from "../ui/DetailRow.vue";
import MaterialIcon from "../shell/MaterialIcon.vue";
import ActionButton from "../ui/ActionButton.vue";
import VipBanner from "../../components/VipBanner.vue";
import OrderQr from "../../components/OrderQr.vue";
import ArrivalCountdown from "../../components/ArrivalCountdown.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <template v-if="model.o.demo"
    ><p class="status-note">طلب تجريبي محلي؛ لا يمثل شحنة حقيقية.</p></template
  >

  <span :class="'chip ' + model.o.status">{{
    model.state.S.statuses[model.o.status]
  }}</span>
  <DetailRow
    :model="{
      label: 'المرسل',
      value: model.o.sender.name,
    }"
  />
  <template v-if="model.o.service === 'vip'"><VipBanner></VipBanner></template>

  <DetailRow
    :model="{
      label: 'المستلم',
      value: model.o.recipient.name || 'محجوب حتى الاستلام',
    }"
  />
  <DetailRow
    :model="{
      label: 'عنوان التسليم',
      value: model.o.recipient.address || model.o.recipient.area,
    }"
  />
  <template v-if="model.o.recipient.landmark"
    ><DetailRow
      :model="{
        label: 'نقطة دالة',
        value: model.o.recipient.landmark,
      }"
  /></template>

  <DetailRow
    :model="{
      label: 'تفاصيل الشحنة',
      value: `${model.o.count} قطع • ${model.o.weight} كغم • ${model.o.length}×${model.o.width}×${model.o.height} سم`,
    }"
  />
  <DetailRow
    :model="{
      label: 'وسيلة النقل',
      value:
        model.natureNames[model.o.nature] +
        ' • ' +
        model
          .orderVehicles(model.o)
          .map((v) => model.vehicleNames[v])
          .join(' أو '),
    }"
  />
  <DetailRow
    :model="{
      label: 'كلفة البضاعة',
      value: model.money(model.o.amount) + ' د.ع',
    }"
  />
  <DetailRow
    :model="{
      label: 'أجرة التوصيل',
      value:
        model.money(model.o.fee) +
        ' د.ع — على ' +
        (model.o.feePayer === 'merchant' ? 'التاجر' : 'الزبون'),
    }"
  />
  <DetailRow
    :model="{
      label: 'أجرة الراجع',
      value: model.money(model.o.returnFee) + ' د.ع',
    }"
  />
  <DetailRow
    :model="{
      label: 'المطلوب من الزبون',
      value: model.money(model.customerDue(model.o)) + ' د.ع',
    }"
  />
  <template v-if="Number.isFinite(model.o.distanceKm)"
    ><DetailRow
      :model="{
        label: 'مسافة التوصيل التقريبية',
        value: model.o.distanceKm.toFixed(1) + ' كم — مسافة مباشرة',
      }"
  /></template>

  <DetailRow
    :model="{
      label: 'تسوية الأموال',
      value: model.o.settled ? 'مكتملة' : 'غير مكتملة',
    }"
  />
  <template v-if="model.o.notes"
    ><DetailRow
      :model="{
        label: 'الملاحظات',
        value: model.o.notes,
      }"
  /></template>

  <template v-if="model.o.courierInfo?.photo"
    ><div class="photo-preview">
      <img alt="صورة المندوب" :src="model.o.courierInfo.photo" /></div
  ></template>

  <template v-if="model.o.courierInfo"
    ><DetailRow
      :model="{
        label: 'المندوب',
        value:
          model.o.courierInfo.name +
          ' • ' +
          model.vehicleNames[model.o.courierInfo.vehicle] +
          ' • ' +
          model.o.courierInfo.plate,
      }"
  /></template>

  <template
    v-if="model.isOwn &amp;&amp; model.o.handoverCode &amp;&amp; model.before.includes(model.o.status)"
    ><div class="review-group">
      <h3>رمز الاستلام</h3>
      <OrderQr :code="model.o.handoverCode" label="رمز الاستلام"></OrderQr>
      <p class="code">{{ model.o.handoverCode }}</p>
      <p class="muted">أعطه للمندوب بعد الفحص واستلام قيمة البضاعة فقط.</p>
    </div></template
  >

  <template
    v-if="model.isOwn &amp;&amp; model.o.returnCode &amp;&amp; model.o.status === 'returning' &amp;&amp; !model.o.returnArrived"
    ><div class="review-group">
      <h3>رمز المرتجع</h3>
      <OrderQr :code="model.o.returnCode" label="رمز المرتجع"></OrderQr>
      <p class="code" dir="ltr">{{ model.o.returnCode }}</p>
      <p class="muted">
        اعرضه للمندوب عند وصوله بالمرتجع. تأكيد الفحص والتسوية يتم بشكل منفصل.
      </p>
    </div></template
  >

  <ArrivalCountdown :order="model.o"></ArrivalCountdown>
  <template v-if="model.o.retryAt"
    ><DetailRow
      :model="{
        label: 'موعد إعادة المحاولة',
        value:
          model.date(model.o.retryAt) +
          (model.o.retryApproved ? ' — معتمد' : ' — بانتظار الموافقة'),
      }"
  /></template>

  <template v-if="model.o.partial"
    ><DetailRow
      :model="{
        label: 'الجزء المقترح',
        value:
          model.o.partial.count +
          ' قطع / ' +
          model.money(model.o.partial.amount) +
          ' د.ع',
      }"
  /></template>

  <div class="contact-actions" style="margin: 14px 0">
    <ViewContent
      :content="model.maps(model.o.sender.location, 'موقع الاستلام')"
    />
    <template v-if="!model.isOwn &amp;&amp; model.o.sender.phone"
      ><a :href="'tel:' + model.o.sender.phone">اتصال بالمرسل</a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        :href="'https://wa.me/964' + (model.o.sender.phone || '').slice(1)"
        >واتساب المرسل</a
      ></template
    >

    <ViewContent
      :content="model.maps(model.o.recipient.location, 'موقع التسليم')"
    />
    <template v-if="model.o.courierInfo"
      ><a :href="'tel:' + model.o.courierInfo.phone"
        ><MaterialIcon
          :model="{
            n: 'phone',
          }"
        />
        {{ " المندوب" }}</a
      >
      <a
        target="_blank"
        rel="noopener noreferrer"
        :href="'https://wa.me/964' + model.o.courierInfo.phone.slice(1)"
        >واتساب المندوب</a
      ></template
    >

    <template v-if="model.o.recipient.phone"
      ><a :href="'tel:' + model.o.recipient.phone"
        ><MaterialIcon
          :model="{
            n: 'phone',
          }"
        />
        {{ " المستلم" }}</a
      ></template
    >

    <template
      v-if="model.o.courier === model.state.S.user.id &amp;&amp; model.o.recipient.phone &amp;&amp; model.o.goodsPaid"
      ><a
        class="customer-whatsapp-action"
        target="_blank"
        rel="noopener noreferrer"
        :href="
          'https://wa.me/964' +
          model.o.recipient.phone.slice(1) +
          '?text=' +
          encodeURIComponent(
            'مرحباً، تم استلام طلبك ' +
              model.o.id +
              ' من ' +
              model.o.sender.name +
              '. المندوب: ' +
              (model.o.courierInfo?.name || '') +
              '، الهاتف: ' +
              (model.o.courierInfo?.phone || '') +
              '. حالة الطلب وقت المشاركة: ' +
              model.trackingLink(model.o),
          )
        "
        >واتساب الزبون — طلبك بحوزتي</a
      ></template
    >
  </div>
  <template v-if="model.o.photo"
    ><div class="photo-preview">
      <img :src="model.o.photo" alt="صورة الشحنة" /></div
  ></template>

  <div class="order-actions">
    <template v-for="[action, label] in model.availableActions(model.o)"
      ><ActionButton
        :model="{
          action: 'order-action',
          extra: `data-id=&quot;${model.oid}&quot; data-op=&quot;${action}&quot;`,
          kind: ['cancel', 'release', 'delete'].includes(action)
            ? 'secondary-button danger'
            : 'secondary-button',
        }"
        >{{ label }}</ActionButton
      ></template
    >
  </div>
  <template
    v-if="model.isOwn &amp;&amp; model.o.status === 'published' &amp;&amp; model.offers.length"
    ><h3 class="section-title">عروض المندوبين</h3>
    <template v-for="v in model.offers"
      ><div class="detail-row">
        <span
          >{{ v.name }}
          {{ " — " }}
          {{ model.vehicleNames[v.vehicle] || "مندوب" }}
          {{ " — " }}
          {{ model.money(v.fee) }}
          {{ " د.ع" }}</span
        >
        <ActionButton
          :model="{
            action: 'order-action',
            extra: `data-id=&quot;${model.oid}&quot; data-op=&quot;accept_offer&quot; data-offer=&quot;${v.id}&quot;`,
          }"
          >قبول العرض</ActionButton
        >
      </div></template
    ></template
  >

  <h3 class="section-title">سجل الطلب</h3>
  <ol class="timeline">
    <template v-for="entry in model.o.history.slice().reverse()"
      ><li>
        {{ entry.text }}
        <small
          >{{ model.date(entry.at) }}
          {{ " • " }}
          {{ entry.actor }}</small
        >
      </li></template
    >
  </ol>
</template>
