<script setup>
import { ref } from "vue";
import App from "./App.vue";
import LocalPortal from "./components/LocalPortal.vue";
import TermsOnboarding from "./components/TermsOnboarding.vue";
import { currentApplication } from "./services/accounts.js";
import { termsConsent } from "./services/termsConsent.js";
import { parseRoute, routeHash } from "./services/routes.js";

const application = currentApplication();
const entryPage = "login";
const accepted = ref(Boolean(termsConsent.read(application.id)));
const storageNotice = ref("");
const portal = ref(
  ["admin", "outlet"].includes(
    new URLSearchParams(location.search).get("portal"),
  ),
);
// A saved registration URL must not become a dedicated app's launch screen.
// Registration remains available through the login screen during this visit.
if (
  accepted.value &&
  !portal.value &&
  application.defaultAccount &&
  parseRoute(location.hash, application.accounts).page === "register"
) {
  history.replaceState(
    null,
    "",
    routeHash(application.defaultAccount, "login"),
  );
}
function accept() {
  const { persisted } = termsConsent.accept(application.id);
  if (!persisted)
    storageNotice.value =
      "تعذّر حفظ موافقتك على هذا الجهاز؛ قد تظهر الشروط عند فتح التطبيق مجدداً.";
  // Mount the application only after explicit consent, including for deep links.
  const destination = new URL(location.href);
  destination.searchParams.delete("portal");
  destination.hash = routeHash(application.defaultAccount, entryPage);
  history.replaceState(null, "", destination);
  portal.value = false;
  accepted.value = true;
}
</script>

<template>
  <TermsOnboarding v-if="!accepted" :next-page="entryPage" @accept="accept" />
  <template v-else>
    <p v-if="storageNotice" class="consent-storage-notice" role="status">
      {{ storageNotice }}
    </p>
    <LocalPortal v-if="portal" />
    <App v-else />
  </template>
</template>

<style scoped>
.consent-storage-notice {
  margin: 0;
  padding: 12px 20px;
  background: #fff0e3;
  color: #70411d;
  font-size: 13px;
  text-align: center;
}
</style>
