// Add independent sample records once; never clone a visitor's edited account.
export function addFreeDeliveryDemo(data, sample = data) {
  if (data.expandedFreeAccount) return;
  const merchant = sample.users.find((user) => user.id === "MER-DEMO");
  const user = {
    ...structuredClone(merchant),
    id: "FREE-DEMO",
    accountType: "free",
    name: "حساب التوصيل الحر التجريبي",
    phone: "07700000007",
    walletId: "W-FREE-DEMO",
  };
  user.customers = user.customers.map((customer, i) => ({
    ...customer,
    id: `FREE-DEMO-CUS-${i}`,
  }));
  const orders = sample.orders
    .filter((order) => order.merchant === merchant.id)
    .map((order) => ({
      ...structuredClone(order),
      id: `FREE-${order.id}`,
      merchant: user.id,
      sender: structuredClone(user),
    }));
  const ledger = sample.ledger
    .filter((entry) => entry.owner === merchant.id)
    .map((entry) => ({
      ...structuredClone(entry),
      id: `FREE-${entry.id}`,
      owner: user.id,
    }));
  const additions = {
    users: [user],
    orders,
    ledger,
    notifications: [
      {
        id: "N-FREE-DEMO",
        owner: user.id,
        text: "أهلاً بك في حساب التوصيل الحر التجريبي",
        at: orders[0].createdAt,
      },
    ],
  };
  for (const [key, records] of Object.entries(additions)) {
    const existing = new Set(data[key].map((record) => record.id));
    data[key].push(...records.filter((record) => !existing.has(record.id)));
  }
  data.lastByRole.free ??= user.id;
  data.expandedFreeAccount = true;
}
