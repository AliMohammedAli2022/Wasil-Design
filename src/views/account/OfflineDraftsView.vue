<script setup>
import ActionButton from "../ui/ActionButton.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <section class="surface">
    <h3>مسودات الجهاز</h3>
    <p class="muted">
      {{ "مسودات محفوظة على هذا الجهاز فقط: " }} {{ model.drafts.length }}
    </p>
    <template v-for="(d, i) in model.drafts"
      ><div class="device-draft-card">
        <div>
          <strong>{{ d.recipient?.name || "طلب بدون اسم" }}</strong>
          <p class="muted">
            {{
              [d.recipient?.province, d.recipient?.area]
                .filter(Boolean)
                .join(" — ")
            }}
          </p>
        </div>
        <div class="order-actions">
          <ActionButton
            :model="{
              action: 'view-local-draft',
              extra: `data-draft-id=&quot;${d.localDraftId}&quot;`,
            }"
            >مشاهدة الطلب</ActionButton
          >
        </div>
      </div></template
    >
  </section>
</template>
