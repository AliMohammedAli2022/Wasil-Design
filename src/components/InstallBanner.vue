<template>
  <section id="install-banner" class="install-banner" aria-label="تثبيت واصل">
    <img :src="darkMode ? logo : icon" width="48" height="48" alt="" />
    <div>
      <strong>واصل على تلفونك</strong
      ><span>{{
        application.id === "courier"
          ? "طلباتك وياك"
          : "أضفه للشاشة الرئيسية لفتحه بسهولة"
      }}</span>
    </div>
    <button type="button" data-action="install" class="install-cta">
      تثبيت التطبيق
    </button>
  </section>
</template>
<script setup>
import { darkMode } from "../services/theme.js";
import { currentApplication } from "../services/accounts.js";
const application = currentApplication();
const logo = new URL("assets/logo-mark.svg", document.baseURI).href;
const icon = new URL("assets/icon-192.png", document.baseURI).href;
</script>
