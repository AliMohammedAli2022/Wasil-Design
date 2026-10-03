<script setup>
import { createView } from "../../services/viewContent.js";
import MaterialIcon from "../shell/MaterialIcon.vue";
import AccountPanel from "./AccountPanel.vue";
import AccountDetails from "./AccountDetails.vue";
import AccountRatings from "./AccountRatings.vue";
const props = defineProps({ model: { type: Object, required: true } });
const sections = [
  { title: "معلومات الحساب", icon: "person", component: AccountDetails },
  { title: "التقييمات", icon: "star", component: AccountRatings },
  { title: "المسودات", icon: "draft" },
];
function open(section) {
  const content = section.component
    ? createView(section.component, { model: props.model })
    : props.model.drafts;
  props.model.modal(
    section.title,
    createView(AccountPanel, { model: { content } }),
  );
}
</script>
<template>
  <div class="account-options account-profile-options">
    <button
      v-for="section in sections"
      :key="section.title"
      type="button"
      class="account-option"
      aria-haspopup="dialog"
      @click="open(section)"
    >
      <span class="option-icon"
        ><MaterialIcon
          :model="{
            n: section.icon,
          }" /></span
      ><strong>{{ section.title }}</strong
      ><span class="option-chevron" aria-hidden="true">‹</span>
    </button>
  </div>
</template>
