import { nextOrderNumber } from "./orderNumbers.js";
import { merchantSender } from "./addressBook.js";
import { statusLabel, workflowEventLabels } from "./orderStatuses.js";

const people = [
  [
    "أحمد سامر خليل",
    "المنصور",
    "شارع الرواد — قرب مجمع النخيل، دار 12",
    33.32,
    44.35,
  ],
  [
    "زينب علي محمود",
    "زيونة",
    "شارع الربيعي — مقابل حديقة الحي، دار 8",
    33.33,
    44.46,
  ],
  [
    "مريم حيدر كريم",
    "الجادرية",
    "شارع الجامعة — قرب مكتبة الياسمين، بناية 6",
    33.28,
    44.4,
  ],
  [
    "عمر قاسم جابر",
    "الكرادة",
    "الكرادة داخل — قرب المسرح الوطني، زقاق 5",
    33.3,
    44.43,
  ],
  [
    "سارة مهند عباس",
    "الأعظمية",
    "شارع الضباط — قرب جامع الإمام الأعظم، دار 21",
    33.37,
    44.36,
  ],
  [
    "يوسف حازم ناظم",
    "بغداد الجديدة",
    "شارع السوق — قرب مكتبة القلم، بناية 9",
    33.315,
    44.49,
  ],
];
const scenarios = [
  ["saved", "draft"],
  ["booking", "published"],
  ["price-offer", "published"],
  ["another-booking", "published"],
  ["extend-arrival", "reserved"],
  ["on-way", "approaching"],
  ["pickup", "waiting"],
  ["another-pickup", "waiting"],
  ["start-delivery", "received"],
  ["on-road", "transit"],
  ["at-recipient", "at_customer"],
  ["settle-delivery", "delivered"],
  ["finish-delivery", "delivered"],
  ["failed-attempt", "failed"],
  ["approve-retry", "retry"],
  ["retry-approved", "retry"],
  ["start-return", "return_pending"],
  ["return-arrival", "returning"],
  ["receive-return", "returning"],
  ["settle-return", "returning"],
  ["finish-return", "returned"],
  ["cancelled", "cancelled"],
  ["finished", "completed"],
];

