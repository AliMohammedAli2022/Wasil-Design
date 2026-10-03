<script setup>
import ActionButton from "../ui/ActionButton.vue";
import MaterialIcon from "../shell/MaterialIcon.vue";
import ProgressiveOrders from "../../components/ProgressiveOrders.vue";
import DraftOrders from "../../components/DraftOrders.vue";
import ViewContent from "../../components/ViewContent.vue";
defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <section class="search-row">
    <input
      id="order-search"
      aria-label="البحث عن طلب"
      placeholder="ابحث برقم الطلب أو الاسم أو المنطقة"
      :value="model.state.query"
    />
    <ViewContent :content="model.statusPicker()" />
    <template v-if="model.state.screen === 'available'"
      ><ActionButton
        :model="{
          action: 'merchant-map',
        }"
        ><MaterialIcon
          :model="{
            n: 'map',
          }"
        />
        {{ " تجميع حسب الموقع" }}</ActionButton
      ></template
    >
  </section>
  <template v-if="!model.registry"
    ><p class="info-line">
      {{ model.os.length }}
      {{ " طلب " }}
      <template v-if="model.state.screen === 'available'"
        >يناسب الموقع والمركبة والميزانية</template
      >
    </p></template
  >

  <template v-if="model.registry"
    ><ProgressiveOrders
      :key="model.state.filter + ':' + model.state.query"
      :orders="model.os"
      ><template #default="{ visible }"
        ><template v-if="model.bulkDrafts"
          ><DraftOrders
            :key="model.state.filter"
            :orders="model.os"
            :visibleOrders="visible"
            :action="model.state.filter === 'draft' ? 'publish' : 'unpublish'"
            @published="() => model.refresh()"
            ><template #default="{ order, checked, busy, toggle }"
              ><ViewContent
                :content="
                  model.orderList([order], {
                    checked,
                    busy,
                    toggle,
                  })
                " /></template></DraftOrders
        ></template>
        <template v-else
          ><ViewContent
            :content="
              model.orderList(visible)
            " /></template></template></ProgressiveOrders
  ></template>
  <template v-else
    ><ViewContent :content="model.orderList(model.os)"
  /></template>
</template>
