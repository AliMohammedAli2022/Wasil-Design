// Public order states shared by both applications and every account type.
export const orderStatusDefinitions = Object.freeze({
  draft: { label: "محفوظ", description: "أُنشئ ولم يُنشر" },
  published: { label: "منشور", description: "متاح للمندوبين المناسبين" },
  reserved: {
    label: "بانتظار المندوب",
    description: "حُجز ولم يصل المندوب بعد",
  },
  waiting: {
    label: "بانتظار الاستلام",
    description: "الشحنة قيد التجهيز أو المراجعة والتسوية",
  },
  transit: { label: "قيد التوصيل", description: "الشحنة في طريقها إلى الزبون" },
  delivered: {
    label: "تم التسليم",
    description: "اكتمل التسليم والتحصيل والتأكيد",
  },
  failed: { label: "تعذر التسليم", description: "سُجل سبب عدم إتمام التسليم" },
  retry: { label: "مؤجل", description: "توجد محاولة أخرى والشحنة مع المندوب" },
  returning: { label: "راجع", description: "تقرر إعادة الشحنة" },
  partial_pending: {
    label: "راجع جزئي",
    description: "جزء من الشحنة في طريق العودة إلى التاجر",
  },
  cancelled: {
    label: "ملغي",
    description: "أُلغي الطلب قبل استلام المندوب للشحنة",
  },
  completed: {
    label: "منتهي",
    description: "آخر حالة للطلب، ويحوّله إليها المندوب",
  },
});

export const statuses = Object.freeze(
  Object.fromEntries(
    Object.entries(orderStatusDefinitions).map(([key, value]) => [
      key,
      value.label,
    ]),
  ),
);

// These stored operational steps retain action eligibility and existing local data.
// They are grouped into the twelve public states, never offered as extra filters.
const stageStates = {
  approaching: "reserved",
  arrived: "waiting",
  received: "transit",
  at_customer: "transit",
  return_pending: "returning",
  returned: "returning",
};

export function orderStatus(order) {
  const value = typeof order === "string" ? { status: order } : order;
  const status = value?.status;
  if (
    ["return_pending", "returning", "returned"].includes(status) &&
    (value.partialDelivered ||
      value.history?.some((event) => event.status === "partial_pending"))
  ) {
    return "partial_pending";
  }
  if (Object.hasOwn(stageStates, status)) return stageStates[status];
  return Object.hasOwn(statuses, status) ? status : null;
}

export const statusLabel = (order) =>
  statuses[orderStatus(order)] || "غير معروف";
export const statusDescription = (order) =>
  orderStatusDefinitions[orderStatus(order)]?.description || "";

export function filterOrders(
  orders,
  { filter = "all", screen, query = "" } = {},
) {
  return orders.filter((order) => {
    if (filter !== "all" && orderStatus(order) !== filter) return false;
    if (
      filter === "all" &&
      screen === "home" &&
      ["delivered", "returned", "cancelled", "completed"].includes(order.status)
    )
      return false;
    return (
      screen === "home" ||
      !query ||
      JSON.stringify([order.id, order.recipient, order.sender]).includes(query)
    );
  });
}

// Store event wording separately so a step within a state remains clear in the log.
export const workflowEventLabels = {
  approaching: "المندوب في الطريق إلى التاجر",
  arrived: "وصل المندوب إلى موقع الاستلام",
  received: "استلم المندوب الشحنة",
  at_customer: "وصل المندوب إلى الزبون",
  return_pending: "تقرر إرجاع الشحنة",
  returning: "بدأت رحلة إرجاع الشحنة",
  returned: "اكتمل استلام المرتجع وتسويته",
};
