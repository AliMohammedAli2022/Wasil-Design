const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

async function workspace() {
  const { createDemoApi, DEMO_STORAGE_KEY } =
    await import("./src/services/demoApi.js");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  return { storage, key: DEMO_STORAGE_KEY, createDemoApi };
}

test("free account copies merchant features with independent orders, balances, contacts and sessions", async () => {
  const { storage, createDemoApi } = await workspace();
  const merchant = createDemoApi(storage, ["merchant", "free"]);
  const free = createDemoApi(storage, ["merchant", "free"]);
  const courier = createDemoApi(storage, ["courier"]);
  await merchant("/api/login", { role: "merchant" });
  await free("/api/login", { role: "free", phone: "iraq", password: "iraq" });
  await courier("/api/login", { role: "courier" });
  const original = await merchant("/api/state");
  const duplicate = await free("/api/state");
  assert.equal(duplicate.user.role, "merchant");
  assert.equal(duplicate.user.accountType, "free");
  assert.equal(duplicate.user.id, "FREE-DEMO");
  assert.notEqual(duplicate.user.walletId, original.user.walletId);
  assert.equal(duplicate.balance, original.balance);
  assert.equal(duplicate.orders.length, original.orders.length);
  assert.ok(
    duplicate.orders.every(
      (order) =>
        order.merchant === duplicate.user.id &&
        !original.orders.some((other) => other.id === order.id),
    ),
  );
  await free("/api/addresses", {
    name: "عنوان حر",
    province: "بغداد",
    area: "الكرادة",
    address: "عنوان مستقل",
    location: { lat: 33.3, lng: 44.43 },
  });
  const order = await free("/api/orders", {
    ...duplicate.orders.find((order) => order.status === "draft"),
    publish: false,
  });
  assert.equal(order.merchant, "FREE-DEMO");
  await assert.rejects(
    merchant(`/api/orders/${order.id}/action`, { action: "delete" }),
  );
  const unchanged = await merchant("/api/state");
  assert.equal(unchanged.user.id, original.user.id);
  assert.deepEqual(unchanged.user.addresses, original.user.addresses);
  assert.equal(unchanged.orders.length, original.orders.length);
  assert.equal(unchanged.balance, original.balance);
  await free("/api/logout");
  assert.equal((await courier("/api/state")).user.id, "COU-DEMO");
  assert.equal((await merchant("/api/state")).user.id, "MER-DEMO");
  const reopened = createDemoApi(storage);
  await reopened("/api/login", { role: "free" });
  assert.ok(
    (await reopened("/api/state")).orders.some(
      (saved) => saved.id === order.id,
    ),
  );
});


test("same phone can register separate merchant and free identities and cannot cross application entry points", async () => {
  const { storage, createDemoApi } = await workspace();
  const main = createDemoApi(storage, ["merchant", "free"]);
  const courier = createDemoApi(storage, ["courier"]);
  const payload = {
    name: "حساب جديد",
    businessName: "نشاط تجريبي",
    verificationCode: "111111",
    phone: "07912345678",
    activity: "shop",
    password: "password123",
  };
  const merchant = await main("/api/register", {
    ...payload,
    role: "merchant",
  });
  const free = await main("/api/register", { ...payload, role: "free" });
  assert.notEqual(merchant.user.id, free.user.id);
  assert.equal(free.user.role, "merchant");
  assert.equal(free.user.accountType, "free");
  assert.equal(
    (await main("/api/login", { role: "free", phone: payload.phone })).user.id,
    free.user.id,
  );
  assert.equal(
    (await main("/api/login", { role: "merchant", phone: payload.phone })).user
      .id,
    merchant.user.id,
  );
  await assert.rejects(main("/api/register", { ...payload, role: "free" }));
  for (const endpoint of ["/api/login", "/api/register"]) {
    await assert.rejects(main(endpoint, { ...payload, role: "courier" }));
    for (const role of ["merchant", "free"])
      await assert.rejects(courier(endpoint, { ...payload, role }));
  }
});

