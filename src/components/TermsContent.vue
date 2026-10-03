<script setup>
import { termsSections, TERMS_UPDATED } from "../services/terms.js";
</script>

<template>
  <article class="terms-content" aria-label="شروط استخدام واصل">
    <p class="terms-updated">
      آخر تحديث: <span dir="ltr">{{ TERMS_UPDATED }}</span>
    </p>
    <section
      v-for="(section, index) in termsSections"
      :key="section.title"
      class="terms-section"
    >
      <h2>
        <span aria-hidden="true">{{ index + 1 }}</span
        >{{ section.title }}
      </h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">
        {{ paragraph }}
      </p>
      <ul v-if="section.items">
        <li v-for="item in section.items" :key="item">{{ item }}</li>
      </ul>
      <p v-if="section.note" class="terms-note">{{ section.note }}</p>
    </section>
  </article>
</template>

<style scoped>
.terms-content {
  color: #355766;
  font-size: 14px;
  line-height: 1.95;
  overflow-wrap: anywhere;
}
.terms-updated {
  margin: 0 0 18px;
  color: #647d89;
  font-size: 12px;
}
.terms-section + .terms-section {
  margin-top: 24px;
}
.terms-section h2 {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.7;
  color: #00567a;
}
.terms-section h2 span {
  flex: 0 0 26px;
  text-align: center;
  border-radius: 9px;
  background: #eaf3f7;
  color: #00567a;
  font-size: 12px;
}
.terms-section p {
  margin: 8px 0;
}
.terms-section ul {
  list-style: disc;
  margin: 8px 0;
  padding-inline-start: 22px;
}
.terms-section li {
  margin: 8px 0;
  padding-inline-start: 3px;
}
.terms-section li::marker {
  color: #f47d2f;
}
.terms-note {
  padding: 12px 14px;
  background: #fff5eb;
  border-inline-start: 3px solid #f47d2f;
  border-radius: 10px;
  font-size: 13px;
}
:global(html[data-theme="dark"] .terms-content) {
  color: #d8e8ef;
}
:global(html[data-theme="dark"] .terms-section h2) {
  color: #a9ddec;
}
:global(html[data-theme="dark"] .terms-section h2 span) {
  color: #bbdfeb;
  background: #24485b;
}
:global(html[data-theme="dark"] .terms-updated) {
  color: #aec3ce;
}
:global(html[data-theme="dark"] .terms-note) {
  background: #3b3029;
}
</style>
