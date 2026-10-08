import { createApp } from "vue";
import TrackingView from "./components/TrackingView.vue";
import "leaflet/dist/leaflet.css";
import ApplicationEntry from "./ApplicationEntry.vue";
import "../styles.css";
import "../app.css";
import "../platform.css";
import "../courier-registration.css";
import "../theme.css";
import { initTheme } from "./services/theme.js";
import { initInteractions } from "./services/interaction.js";
import { currentApplication } from "./services/accounts.js";
document.documentElement.dataset.application = currentApplication().id;
history.scrollRestoration = "manual";
window.scrollTo({ top: 0, left: 0, behavior: "instant" });
window.addEventListener("pageshow", () =>
  window.scrollTo({ top: 0, left: 0, behavior: "instant" }),
);
initTheme();
createApp(
  location.hash.startsWith("#/track/") ? TrackingView : ApplicationEntry,
).mount("#wasel-root");
initInteractions();
