<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div class="status-picker">
    <button
      id="status-trigger"
      class="status-trigger"
      data-action="filter-open"
      aria-haspopup="listbox"
      aria-controls="status-menu"
      aria-expanded="false"
    >
      <MaterialIcon
        :model="{
          n: 'filter_list',
        }"
      />
      <span
        class="status-trigger-label"
        :title="model.state.S.statuses[model.state.filter] || 'جميع الحالات'"
        >{{
          model.state.S.statuses[model.state.filter] || "جميع الحالات"
        }}</span
      >
      <span class="status-trigger-count"
        ><svg viewBox="0 0 28 28" class="status-count-number">
          <text
            :x="14"
            :y="14"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {{
              model
                .baseOrders()
                .filter(
                  (o) =>
                    model.state.filter === "all" ||
                    o.status === model.state.filter,
                ).length
            }}
          </text>
        </svg></span
      >
      <MaterialIcon
        :model="{
          n: 'expand_more',
        }"
      />
    </button>
    <div id="status-menu" popover="auto" class="status-menu">
      <div class="status-menu-heading">
        حالة الشحنة <span>عدد الطلبات</span>
      </div>
      <div role="listbox" aria-label="حالة الشحنة">
        <template v-for="[v, label] in model.options"
          ><button
            role="option"
            :aria-selected="model.state.filter === v"
            :tabindex="model.state.filter === v ? 0 : -1"
            data-action="filter"
            :data-value="v"
            :class="'status-option status-' + v"
          >
            <span
              class="status-icon material-symbols-outlined"
              aria-hidden="true"
              ><template v-if="v === 'all'">filter_list</template>
              <template v-else
                ><template v-if="v.startsWith('return')"
                  >assignment_return</template
                >
                <template v-else
                  ><template v-if="v === 'delivered'">check_circle</template>
                  <template v-else
                    ><template v-if="v === 'cancelled'">cancel</template>
                    <template v-else
                      ><template v-if="v === 'draft'">edit_note</template>
                      <template v-else>local_shipping</template></template
                    ></template
                  ></template
                ></template
              ></span
            >
            <span class="status-option-label">{{ label }}</span>
            <span
              class="status-check material-symbols-outlined"
              aria-hidden="true"
              >check</span
            >
            <span class="status-badge">{{
              model.baseOrders().filter((o) => v === "all" || o.status === v)
                .length
            }}</span>
          </button></template
        >
      </div>
    </div>
  </div>
</template>
