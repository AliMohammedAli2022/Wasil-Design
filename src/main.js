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
initTheme();
createApp(
  location.hash.startsWith("#/track/") ? TrackingView : ApplicationEntry,
).mount("#wasel-root");
initInteractions();
