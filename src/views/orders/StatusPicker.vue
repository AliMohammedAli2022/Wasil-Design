<script setup>
import { computed } from "vue";
import {
  statuses,
  statusDescription,
  filterOrders,
} from "../../services/orderStatuses.js";
import MaterialIcon from "../shell/MaterialIcon.vue";

defineOptions({ inheritAttrs: false });
const statusIcons = {
  all: "filter_list",
  draft: "edit_note",
  delivered: "check_circle",
  returning: "assignment_return",
  partial_pending: "assignment_return",
  cancelled: "cancel",
  completed: "task_alt",
  retry: "schedule",
  failed: "error",
};
const props = defineProps({ model: { type: Object, required: true } });
const counts = computed(() =>
  Object.fromEntries(
    props.model.options.map(([filter]) => [
      filter,
      filterOrders(props.model.baseOrders(), { ...props.model.state, filter })
        .length,
    ]),
  ),
);
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
        :title="statuses[model.state.filter] || 'جميع الحالات'"
        >{{ statuses[model.state.filter] || "جميع الحالات" }}</span
      >
      <span class="status-trigger-count"
        ><svg viewBox="0 0 28 28" class="status-count-number">
          <text
            :x="14"
            :y="14"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {{ counts[model.state.filter] }}
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
        <template v-for="[v, label] in model.options" :key="v"
          ><button
            role="option"
            :aria-selected="model.state.filter === v"
            :tabindex="model.state.filter === v ? 0 : -1"
            data-action="filter"
            :data-value="v"
            :class="'status-option status-' + v"
            :title="statusDescription(v)"
          >
            <span
              class="status-icon material-symbols-outlined"
              aria-hidden="true"
              >{{ statusIcons[v] || "local_shipping" }}</span
            >
            <span class="status-option-label">{{ label }}</span>
            <span
              class="status-check material-symbols-outlined"
              aria-hidden="true"
              >check</span
            >
            <span class="status-badge">{{ counts[v] }}</span>
          </button></template
        >
      </div>
    </div>
  </div>
</template>