// Add once when this account is first opened. Never reset user actions or timers.
export function populateCourierScenarios(data, courier) {
  if (
    courier.id !== "COU-HASSAN-MOHAMMED-ALI" ||
    courier.scenariosVersion === 1
  )
    return;
  const owners = ["MER-DEMO", "FREE-DEMO"].map((id) =>
    data.users.find((u) => u.id === id),
  );
  if (owners.some((owner) => !owner)) return;
  const now = Date.now();
  const iso = (minutes) => new Date(now + minutes * 60000).toISOString();
  Object.assign(courier, {
    available: true,
    budget: 750000,
    radius: 20,
    vehicle: "sedan",
    location: { lat: 33.28, lng: 44.39 },
    scenariosVersion: 1,
  });
  for (const [ownerIndex, owner] of owners.entries()) {
    const free = owner.accountType === "free";
    const list = free
      ? scenarios
      : [
          ...scenarios,
          ["partial-return", "partial_pending"],
          ["approve-partial", "at_customer"],
        ];
    for (const [index, [scenario, status]] of list.entries()) {
      const person = people[index % people.length];
      const id = nextOrderNumber(data);
      const prePickup = [
        "draft",
        "published",
        "reserved",
        "approaching",
        "waiting",
        "cancelled",
      ].includes(status);
      const amount = free ? 0 : 20000 + (index % 5) * 5000;
      const settled = [
        "finish-delivery",
        "finish-return",
        "cancelled",
        "finished",
      ].includes(scenario);
      const order = {
        id,
        sampleGroup: "hassan-workflow",
        scenario,
        merchant: owner.id,
        courier: ["draft", "published"].includes(status) ? null : courier.id,
        status,
        kind: free ? "free" : "merchant",
        service: "normal",
        collection: "none",
        nature: index % 4 === 0 ? "fragile" : "normal",
        vehicle: "sedan",
        vehicles: ["sedan"],
        amount,
        count: 3,
        weight: 1,
        length: 25,
        width: 20,
        height: 15,
        baseFee: 5000,
        fee: 5000,
        returnFee: 2000,
        feePayer: index % 2 ? "customer" : "merchant",
        sender: merchantSender(owner),
        recipient: {
          name: person[0],
          phone: `0786600${String(ownerIndex * 100 + index + 1).padStart(4, "0")}`,
          province: "بغداد",
          area: person[1],
          address: person[2],
          landmark: person[2],
          location: { lat: person[3], lng: person[4] },
        },
        notes:
          (free
            ? ["كتب جامعية", "حقيبة ملابس", "مفاتيح منزل", "هدية مغلفة"]
            : [
                "طقم أكواب زجاجية",
                "ثلاث قطع ملابس",
                "كتب ودفاتر",
                "إكسسوارات منزلية",
              ])[index % 4] + " — الاتصال قبل الوصول والتسليم عند مدخل البناية",
        demo: true,
        createdAt: iso(-90 - index),
        updatedAt: iso(-2),
        publishedAt: status === "draft" ? null : iso(-20),
        goodsPaid: !prePickup,
        settled,
        handoverCode: String(321000 + ownerIndex * 100 + index),
        attempts: ["failed", "retry"].includes(status) ? 2 : 1,
        retryAt: status === "retry" ? iso(180) : null,
        retryApproved: scenario === "retry-approved",
        deferReason:
          status === "retry"
            ? "طلب المستلم التسليم بعد عودته إلى المنزل"
            : null,
        partial: ["partial-return", "approve-partial"].includes(scenario)
          ? {
              count: 1,
              amount: amount / 2,
              approved: scenario === "partial-return",
            }
          : null,
        partialDelivered: scenario === "partial-return",
        returnArrived: [
          "receive-return",
          "settle-return",
          "finish-return",
        ].includes(scenario),
        returnReceived: ["settle-return", "finish-return"].includes(scenario),
        returnCode: ["returning", "returned"].includes(status)
          ? String(654000 + ownerIndex * 100 + index)
          : null,
        result: status === "completed" ? "delivered" : null,
        originalMinutes: ["reserved", "approaching"].includes(status)
          ? 30
          : null,
        deadline: ["reserved", "approaching"].includes(status) ? iso(25) : null,
        extensionMinutes: 0,
        extended: false,
        extensionRequest: null,
        arrivedAt: status === "waiting" ? iso(-3) : null,
        history: [],
      };
      const path = status === "draft" ? ["draft"] : ["draft", "published"];
      if (!["draft", "published"].includes(status)) path.push("reserved");
      if (!prePickup || status === "waiting") path.push("waiting");
      if (!prePickup) path.push("received");
      if (!prePickup && status !== "received") path.push("transit");
      if (["delivered", "completed", "partial_pending"].includes(status))
        path.push("at_customer");
      if (status === "completed") path.push("delivered");
      if (["returning", "returned"].includes(status))
        path.push("return_pending");
      if (status === "returned") path.push("returning");
      if (path.at(-1) !== status) path.push(status);
      const stageTimes = {
        draft: -90 - index,
        published: -20,
        reserved: ["reserved", "approaching"].includes(status) ? -5 : -17,
        waiting: status === "waiting" ? -3 : -14,
        received: -11,
        transit: -8,
        at_customer: -5,
        return_pending: -5,
        returning: -4,
      };
      order.history = path.map((stage) => ({
        at: iso(stageTimes[stage] ?? -2),
        actor: ["draft", "published", "cancelled"].includes(stage)
          ? owner.id
          : courier.id,
        status: stage,
        text:
          stage === "failed"
            ? "تعذر التسليم: لم يجب المستلم على الاتصال"
            : stage === "cancelled"
              ? "إلغاء بطلب المرسل قبل استلام الشحنة"
              : stage === "retry"
                ? "موعد آخر بطلب المستلم"
                : workflowEventLabels[stage] || statusLabel(stage),
      }));
      data.orders.push(order);
      const cash = (key, value, reason) =>
        data.cashLedger.push({
          id: `HASSAN-${id}-${key}`,
          owner: courier.id,
          actor: courier.id,
          orderId: id,
          key,
          amount: value,
          reason,
          at: iso(-2),
        });
      if (!prePickup) cash("goods-paid", -amount, "دفع قيمة البضاعة للمرسل");
      if (["delivered", "completed"].includes(status) || order.partialDelivered)
        cash(
          "customer-paid",
          (order.partialDelivered ? order.partial.amount : amount) +
            (order.feePayer === "customer" ? order.fee : 0),
          "تحصيل من المستلم",
        );
      if (
        settled &&
        ["delivered", "completed"].includes(status) &&
        order.feePayer === "merchant"
      )
        cash("merchant-fee", order.fee, "أجرة التوصيل من المرسل");
      if (status === "returned") {
        cash("goods-refund", amount, "استرداد قيمة البضاعة المرتجعة");
        cash(
          "return-fees",
          order.fee + order.returnFee,
          "أجور الذهاب والراجع المتفق عليها",
        );
      }
    }
  }
}
