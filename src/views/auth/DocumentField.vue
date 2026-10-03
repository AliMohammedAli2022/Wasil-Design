<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";
import ActionButton from "../ui/ActionButton.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div
    :class="
      'document-slot ' + (model.r.documents[model.key] ? 'has-photo' : '')
    "
  >
    <template v-if="model.r.documents[model.key]"
      ><img
        :src="model.r.documents[model.key]"
        :alt="model.courierDocs[model.key]"
        class="document-thumbnail"
    /></template>
    <template v-else
      ><MaterialIcon
        :model="{
          n: 'add_a_photo',
        }"
    /></template>
    <span>{{ model.courierDocs[model.key] }}</span>
    <ActionButton
      :model="{
        action: 'document-open',
        extra: `data-document=&quot;${model.key}&quot;`,
        kind: 'document-trigger',
      }"
      ><template v-if="model.r.documents[model.key]"
        >معاينة أو إعادة التصوير</template
      ><template v-else>التقط صورة المستمسك</template></ActionButton
    >
    <label class="document-upload"
      >أو اختر صورة
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :data-document-upload="model.key"
        :aria-label="'اختيار صورة ' + model.courierDocs[model.key]"
    /></label>
  </div>
</template>
