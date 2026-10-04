const { test } = require("node:test");
const assert = require("node:assert/strict");
async function setup() {
  const { createDemoApi, DEMO_STORAGE_KEY } =
    await import("./src/services/demoApi.js");
  const values = new Map();
  const storage = {
    getItem: (k) => values.get(k),
    setItem: (k, v) => values.set(k, v),
  };
  return {
    api: createDemoApi(storage),
    values,
    storage,
    key: DEMO_STORAGE_KEY,
    createDemoApi,
  };
}
test("iraq demo credentials select the populated merchant and reject a wrong password", async () => {
  const { api } = await setup();
  await assert.rejects(
    api("/api/login", { role: "merchant", phone: "iraq", password: "wrong" }),
  );
  await assert.rejects(
    api("/api/login", { role: "courier", phone: "iraq", password: "iraq" }),
  );
  const result = await api("/api/login", {
    role: "merchant",
    phone: "iraq",
    password: "iraq",
  });
  assert.equal(result.user.id, "MER-DEMO");
  const state = await api("/api/state");
  assert.equal(state.orders.length, 414);
  assert.ok(state.orders.some((order) => order.service === "vip"));
});
test("both account roles can save a map point while profile is locked", async () => {
  for (const role of ["merchant", "courier"]) {
    const { api, createDemoApi, storage } = await setup();
    await api("/api/login", { role });
    const before = await api("/api/state");
    assert.equal(before.profileLocked, true);
    const location = { lat: 33.315, lng: 44.415 };
    await api("/api/profile", { action: "location", location });
    await assert.rejects(
      api("/api/profile", {
        action: "location",
        location: { lat: 91, lng: 44 },
      }),
    );
    const restored = createDemoApi(storage);
    await restored("/api/login", { role });
    const after = await restored("/api/state");
    assert.deepEqual(after.user.location, location);
    const savedOrderDetails = (orders) =>
      orders.map(({ id, sender, recipient, status }) => ({
        id,
        sender,
        recipient,
        status,
      }));
    assert.deepEqual(
      savedOrderDetails(after.orders),
      savedOrderDetails(before.orders),
    );
  }
});
test("demo outlet migration preserves balances and adds missing outlets only once", async () => {
  const { api, storage, key, createDemoApi } = await setup();
  await api("/api/login", { role: "merchant" });
  const saved = JSON.parse(storage.getItem(key));
  saved.outlets = saved.outlets.filter((outlet) => outlet.id === "OUT-DEMO");
  saved.outlets[0].balance = 123456;
  saved.expandedDemoOutlets = false;
  storage.setItem(key, JSON.stringify(saved));
  const upgraded = createDemoApi(storage);
  await upgraded("/api/login", { role: "merchant" });
  const state = await upgraded("/api/local-admin", { action: "view" });
  assert.equal(state.outlets.length, 4);
  assert.equal(
    state.outlets.find((outlet) => outlet.id === "OUT-DEMO").balance,
    123456,
  );
  await upgraded("/api/local-admin", {
    action: "topup",
    outlet: "OUT-DEMO-MANSOUR",
    account: "MER-DEMO",
    amount: 1000,
  });
  const reopened = createDemoApi(storage);
  await reopened("/api/login", { role: "merchant" });
  const after = await reopened("/api/local-admin", { action: "view" });
  assert.equal(after.outlets.length, 4);
  assert.equal(
    after.outlets.find((outlet) => outlet.id === "OUT-DEMO-MANSOUR").balance,
    749000,
  );
  assert.equal(
    after.outlets.find((outlet) => outlet.id === "OUT-DEMO").balance,
    123456,
  );
});
test("ten nearby demo couriers migrate once and preserve existing accounts", async () => {
  const { api, storage, key, createDemoApi } = await setup();
  await api("/api/login", { role: "merchant" });
  const fresh = await api("/api/state");
  const extras = fresh.couriers.filter((u) => u.id.startsWith("COU-DEMO-"));
  assert.equal(extras.length, 10);
  assert.equal(extras.filter((u) => u.vehicle === "sedan").length, 3);
  assert.equal(extras.filter((u) => u.vehicle === "motorcycle").length, 3);
  assert.equal(extras.filter((u) => u.cooling === "chilled").length, 2);
  assert.equal(extras.filter((u) => u.cooling === "frozen").length, 2);
  const saved = JSON.parse(storage.getItem(key));
  saved.expandedDemoCouriers = false;
  saved.users = saved.users.filter(
    (u) => !u.id.startsWith("COU-DEMO-") || u.id === extras[0].id,
  );
  saved.users.find((u) => u.id === extras[0].id).name = "اسم معدل";
  saved.users.find((u) => u.id === "COU-DEMO").budget = 123456;
  const originalOrders = structuredClone(saved.orders);
  storage.setItem(key, JSON.stringify(saved));
  for (let pass = 0; pass < 2; pass++) {
    const reopened = createDemoApi(storage);
    await reopened("/api/login", { role: "merchant" });
    const state = await reopened("/api/state");
    assert.equal(state.couriers.length, 11);
    assert.equal(
      state.couriers.find((u) => u.id === extras[0].id).name,
      "اسم معدل",
    );
    const after = JSON.parse(storage.getItem(key));
    assert.equal(after.users.find((u) => u.id === "COU-DEMO").budget, 123456);
    assert.deepEqual(after.orders, originalOrders);
    assert.equal(
      new Set(after.users.map((u) => u.phone)).size,
      after.users.length,
    );
  }
});

