const { test } = require("node:test");
const assert = require("node:assert/strict");

test("all accounts expose the same twelve public states and their meanings", async () => {
  const { statuses, orderStatusDefinitions, orderStatus, statusDescription } =
    await import("./src/services/orderStatuses.js");
  const { createDemoApi } = await import("./src/services/demoApi.js");
  assert.deepEqual(Object.values(statuses), [
    "محفوظ",
    "منشور",
    "بانتظار المندوب",
    "بانتظار الاستلام",
    "قيد التوصيل",
    "تم التسليم",
    "تعذر التسليم",
    "مؤجل",
    "راجع",
    "راجع جزئي",
    "ملغي",
    "منتهي",
  ]);
  assert.equal(Object.keys(orderStatusDefinitions).length, 12);
  for (const account of ["merchant", "free", "courier"]) {
    const api = createDemoApi();
    await api("/api/login", { role: account });
    const view = await api("/api/state");
    assert.deepEqual(view.statuses, statuses);
    for (const order of view.orders) {
      assert.ok(statuses[order.publicStatus], order.id);
      assert.equal(order.publicStatus, orderStatus(order));
      assert.ok(statusDescription(order));
    }
  }
});

test("operational steps group correctly without treating an unexecuted partial proposal as a return", async () => {
  const { orderStatus } = await import("./src/services/orderStatuses.js");
  const expected = {
    approaching: "reserved",
    arrived: "waiting",
    received: "transit",
    at_customer: "transit",
    return_pending: "returning",
    returning: "returning",
    returned: "returning",
  };
  for (const [stage, status] of Object.entries(expected))
    assert.equal(orderStatus(stage), status);
  for (const status of ["return_pending", "returning", "returned"]) {
    assert.equal(
      orderStatus({ status, partial: { approved: true } }),
      "returning",
    );
    assert.equal(
      orderStatus({ status, partialDelivered: true }),
      "partial_pending",
    );
    assert.equal(
      orderStatus({ status, history: [{ status: "partial_pending" }] }),
      "partial_pending",
    );
  }
  assert.equal(
    orderStatus({ status: "completed", partialDelivered: true }),
    "completed",
  );
  for (const status of ["unknown", "__proto__", "constructor"])
    assert.equal(orderStatus(status), null);
});

test("filters include every operational step exactly once and counts follow the visible list", async () => {
  const { statuses, filterOrders } =
    await import("./src/services/orderStatuses.js");
  const { createDemoData } = await import("./src/services/demoData.js");
  const orders = createDemoData().orders;
  const groups = Object.keys(statuses).flatMap((filter) =>
    filterOrders(orders, { filter, screen: "registry" }),
  );
  assert.equal(groups.length, orders.length);
  assert.equal(new Set(groups.map((order) => order.id)).size, orders.length);
  const transit = filterOrders(orders, { filter: "transit" });
  assert.deepEqual(
    new Set(transit.map((order) => order.status)),
    new Set(["received", "transit", "at_customer"]),
  );
  const visible = filterOrders(orders, { screen: "home" });
  assert.ok(
    visible.every(
      (order) =>
        !["delivered", "returned", "cancelled", "completed"].includes(
          order.status,
        ),
    ),
  );
  assert.ok(
    filterOrders(orders, { filter: "completed", screen: "home" }).length,
  );
  const match = transit[0];
  assert.deepEqual(
    filterOrders(orders, {
      filter: "transit",
      screen: "registry",
      query: match.id,
    }).map((o) => o.id),
    [match.id, "FREE-" + match.id],
  );
});

test("shared and legacy tracking snapshots retain partial returns and expose only public states", async () => {
  const { trackingLink, readTracking } =
    await import("./src/services/tracking.js");
  const history = [
    "published",
    "received",
    "at_customer",
    "partial_pending",
    "returning",
    "returned",
  ].map((status) => ({ status, at: "2026-10-03T10:00:00Z" }));
  const order = {
    id: "TRACK-1",
    status: "returned",
    partialDelivered: true,
    history,
    recipient: { phone: "07712345678" },
  };
  const data = readTracking(trackingLink(order));
  assert.equal(data.status, "partial_pending");
  assert.deepEqual(
    data.events.map((event) => event.status),
    [
      "published",
      "transit",
      "transit",
      "partial_pending",
      "partial_pending",
      "partial_pending",
    ],
  );
  assert.equal(JSON.stringify(data).includes("07712345678"), false);
  const legacy =
    "#/track/" +
    Buffer.from(
      JSON.stringify({ id: order.id, status: "returned", events: history }),
    ).toString("base64url");
  assert.equal(readTracking(legacy).status, "partial_pending");
  assert.equal(
    readTracking(trackingLink({ ...order, status: "completed" })).status,
    "completed",
  );
});
