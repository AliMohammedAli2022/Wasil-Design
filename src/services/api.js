import { createDemoApi } from "./demoApi.js";
import { currentApplication } from "./accounts.js";
// Replace this single adapter with an HTTP client when server integration begins.
export const api = createDemoApi(
  globalThis.localStorage,
  currentApplication().accounts,
);
