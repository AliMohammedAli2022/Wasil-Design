import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
export default defineConfig(({ mode }) => {
  const application = mode === "courier" ? "courier" : "";
  const courier = application === "courier";
  const pages = process.env.PAGES_BUILD === "1";
  const appName = {
    courier: "واصل — المندوب",
    "": "واصل — التاجر والتوصيل الحر",
  }[application];
  return {
    root: "web",
    publicDir: "../public",
    plugins: [
      vue(),
      {
        name: "wasel-application-entry",
        transformIndexHtml: (html) =>
          html
            .replaceAll("%APP_ID%", application || "merchant")
            .replaceAll("%APP_NAME%", appName),
      },
    ],
    resolve: {
      alias: [{ find: /^\/src\//, replacement: path.resolve("src") + "/" }],
    },
    base:
      (pages ? "/Wasil-Design/" : "/") + (application ? application + "/" : ""),
    server: { host: "127.0.0.1", port: courier ? 5174 : 5173 },
    build: {
      outDir: path.resolve(pages ? "site" : "dist", application),
      emptyOutDir: true,
    },
  };
});
