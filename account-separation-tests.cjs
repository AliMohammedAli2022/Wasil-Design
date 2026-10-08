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

test("merchant and free share the chooser while courier URLs enforce their own identity", async () => {
  const { currentApplication } = await import("./src/services/accounts.js");
  const { parseRoute } = await import("./src/services/routes.js");
  for (const role of ["merchant", "free", "courier"]) {
    for (const prefix of ["/", "/Wasil-Design/"]) {
      for (const suffix of ["", "/", "/index.html"]) {
        const app = currentApplication(prefix + role + suffix, "merchant");
        assert.equal(app.id, role === "courier" ? "courier" : "merchant");
        assert.deepEqual(
          app.accounts,
          role === "courier" ? ["courier"] : ["merchant", "free"],
        );
        assert.equal(app.defaultAccount, role === "courier" ? "courier" : null);
        for (const other of role === "courier"
          ? ["merchant", "free"]
          : ["courier"])
          assert.equal(parseRoute(`#/${other}/home`, app.accounts).role, null);
      }
    }
  }
  assert.deepEqual(currentApplication("/Wasil-Design/", "merchant").accounts, [
    "merchant",
    "free",
  ]);
});

test("dedicated applications keep independent signed-in users while sharing order updates", async () => {
  const { storage, createDemoApi } = await workspace();
  const { accountType } = await import("./src/services/accounts.js");
  const sessions = Object.fromEntries(
    ["merchant", "free", "courier"].map((role) => [
      role,
      createDemoApi(storage, [role]),
    ]),
  );
  for (const [role, api] of Object.entries(sessions))
    await api("/api/login", { role });
  for (const [role, api] of Object.entries(sessions)) {
    assert.equal(accountType((await api("/api/state")).user), role);
    for (const other of Object.keys(sessions).filter((r) => r !== role))
      await assert.rejects(api("/api/login", { role: other }));
    assert.equal(accountType((await api("/api/state")).user), role);
  }
});

test("only the combined app and courier have installable identities; old links redirect to the chooser", () => {
  const names = new Set(),
    ids = new Set();
  for (const role of ["", "courier/"]) {
    const base = `https://wasel.test/Wasil-Design/${role}`;
    const manifest = JSON.parse(
      fs.readFileSync(`dist/${role}manifest.webmanifest`, "utf8"),
    );
    assert.equal(new URL(manifest.scope, base).href, base);
    assert.equal(new URL(manifest.start_url, base).href, base);
    ids.add(new URL(manifest.id, base).href);
    names.add(manifest.name);
  }
  assert.equal(ids.size, 2);
  assert.equal(names.size, 2);
  for (const role of ["merchant", "free"]) {
    assert.match(
      fs.readFileSync(`dist/${role}/index.html`, "utf8"),
      /0;url=\.\.\/#\/choose/,
    );
    assert.equal(fs.existsSync(`dist/${role}/manifest.webmanifest`), false);
  }
});

test("retiring separate entries removes only their cache and registration", async () => {
  for (const role of ["merchant", "free"]) {
    const handlers = {},
      deleted = [];
    let unregistered = false;
    const prefix = `wasel-vue-/Wasil-Design/${role}/-`;
    vm.runInNewContext(fs.readFileSync("src/retired-entry-worker.js", "utf8"), {
      URL,
      caches: {
        keys: async () => [
          prefix + "old",
          "wasel-vue-/Wasil-Design/-parent",
          "wasel-vue-/Wasil-Design/courier/-courier",
        ],
        delete: async (key) => deleted.push(key),
      },
      self: {
        location: { href: `https://wasel.test/Wasil-Design/${role}/sw.js` },
        registration: {
          unregister: async () => {
            unregistered = true;
          },
        },
        addEventListener: (type, fn) => {
          handlers[type] = fn;
        },
      },
    });
    let done;
    handlers.activate({
      waitUntil: (promise) => {
        done = promise;
      },
    });
    await done;
    assert.deepEqual(deleted, [prefix + "old"]);
    assert.equal(unregistered, true);
  }
});

