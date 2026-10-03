<script setup>
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <p v-if="!model.items.length" class="muted" style="margin-top: 12px">
    لا توجد حركات مسجلة.
  </p>
  <div v-else style="overflow: auto">
    <table class="ledger">
      <thead>
        <tr>
          <th>البيان</th>
          <th>المبلغ</th>
          <th>الطلب والتاريخ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in model.items" :key="entry.id || index">
          <td>{{ entry.reason }}</td>
          <td :class="entry.amount >= 0 ? 'positive' : 'negative'" dir="ltr">
            {{ model.money(entry.amount) }}
          </td>
          <td>
            {{ entry.orderId || "—" }}<br /><small>{{
              model.date(entry.at)
            }}</small>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
