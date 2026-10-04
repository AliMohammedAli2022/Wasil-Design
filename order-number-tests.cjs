const { test } = require("node:test");
const assert = require("node:assert/strict");

test("sample orders use one unique numeric sequence across both accounts", async () => {
  const { createDemoData } = await import("./src/services/demoData.js");
  const data = createDemoData();
  assert.deepEqual(
    data.orders.map((order) => order.id),
    Array.from({ length: 828 }, (_, i) => String(i + 1)),
  );
  assert.equal(data.nextOrderNumber, 829);
});

test("legacy migration preserves orders, linked records, deleted-order references and aliases", async () => {
  const { createDemoData } = await import("./src/services/demoData.js");
  const { migrateOrderNumbers, resolveOrderNumber } =
    await import("./src/services/orderNumbers.js");
  const data = createDemoData();
  for (const order of data.orders) {
    const number = ((Number(order.id) - 1) % 414) + 1;
    const prefix = order.merchant === "FREE-DEMO" ? "FREE-" : "";
    order.id =
      prefix +
      (number <= 54 ? "ORD-DEMO-" : "ORD-SAMPLE-OCT-") +
      String(number <= 54 ? number : number - 54).padStart(4, "0");
    delete order.sampleGroup;
  }
  data.orders.push({
    ...structuredClone(data.orders[0]),
    id: "ORD-abc123",
    notes: "عنوان عدله المستخدم",
  });
  data.orders = data.orders.filter((order) => order.id !== "ORD-DEMO-0002");
  data.ledger.push({
    id: "L-keep",
    owner: "MER-DEMO",
    orderId: "ORD-abc123",
    amount: 12000,
    text: "تسوية ORD-abc123",
  });
  data.cashLedger.push({ orderId: "ORD-DEMO-0002" });
  for (const collection of ["messages", "ratings", "offers", "tickets"])
    data[collection] = [{ orderId: "FREE-ORD-DEMO-0001" }];
  data.notifications.push({
    text: "ORD-DEMO-0001 — ORD-DEMO-0010",
    orderId: "ORD-DEMO-0001",
  });
  data.batches = [{ id: "B-keep", ids: ["ORD-DEMO-0001", "ORD-abc123"] }];
  data.users[0].cancellations = [{ orderId: "ORD-abc123" }];
  const before = structuredClone(data.orders[0]);
  migrateOrderNumbers(data);
  assert.equal(data.orders.length, 828);
  assert.equal(new Set(data.orders.map((order) => order.id)).size, 828);
  assert.ok(data.orders.every((order) => /^[1-9]\d*$/.test(order.id)));
  assert.deepEqual(data.orders[0], { ...before, id: "1", sampleGroup: "base" });
  assert.equal(data.orders.at(-1).id, "829");
  assert.equal(data.orders.at(-1).notes, "عنوان عدله المستخدم");
  assert.deepEqual(data.ledger.at(-1), {
    id: "L-keep",
    owner: "MER-DEMO",
    orderId: "829",
    amount: 12000,
    text: "تسوية 829",
  });
  assert.equal(data.cashLedger[0].orderId, "2");
  for (const collection of ["messages", "ratings", "offers", "tickets"])
    assert.equal(data[collection][0].orderId, "415");
  assert.equal(data.notifications.at(-1).text, "1 — 10");
  assert.deepEqual(data.batches[0], { id: "B-keep", ids: ["1", "829"] });
  assert.equal(data.users[0].cancellations[0].orderId, "829");
  assert.equal(resolveOrderNumber(data, "ORD-abc123"), "829");
  const migrated = structuredClone(data);
  migrateOrderNumbers(data);
  assert.deepEqual(data, migrated);
});

test("creation remains sequential across accounts, tabs, reloads and deletion", async () => {
  const { createDemoApi, DEMO_STORAGE_KEY } =
    await import("./src/services/demoApi.js");
  const { createDemoData } = await import("./src/services/demoData.js");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  const merchant = createDemoApi(storage),
    free = createDemoApi(storage);
  const template = createDemoData().orders[0];
  await merchant("/api/login", { role: "merchant" });
  await free("/api/login", { role: "free" });
  const first = await merchant("/api/orders", template);
  const second = await free("/api/orders", template);
  assert.equal(first.id, "829");
  assert.equal(second.id, "830");
  assert.equal(first.merchant, "MER-DEMO");
  assert.equal(second.merchant, "FREE-DEMO");
  const saved = JSON.parse(values.get(DEMO_STORAGE_KEY));
  saved.orders = saved.orders.filter((order) => order.id !== "830");
  values.set(DEMO_STORAGE_KEY, JSON.stringify(saved));
  const restored = createDemoApi(storage);
  await restored("/api/login", { role: "merchant" });
  assert.equal((await restored("/api/orders", template)).id, "831");
  assert.equal((await free("/api/orders", template)).id, "832");
});

test("legacy API actions and tracking snapshots resolve sample order numbers", async () => {
  const { createDemoApi } = await import("./src/services/demoApi.js");
  const { trackingLink, readTracking } =
    await import("./src/services/tracking.js");
  const api = createDemoApi(null);
  await api("/api/login", { role: "merchant" });
  await api("/api/orders/ORD-DEMO-0001/action", { action: "publish" });
  const order = (await api("/api/state")).orders.find(
    (order) => order.id === "1",
  );
  assert.equal(order.status, "published");
  assert.equal(readTracking(trackingLink(order)).id, "1");
  assert.equal(
    readTracking(trackingLink({ ...order, id: "FREE-ORD-DEMO-0001" })).id,
    "415",
  );
});