test("both roles navigate populated frontend data without network calls", async () => {
  const { api } = await setup();
  for (const role of ["merchant", "courier"]) {
    await api("/api/login", { role });
    const s = await api("/api/state");
    assert.equal(s.user.role, role);
    assert.ok(s.orders.length > 10);
    assert.ok(s.balance > 0);
    assert.equal(s.profileLocked, true);
    assert.ok(s.orders.every((o) => o.demo));
  }
});
test("a draft is saved locally and appears for the courier after publication", async () => {
  const { api, createDemoApi, storage } = await setup();
  await api("/api/login", { role: "merchant" });
  const s = await api("/api/state");
  const draft = await api("/api/orders", {
    ...s.orders[0],
    recipient: { ...s.orders[0].recipient, name: "Vue local" },
    publish: false,
  });
  assert.equal(draft.status, "draft");
  await api(`/api/orders/${draft.id}/action`, { action: "publish" });
  await api("/api/login", { role: "courier" });
  const available = await api("/api/state");
  assert.ok(available.orders.some((o) => o.id === draft.id));
  await api("/api/register", {
    role: "courier",
    name: "اختبار حجز",
    phone: "07912345670",
    vehicle: "sedan",
    province: "بغداد",
  });
  await api("/api/login", { role: "courier", phone: "07912345670" });
  await api("/api/profile", {
    action: "readiness",
    available: true,
    budget: 500000,
    radius: 5,
    location: { lat: 33.3, lng: 44.43 },
  });
  await api(`/api/orders/${draft.id}/action`, { action: "reserve" });
  const loaded = createDemoApi(storage);
  await loaded("/api/login", { role: "courier" });
  assert.equal(
    (await loaded("/api/state")).orders.find((o) => o.id === draft.id).status,
    "reserved",
  );
});
test("registration and profile edits do not persist passwords or documents", async () => {
  const { api, values, key } = await setup();
  await api("/api/register", {
    role: "courier",
    name: "مندوب فحص",
    phone: "07712345678",
    password: "never-save-secret",
    confirmPassword: "never-save-secret",
    documents: { nationalFront: "private-image" },
    photos: ["private-photo"],
  });
  await api("/api/login", { role: "courier", phone: "07712345678" });
  await api("/api/profile", {
    action: "profile",
    name: "اسم محدث",
    address: "عنوان",
  });
  assert.equal((await api("/api/state")).user.pendingProfile.name, "اسم محدث");
  assert.equal((await api("/api/state")).user.name, "مندوب فحص");
  assert.ok(!values.get(key).includes("never-save-secret"));
  assert.ok(!values.get(key).includes("private-image"));
  assert.ok(!values.get(key).includes("private-photo"));
});
test("demo forms, messages, ratings and return state work without a server", async () => {
  const { api } = await setup();
  await api("/api/login", { role: "courier" });
  let s = await api("/api/state");
  const o = s.orders.find((o) => o.status === "received");
  for (const action of ["transit", "customer_arrive"])
    await api(`/api/orders/${o.id}/action`, { action });
  await api(`/api/orders/${o.id}/action`, {
    action: "chat",
    text: "رسالة اختبار",
  });
  await api(`/api/orders/${o.id}/action`, {
    action: "deliver",
    confirmed: true,
    proof: "إثبات تجريبي",
  });
  await api(`/api/orders/${o.id}/action`, {
    action: "settle_delivery",
    confirmed: true,
  });
  await api(`/api/orders/${o.id}/action`, {
    action: "rate",
    stars: 5,
    text: "تقييم",
  });
  s = await api("/api/state");
  assert.equal(s.orders.find((x) => x.id === o.id).settled, true);
  assert.equal(s.messages[0].text, "رسالة اختبار");
  assert.equal(s.ratings[0].stars, 5);
});
test("hash routes stay inside the Pages project and reject invalid role pages", async () => {
  const { parseRoute, routeHash } = await import("./src/services/routes.js");
  for (const role of ["merchant", "courier"])
    for (const page of [
      "home",
      "wallet",
      "account",
      "registry",
      "login",
      "register",
    ])
      assert.deepEqual(parseRoute(routeHash(role, page)), { role, page });
  assert.deepEqual(parseRoute("#/courier/new"), {
    role: "courier",
    page: "home",
  });
  assert.deepEqual(parseRoute("#/anything"), { role: null, page: "choose" });
});
test("unavailable browser storage never prevents preview login", async () => {
  const { createDemoApi } = await import("./src/services/demoApi.js");
  const api = createDemoApi({
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("quota");
    },
  });
  await api("/api/login", { role: "merchant" });
  assert.equal((await api("/api/state")).user.id, "MER-DEMO");
});