test("free account copies merchant features with independent orders, balances, contacts and sessions", async () => {
  const { storage, createDemoApi } = await workspace();
  const merchant = createDemoApi(storage, ["merchant", "free"]);
  const free = createDemoApi(storage, ["merchant", "free"]);
  const courier = createDemoApi(storage, ["courier"]);
  await merchant("/api/login", { role: "merchant" });
  await free("/api/login", { role: "free", phone: "iraq", password: "123" });
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

test("new preview accounts include every order state and independent saved places", async () => {
  const { storage, createDemoApi } = await workspace();
  const { orderStatus, statuses } =
    await import("./src/services/orderStatuses.js");
  const api = createDemoApi(storage);
  const ids = new Set();
  for (const role of ["merchant", "free"]) {
    const { user } = await api("/api/register", {
      role,
      name: "حسن علي كريم",
      ...(role === "merchant" ? { businessName: "مكتبة القلم" } : {}),
      phone: "07912345671",
      province: "بغداد",
      area: "الكرادة",
      address: "شارع الصناعة قرب الجامعة التكنولوجية",
      location: { lat: 33.31, lng: 44.44 },
      verificationCode: "111111",
    });
    await api("/api/login", { role, phone: user.phone });
    const state = await api("/api/state");
    assert.deepEqual(
      new Set(state.orders.map(orderStatus)),
      new Set(Object.keys(statuses)),
    );
    assert.equal(state.orders.length, 12);
    assert.equal(user.addresses.length, 4);
    assert.equal(new Set(user.addresses.map((address) => address.id)).size, 4);
    assert.ok(user.customers.length > 0);
    for (const order of state.orders) {
      assert.match(order.id, /^\d+$/);
      assert.ok(!ids.has(order.id));
      ids.add(order.id);
      assert.equal(order.sender.name, user.name);
      assert.equal(order.sender.phone, user.phone);
      assert.equal(order.recipient.name.split(" ").length >= 3, true);
      assert.doesNotMatch(JSON.stringify(order), /تجريبي|وهمي/);
    }
    const reopened = createDemoApi(storage);
    await reopened("/api/login", { role, phone: user.phone });
    assert.deepEqual(
      (await reopened("/api/state")).orders.map((order) => order.id),
      state.orders.map((order) => order.id),
    );
  }
});

test("preview migration preserves edits and does not restore deleted sample content", async () => {
  const { storage, key, createDemoApi } = await workspace();
  const { createDemoData } = await import("./src/services/demoData.js");
  const { populatePreviewAccounts } =
    await import("./src/services/previewContent.js");
  const data = createDemoData();
  const user = data.users.find((user) => user.id === "FREE-DEMO");
  delete user.previewContentVersion;
  user.name = "محمد خالد حسن";
  user.addresses[0].address = "عنوان قمت بتعديله";
  data.orders = data.orders.filter(
    (order) => order.merchant !== user.id || order.status === "published",
  );
  const original = structuredClone(
    data.orders.find((order) => order.merchant === user.id),
  );
  storage.setItem(key, JSON.stringify(data));
  const api = createDemoApi(storage);
  await api("/api/login", { role: "free" });
  const state = await api("/api/state");
  assert.equal(state.user.name, user.name);
  assert.equal(state.user.addresses[0].address, "عنوان قمت بتعديله");
  assert.equal(state.user.addresses.length, 4);
  assert.deepEqual(
    state.orders.find((order) => order.id === original.id).recipient,
    original.recipient,
  );
  const saved = JSON.parse(storage.getItem(key));
  saved.users.find((user) => user.id === "FREE-DEMO").addresses = [];
  saved.orders = saved.orders.filter((order) => order.merchant !== "FREE-DEMO");
  const before = structuredClone(saved);
  populatePreviewAccounts(saved, createDemoData());
  assert.deepEqual(saved, before);
});

test("free orders use profile identity and saved addresses without goods collection", async () => {
  const { storage, key, createDemoApi } = await workspace();
  const { createDemoData } = await import("./src/services/demoData.js");
  const data = createDemoData();
  const oldFree = data.users.find((user) => user.id === "FREE-DEMO");
  oldFree.businessName = "اسم نشاط سابق";
  const oldOrder = data.orders.find((order) => order.merchant === oldFree.id);
  Object.assign(oldOrder, { kind: "merchant", amount: 75000 });
  storage.setItem(key, JSON.stringify(data));
  const api = createDemoApi(storage);
  await api("/api/login", { role: "free" });
  const state = await api("/api/state");
  assert.equal(state.user.businessName, undefined);
  assert.ok(
    state.orders.every(
      (order) =>
        order.kind === "free" &&
        order.amount === 0 &&
        order.collection === "none",
    ),
  );
  const place = state.user.addresses[1];
  const template = state.orders.find((order) => order.status === "draft");
  const payload = {
    ...template,
    kind: "merchant",
    sender: {
      ...template.sender,
      ...place,
      addressId: place.id,
      addressName: place.name,
      name: "اسم آخر",
      phone: "07812345678",
      businessName: "نشاط آخر",
    },
  };
  await assert.rejects(
    api("/api/orders", { ...payload, amount: 1000 }),
    /بدون دفع أو تحصيل/,
  );
  await assert.rejects(
    api("/api/orders", { ...payload, collection: "collect" }),
    /بدون دفع أو تحصيل/,
  );
  const saved = await api("/api/orders", payload);
  assert.equal(saved.kind, "free");
  assert.equal(saved.amount, 0);
  assert.equal(saved.sender.name, state.user.name);
  assert.equal(saved.sender.phone, state.user.phone);
  assert.equal(saved.sender.businessName, undefined);
  assert.equal(saved.sender.addressId, place.id);
  assert.deepEqual(saved.sender.location, place.location);
  await assert.rejects(
    api(`/api/orders/${saved.id}/action`, {
      action: "edit",
      kind: "merchant",
      amount: 5000,
    }),
    /بدون دفع أو تحصيل/,
  );
  const edited = await api(`/api/orders/${saved.id}/action`, {
    action: "edit",
    sender: payload.sender,
  });
  assert.equal(edited.sender.name, state.user.name);
  assert.equal(edited.sender.businessName, undefined);
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
