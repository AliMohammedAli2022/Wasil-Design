<script setup>
import ActionButton from "../ui/ActionButton.vue";
import LocationShare from "../../components/LocationShare.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p class="muted">
    إحداثيات محفوظة؛ تحديث حركة المندوب يتم عند إرسال موقعه. تجميع العلامة لا
    يحجز الطلبات.
  </p>
  {{ model.mapPlot(model.groups) }}
  <div class="map-list">
    <template v-if="model.groups?.length"
      ><template v-for="g in model.groups"
        ><div
          :class="'map-pin' + (g.vip ? ' vip-order' : '')"
          :id="'map-group-' + g.id"
        >
          <div class="map-pin-heading">
            <h3>{{ g.name }}</h3>
            <template v-if="g.vehicleLabel"
              ><span class="muted">{{ g.vehicleLabel }}</span></template
            >

            <span class="number">{{ g.count }}</span>
          </div>
          <p class="info-line map-pin-coordinates" dir="ltr">
            {{ g.location.lat.toFixed(4) }}
            {{ ", " }}
            {{ g.location.lng.toFixed(4) }}
          </p>
          <div class="contact-actions map-pin-actions">
            <ViewContent
              :content="model.maps(g.location, 'فتح الخريطة', true)"
            />
            <template v-if="g.location"
              ><LocationShare
                :location="g.location"
                :name="g.name"
              ></LocationShare
            ></template>
          </div>
          <template v-if="g.ids"
            ><div class="map-pin-orders" aria-label="طلبات الموقع">
              <template v-for="id in g.ids"
                ><ActionButton
                  :model="{
                    action: 'order',
                    extra: `data-id=&quot;${id}&quot;`,
                  }"
                  >{{ id }}</ActionButton
                ></template
              >
            </div></template
          >
        </div></template
      ></template
    ><template v-else><p>لا توجد مواقع متاحة.</p></template>
  </div>
</template>