test("demo catalog upgrade preserves edited orders and is not repeated", async () => {
  const { createDemoData } = await import("./src/services/demoData.js");
  const { createDemoApi, DEMO_STORAGE_KEY } =
    await import("./src/services/demoApi.js");
  const data = createDemoData();
  const merchantOrders = data.orders.filter(
    (order) => order.merchant === "MER-DEMO",
  );
  assert.equal(merchantOrders.length, 414);
  assert.equal(merchantOrders.filter((o) => o.service === "vip").length, 18);
  data.orders = data.orders.slice(0, 18);
  delete data.expandedDemoCatalog;
  data.orders[0].recipient.name = "اسم عدله المستخدم";
  data.orders[0].status = "cancelled";
  const custom = { ...structuredClone(data.orders[0]), id: "USER-ORDER" };
  data.orders.push(custom);
  const values = new Map([[DEMO_STORAGE_KEY, JSON.stringify(data)]]);
  const storage = {
    getItem: (k) => values.get(k),
    setItem: (k, v) => values.set(k, v),
  };
  const api = createDemoApi(storage);
  await api("/api/login", { role: "merchant" });
  const first = await api("/api/state");
  assert.equal(first.orders.length, 415);
  assert.equal(
    first.orders.find((o) => o.id === "1").recipient.name,
    "اسم عدله المستخدم",
  );
  assert.equal(first.orders.find((o) => o.id === "1").status, "cancelled");
  const again = createDemoApi(storage);
  await again("/api/login", { role: "merchant" });
  assert.equal((await again("/api/state")).orders.length, 415);
});

