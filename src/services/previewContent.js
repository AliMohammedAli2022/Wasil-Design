import { workflowRole } from "./accounts.js";
import { addressConflict, merchantSender } from "./addressBook.js";
import { nextOrderNumber } from "./orderNumbers.js";
import { orderStatus, statuses } from "./orderStatuses.js";

const places = [
  [
    "نقطة استلام الكرادة",
    "الكرادة",
    "الكرادة داخل — شارع العطار، قرب مكتبة دجلة",
    33.3072,
    44.4286,
  ],
  [
    "نقطة استلام المنصور",
    "المنصور",
    "شارع الرواد — بناية النخيل، الطابق الأرضي",
    33.3184,
    44.3538,
  ],
  [
    "نقطة استلام زيونة",
    "زيونة",
    "شارع الربيعي — قرب جامع الربيعي، زقاق 12",
    33.3256,
    44.4632,
  ],
  [
    "نقطة استلام الجادرية",
    "الجادرية",
    "شارع الجامعة — قرب مجمع الياسمين، بناية 8",
    33.2835,
    44.3972,
  ],
];

// Browser preview fixtures only. Add once per account; keep all user edits and deletions.
export function populatePreviewAccounts(data, sample = data) {
  const templates = new Map();
  for (const order of sample.orders) {
    const status = orderStatus(order);
    if (
      order.merchant === "MER-DEMO" &&
      status &&
      (!templates.has(status) || order.status === status)
    )
      templates.set(status, order);
  }
  for (const user of data.users) {
    if (
      !user.demo ||
      workflowRole(user.accountType || user.role) !== "merchant" ||
      user.previewContentVersion === 1
    )
      continue;
    user.addresses ??= [];
    user.customers ??= [];
    places.forEach(([name, area, address, lat, lng], index) => {
      const candidate = {
        name,
        province: "بغداد",
        area,
        address,
        location: { lat, lng },
      };
      if (!addressConflict(user.addresses, candidate))
        user.addresses.push({
          id: `${user.id}-PLACE-${index + 1}`,
          ...candidate,
        });
    });
    const existing = new Set(
      data.orders
        .filter((order) => order.merchant === user.id)
        .map(orderStatus),
    );
    for (const [index, status] of Object.keys(statuses).entries()) {
      if (existing.has(status) || !templates.has(status)) continue;
      const order = structuredClone(templates.get(status));
      const date = new Date(
        Date.now() - (index + 1) * 3 * 3600000,
      ).toISOString();
      Object.assign(order, {
        id: nextOrderNumber(data),
        sampleGroup: "account-preview",
        merchant: user.id,
        courier: order.courier
          ? sample.users.find(
              (driver) =>
                driver.id.startsWith("COU-DEMO-") &&
                driver.vehicle === order.vehicle,
            )?.id || order.courier
          : null,
        service: "normal",
        fee: order.baseFee,
        sender: merchantSender(
          user,
          user.addresses[index % user.addresses.length],
        ),
        createdAt: date,
        updatedAt: date,
        history: order.history.map((event) => ({ ...event, at: date })),
      });
      const reason = {
        failed: "تعذر التسليم: لم يجب الزبون على الاتصال عند الوصول",
        cancelled: "أُلغي الطلب بطلب الزبون قبل استلام المندوب للشحنة",
        retry: "أُجل التسليم إلى الغد بناءً على طلب الزبون",
        returning: "بدأت إعادة الشحنة بعد رفض الزبون الاستلام",
        partial_pending:
          "استلم الزبون جزءاً من الشحنة وأعاد القطعة غير المناسبة",
      }[status];
      if (reason) order.history.at(-1).text = reason;
      data.orders.push(order);
    }
    for (const order of data.orders
      .filter((order) => order.merchant === user.id)
      .slice(0, 12)) {
      if (
        !user.customers.some(
          (customer) =>
            customer.phone === order.recipient.phone &&
            customer.name === order.recipient.name,
        )
      )
        user.customers.push({
          ...structuredClone(order.recipient),
          id: `${user.id}-CUSTOMER-${order.id}`,
        });
    }
    user.previewContentVersion = 1;
  }
}