test("existing workspaces gain free samples once without copying or replacing user edits", async () => {
  const { storage, key, createDemoApi } = await workspace();
  const { createDemoData } = await import("./src/services/demoData.js");
  const old = createDemoData();
  delete old.expandedFreeAccount;
  delete old.lastByRole.free;
  old.users = old.users.filter((user) => user.id !== "FREE-DEMO");
  old.orders = old.orders.filter((order) => order.merchant !== "FREE-DEMO");
  old.ledger = old.ledger.filter((entry) => entry.owner !== "FREE-DEMO");
  old.notifications = old.notifications.filter(
    (entry) => entry.owner !== "FREE-DEMO",
  );
  old.users[0].name = "اسم المستخدم المحفوظ";
  old.orders[0].notes = "تعديل خاص";
  old.ledger[0].amount = 321000;
  storage.setItem(key, JSON.stringify(old));
  const api = createDemoApi(storage);
  await api("/api/login", { role: "free" });
  const free = await api("/api/state");
  assert.equal(free.orders.length, 414);
  assert.ok(free.orders.every((order) => order.notes !== "تعديل خاص"));
  await api("/api/login", { role: "merchant" });
  const merchant = await api("/api/state");
  assert.equal(merchant.user.name, old.users[0].name);
  assert.equal(merchant.orders[0].notes, "تعديل خاص");
  assert.equal(merchant.ledger[0].amount, 321000);
  const reopened = createDemoApi(storage);
  await reopened("/api/login", { role: "free" });
  assert.equal((await reopened("/api/state")).orders.length, 414);
});

test("free routes use merchant pages and each application rejects the other account routes", async () => {
  const { parseRoute } = await import("./src/services/routes.js");
  for (const page of [
    "login",
    "register",
    "home",
    "registry",
    "new",
    "wallet",
    "account",
  ]) {
    assert.deepEqual(parseRoute(`#/free/${page}`, ["merchant", "free"]), {
      role: "free",
      page,
    });
  }
  assert.deepEqual(parseRoute("#/free/available"), {
    role: "free",
    page: "home",
  });
  assert.deepEqual(parseRoute("#/courier/home", ["merchant", "free"]), {
    role: null,
    page: "choose",
  });
  assert.deepEqual(parseRoute("#/free/home", ["courier"]), {
    role: null,
    page: "choose",
  });
});

test("independent courier PWA precaches its own entry and has a distinct manifest identity", async () => {
  const parent = JSON.parse(
    fs.readFileSync("dist/manifest.webmanifest", "utf8"),
  );
  const courier = JSON.parse(
    fs.readFileSync("dist/courier/manifest.webmanifest", "utf8"),
  );
  assert.notEqual(parent.name, courier.name);
  assert.notEqual(
    new URL(parent.id, "https://wasel.test/").href,
    new URL(courier.id, "https://wasel.test/courier/").href,
  );
  const handlers = {},
    entries = new Map();
  let cacheName;
  vm.runInNewContext(fs.readFileSync("dist/courier/sw.js", "utf8"), {
    URL,
    Response,
    fetch: async () => {
      throw Error("offline");
    },
    caches: {
      open: async (name) => {
        cacheName = name;
        return {
          addAll: async (files) => {
            for (const file of files) {
              assert.ok(new URL(file).pathname.startsWith("/courier/"));
              const local =
                "dist" +
                new URL(file).pathname +
                (file.endsWith("/") ? "index.html" : "");
              assert.ok(fs.existsSync(local), local);
              entries.set(file, new Response(local));
            }
          },
          match: async (request) => entries.get(request.url || request),
        };
      },
    },
    self: {
      location: { href: "https://wasel.test/courier/sw.js" },
      skipWaiting: async () => {},
      addEventListener: (name, fn) => {
        handlers[name] = fn;
      },
    },
  });
  let ready;
  handlers.install({
    waitUntil: (promise) => {
      ready = promise;
    },
  });
  await ready;
  assert.ok(cacheName.startsWith("wasel-vue-/courier/-"));
  let response;
  handlers.fetch({
    request: {
      url: "https://wasel.test/courier/",
      method: "GET",
      mode: "navigate",
    },
    respondWith: (promise) => {
      response = promise;
    },
  });
  assert.equal(await (await response).text(), "dist/courier/index.html");
});