test("merchant and courier account sections open independent dialogs", async () => {
  require("./tools/register-vue-tests.cjs");
  const { createAccountViews } = await import("./src/views/account/views.js");
  const { mountView } = await import("./tools/mount-vue-test.mjs");
  const { renderToString } = await import("vue/server-renderer");
  const { createDemoData } = await import("./src/services/demoData.js");
  for (const user of createDemoData().users) {
    let opened;
    const h = (tag, props, children) => ({ tag, props, children });
    const context = {
      state: { S: { user, orders: [], ratings: [], profileLocked: false } },
      h,
      row: () => null,
      icon: () => null,
      button: () => null,
      maps: () => null,
      coords: () => null,
      roleNames: {},
      vehicleNames: {},
      money: String,
      fallback: (items, empty) => (items.length ? items : empty),
      modal: (title, content) => {
        opened = { title, content };
      },
    };
    const view = mountView(createAccountViews(() => context).accountView());
    const buttons = view.findAll((node) => node.tag === "button");
    assert.equal(buttons.length, 2);
    for (const [index, title] of ["معلومات الحساب", "التقييمات"].entries()) {
      const trigger = buttons[index];
      assert.equal(trigger.tag, "button");
      assert.equal(trigger.props["aria-haspopup"], "dialog");
      trigger.props.onClick();
      assert.equal(opened.title, title);
      assert.match(
        await renderToString(opened.content),
        /class="account-panel-content"/,
      );
    }
    view.unmount();
  }
});

test("shipment pagination includes every item and clamps filtered pages", async () => {
  const { paginate } = await import("./src/services/pagination.js");
  const items = Array.from({ length: 23 }, (_, i) => i);
  const pages = Array.from({ length: 5 }, (_, i) => paginate(items, i + 1));
  assert.deepEqual(
    pages.flatMap((p) => p.items),
    items,
  );
  assert.equal(pages[4].start, 21);
  assert.equal(pages[4].end, 23);
  assert.equal(paginate(items.slice(0, 2), 5).page, 1);
  assert.equal(paginate([], 5).start, 0);
  assert.deepEqual(paginate([], 5).items, []);
  assert.equal(paginate(items, -1).page, 1);
});

test("October samples add twenty per status once without replacing existing orders", async () => {
  const { createDemoApi, DEMO_STORAGE_KEY } =
    await import("./src/services/demoApi.js");
  const { createDemoData, statuses } =
    await import("./src/services/demoData.js");
  const data = createDemoData();
  const extra = data.orders.filter(
    (o) => o.sampleGroup === "october" && o.merchant === "MER-DEMO",
  );
  for (const status of Object.keys(statuses))
    assert.equal(extra.filter((o) => o.status === status).length, 20);
  assert.equal(new Set(extra.map((o) => o.vehicle)).size, 3);
  data.orders = data.orders.filter(
    (o) => !(o.sampleGroup === "october" && o.merchant === "MER-DEMO"),
  );
  data.orders[0].notes = "preserve custom edit";
  delete data.expandedOctoberOrders;
  const values = new Map([[DEMO_STORAGE_KEY, JSON.stringify(data)]]);
  const storage = {
    getItem: (k) => values.get(k),
    setItem: (k, v) => values.set(k, v),
  };
  for (let i = 0; i < 2; i++) {
    const api = createDemoApi(storage);
    await api("/api/login", { role: "merchant" });
    const state = await api("/api/state");
    assert.equal(state.orders.length, 414);
    assert.equal(
      state.orders.find((o) => o.id === data.orders[0].id).notes,
      "preserve custom edit",
    );
  }
});

test("merchant and free registration require the demo code before creating an account", async () => {
  for (const role of ["merchant", "free"]) {
    const { api, storage, key, createDemoApi } = await setup();
    await api("/api/login", { role });
    const before = storage.getItem(key);
    const registration = {
      role,
      name: "علي محمد كريم",
      businessName: "متجر الأناقة",
      phone: "07912345678",
      password: "private-password",
      activity: "shop",
    };
    for (const verificationCode of [
      undefined,
      "",
      "11111",
      "1111111",
      "١١١١١١",
      "000000",
      "abcdef",
    ]) {
      await assert.rejects(
        api("/api/register", { ...registration, verificationCode }),
        /كود التحقق/,
      );
      assert.equal(storage.getItem(key), before);
    }
    await assert.rejects(
      api("/api/register", {
        ...registration,
        businessName: " ",
        verificationCode: "111111",
      }),
      /اسم النشاط التجاري/,
    );
    const { user } = await api("/api/register", {
      ...registration,
      verificationCode: "111111",
    });
    assert.equal(user.name, registration.name);
    assert.equal(user.businessName, registration.businessName);
    assert.equal(user.registrationVerification.method, "demo");
    assert.ok(
      Number.isFinite(Date.parse(user.registrationVerification.verifiedAt)),
    );
    assert.equal(user.verificationCode, undefined);
    assert.equal(user.password, undefined);
    assert.equal(storage.getItem(key).includes('"verificationCode"'), false);
    const reopened = createDemoApi(storage);
    await reopened("/api/login", { role, phone: registration.phone });
    assert.equal((await reopened("/api/state")).user.id, user.id);
    await assert.rejects(
      reopened("/api/register", {
        ...registration,
        verificationCode: "111111",
      }),
      /مسجل/,
    );
  }
});

