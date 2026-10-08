import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { build } from "vite";
import "./build-transparent-logo.mjs";

const pages = process.argv.includes("--pages");
if (pages) process.env.PAGES_BUILD = "1";
const output = pages ? "site" : "dist";
const workerSource = fs.readFileSync("src/service-worker.js", "utf8");

function filesIn(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(folder, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

const applicationNames = {
  "": "التاجر والتوصيل الحر",
  courier: "المندوب",
};
// Build the parent first so clearing its output cannot remove child applications.
for (const [application, name] of Object.entries(applicationNames)) {
  await build({ mode: application || "production" });
  const dir = path.join(output, application);
  const manifestPath = path.join(dir, "manifest.webmanifest");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.name = "واصل — " + name;
  manifest.short_name = application ? "واصل " + name : "واصل";
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  const files = filesIn(dir).map((file) =>
    path.relative(dir, file).replaceAll("\\", "/"),
  );
  const hash = crypto.createHash("sha256").update(workerSource);
  for (const file of files)
    hash.update(file).update(fs.readFileSync(path.join(dir, file)));
  const version = hash.digest("hex").slice(0, 12);
  const worker = workerSource
    .replace("__VERSION__", version)
    .replace("__FILES__", JSON.stringify(["./", ...files]));
  fs.writeFileSync(path.join(dir, "sw.js"), worker);
  console.log(
    `Vue ${application} ${pages ? "Pages" : "local"} build ${version}`,
  );
}

// Previously shared links keep working, but now lead to the one account chooser.
for (const application of ["merchant", "free"]) {
  const dir = path.join(output, application);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0;url=../#/choose">
<title>واصل — التاجر والتوصيل الحر</title></head>
<body><a href="../#/choose">الدخول إلى تطبيق التاجر والتوصيل الحر</a></body></html>
`,
  );
  fs.copyFileSync("src/retired-entry-worker.js", path.join(dir, "sw.js"));
}

if (pages) {
  // Pages publishes main/root. Only copy generated output inside this repository.
  const files = filesIn(output).map((file) =>
    path.relative(output, file).replaceAll("\\", "/"),
  );
  for (const file of files) {
    const target = path.resolve(file);
    if (!target.startsWith(process.cwd() + path.sep))
      throw Error("Invalid output path");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(output, file), target);
  }
  fs.writeFileSync(".nojekyll", "");
  const currentAssets = new Set(files);
  let removed = 0;
  for (const folder of ["assets", "courier/assets"]) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = `${folder}/${entry.name}`;
      if (
        entry.isFile() &&
        /^(?:index|leaflet-src)-[A-Za-z0-9_-]+\.(?:js|css)$/.test(entry.name) &&
        !currentAssets.has(file)
      ) {
        fs.unlinkSync(path.resolve(file));
        removed++;
      }
    }
  }
  // Remove only the generated files from the retired builds, within this checkout.
  for (const application of ["merchant", "free"]) {
    const dir = path.resolve(application);
    if (path.dirname(dir) !== process.cwd())
      throw Error("Invalid retired application path");
    for (const entry of fs.readdirSync(dir)) {
      if (["index.html", "sw.js"].includes(entry)) continue;
      const target = path.resolve(dir, entry);
      if (path.dirname(target) !== dir)
        throw Error("Invalid retired output path");
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
  console.log(`Removed ${removed} obsolete Pages bundles`);
}
