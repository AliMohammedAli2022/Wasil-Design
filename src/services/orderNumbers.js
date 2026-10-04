export const BASE_ORDER_COUNT = 54;
export const MERCHANT_ORDER_COUNT = 414;
export const SAMPLE_ORDER_COUNT = MERCHANT_ORDER_COUNT * 2;

const isNumber = (value) =>
  /^[1-9]\d*$/.test(String(value)) && Number.isSafeInteger(Number(value));

export function legacyOrderNumber(value) {
  const match = /^(FREE-)?ORD-(DEMO|SAMPLE-OCT)-(\d+)$/.exec(value);
  if (!match) return null;
  const index = Number(match[3]);
  const base = match[2] === "DEMO";
  if (
    index < 1 ||
    index > (base ? BASE_ORDER_COUNT : MERCHANT_ORDER_COUNT - BASE_ORDER_COUNT)
  )
    return null;
  return String(
    index +
      (base ? 0 : BASE_ORDER_COUNT) +
      (match[1] ? MERCHANT_ORDER_COUNT : 0),
  );
}

export function resolveOrderNumber(data, value) {
  return Object.hasOwn(data.orderNumberAliases ?? {}, value)
    ? data.orderNumberAliases[value]
    : (legacyOrderNumber(value) ?? String(value));
}

// Keep the counter after deletion and migrate references with their orders.
export function migrateOrderNumbers(data) {
  const aliases = (data.orderNumberAliases ??= {});
  const occupied = new Set(
    data.orders
      .filter((order) => isNumber(order.id))
      .map((order) => String(order.id)),
  );
  let next = Math.max(
    SAMPLE_ORDER_COUNT + 1,
    Number(data.nextOrderNumber) || 1,
    ...[...occupied, ...Object.values(aliases)]
      .filter(isNumber)
      .map((value) => Number(value) + 1),
  );
  const assign = (value) => {
    if (isNumber(value)) return String(value);
    if (Object.hasOwn(aliases, value)) return aliases[value];
    const preferred = legacyOrderNumber(value);
    const number =
      preferred && !occupied.has(preferred) ? preferred : String(next++);
    occupied.add(number);
    aliases[value] = number;
    return number;
  };
  for (const order of data.orders) {
    const old = String(order.id);
    if (/^(?:FREE-)?ORD-DEMO-/.test(old)) order.sampleGroup = "base";
    if (/^(?:FREE-)?ORD-SAMPLE-OCT-/.test(old)) order.sampleGroup = "october";
    order.id = assign(old);
  }
  const references = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if (key === "orderNumberAliases") continue;
      if (key === "orderId" && item != null) {
        const old = String(item);
        value[key] = aliases[old] ?? legacyOrderNumber(old) ?? assign(old);
      } else references(item);
    }
  };
  references(data);
  for (const batch of data.batches ?? [])
    batch.ids = batch.ids.map(
      (value) => aliases[value] ?? legacyOrderNumber(value) ?? assign(value),
    );
  const rewrite = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if (key === "orderNumberAliases") continue;
      if (typeof item === "string")
        value[key] = item.replace(
          /(?:FREE-)?ORD-[A-Za-z0-9-]+/g,
          (old) => aliases[old] ?? legacyOrderNumber(old) ?? old,
        );
      else rewrite(item);
    }
  };
  rewrite(data);
  data.nextOrderNumber = next;
}

export function nextOrderNumber(data) {
  const number = Math.max(
    data.nextOrderNumber || 1,
    ...data.orders.map((order) => Number(order.id) + 1),
  );
  if (!Number.isSafeInteger(number) || number < 1)
    throw new Error("تعذر تخصيص رقم الطلب");
  data.nextOrderNumber = number + 1;
  return String(number);
}