test("sample accounts, orders and outlets use realistic names and descriptions without placeholder labels", async () => {
  const { createDemoData } = await import("./src/services/demoData.js");
  const data = createDemoData();
  assert.doesNotMatch(JSON.stringify(data), /تجريب|وهمي|للفحص/);
  for (const user of data.users) {
    assert.ok(user.name.split(" ").length >= 3);
    assert.match(user.phone, /^[0-9]{11}$/);
    assert.ok(user.address.length > 12);
  }
  for (const order of data.orders) {
    assert.ok(order.recipient.name.split(" ").length >= 3);
    assert.match(order.recipient.phone, /^[0-9]{11}$/);
    assert.ok(order.recipient.address.length > 15);
  }
  const { api } = await setup();
  for (const role of ["merchant", "free", "courier"]) {
    await api("/api/login", { role });
    assert.doesNotMatch(
      JSON.stringify(await api("/api/state")),
      /تجريب|وهمي|للفحص/,
    );
  }
});

test("existing sample content upgrades once while preserving user edits, balances and order progress", async () => {
  const { createDemoData } = await import("./src/services/demoData.js");
  const { api, storage, key, createDemoApi } = await setup();
  const old = createDemoData();
  delete old.sampleContentVersion;
  old.users.find((user) => user.id === "FREE-DEMO").name =
    "حساب التوصيل الحر التجريبي";
  old.users.find((user) => user.id === "COU-DEMO-01").address =
    "بغداد، الكرادة — عنوان تجريبي";
  const order = old.orders[0];
  order.recipient.name = "مستلم تجريبي 1";
  order.notes = "ملابس جاهزة — الاتصال قبل الوصول (بيانات وهمية للفحص)";
  order.sender.address = "عنوان معدّل — دار 52";
  order.amount = 76543;
  order.status = "retry";
  order.history[0].text = "بيانات تجريبية — محفوظ";
  order.history.push({
    at: "2026-10-04T00:00:00Z",
    text: "طلب الزبون التأجيل",
    status: "retry",
  });
  old.ledger[0].reason = "إضافة تجريبية";
  old.ledger[0].amount = 123456;
  old.notifications[0].text = "أهلاً بك في حساب التاجر التجريبي";
  old.outlets = [
    {
      id: "OUT-DEMO",
      name: "منفذ تجريبي — الكرادة",
      address: "الكرادة داخل",
      balance: 456,
    },
  ];
  storage.setItem(key, JSON.stringify(old));
  const upgraded = createDemoApi(storage);
  await upgraded("/api/login", { role: "merchant" });
  const state = await upgraded("/api/state");
  assert.doesNotMatch(JSON.stringify(state), /تجريب|وهمي/);
  const record = state.orders.find((item) => item.id === order.id);
  assert.equal(record.recipient.name, "أحمد سامر خليل");
  assert.equal(record.sender.address, "عنوان معدّل — دار 52");
  assert.equal(record.amount, 76543);
  assert.equal(record.status, "retry");
  assert.equal(record.history[1].text, "طلب الزبون التأجيل");
  assert.equal(state.ledger[0].amount, 123456);
  assert.equal(
    state.outlets.find((outlet) => outlet.id === "OUT-DEMO").balance,
    456,
  );
  const saved = JSON.parse(storage.getItem(key));
  saved.orders[0].recipient.name = "اسم عدّله المستخدم";
  storage.setItem(key, JSON.stringify(saved));
  const reopened = createDemoApi(storage);
  await reopened("/api/login", { role: "merchant" });
  assert.equal(
    (await reopened("/api/state")).orders.find((item) => item.id === order.id)
      .recipient.name,
    "اسم عدّله المستخدم",
  );
});
