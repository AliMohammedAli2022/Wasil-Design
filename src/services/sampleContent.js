import { createDemoData } from "./demoData.js";

const outletNames = {
  "منفذ تجريبي — الكرادة": "مكتب دجلة — الكرادة",
  "منفذ المنصور — تجريبي": "مكتب الربيع — المنصور",
  "منفذ زيونة — تجريبي": "مكتب النخيل — زيونة",
  "منفذ الأعظمية — تجريبي": "مكتب الندى — الأعظمية",
};

function cleanText(value) {
  for (const [previous, current] of Object.entries(outletNames))
    value = value.replaceAll(previous, current);
  return value
    .replaceAll("حساب التوصيل الحر التجريبي", "حساب التوصيل الحر")
    .replaceAll("إضافة تجريبية", "شحن رصيد المحفظة")
    .replaceAll("خصم تجريبي", "أجور خدمات التوصيل")
    .replace(/(?:بيانات|طلب) تجريبية? — /g, "حالة الطلب: ")
    .replaceAll(" (بيانات وهمية للفحص)", "")
    .replace(/\s+(?:التجريبي|تجريبية|تجريبياً|تجريبي)(?=$|[\s؛،.])/g, "");
}

// Refresh presentation text only; identities, balances, locations and workflow stay intact.
function refreshFields(target, sample) {
  if (!target || typeof target !== "object") return;
  for (const [key, value] of Object.entries(target)) {
    if (typeof value === "string") {
      const replacement = sample?.[key];
      const oldPlaceholder =
        /(?:عنوان تجريبي|مستلم تجريبي|حساب التوصيل الحر التجريبي|بيانات تجريبية|بيانات وهمية)/.test(
          value,
        );
      const oldShortName =
        key === "name" &&
        typeof replacement === "string" &&
        value.split(" ").length === 2 &&
        replacement.startsWith(value + " ");
      target[key] =
        (oldPlaceholder || oldShortName) && typeof replacement === "string"
          ? replacement
          : cleanText(value);
    } else if (value && typeof value === "object") {
      refreshFields(value, sample?.[key]);
    }
  }
}

export function refreshSampleContent(data) {
  if (data.sampleContentVersion === 1) return;
  const sample = createDemoData();
  for (const collection of ["users", "orders"]) {
    const known = new Map(
      sample[collection].map((record) => [record.id, record]),
    );
    for (const record of data[collection] || []) {
      const original = known.get(record.id);
      if (original) refreshFields(record, original);
    }
  }
  for (const collection of [
    "outlets",
    "ledger",
    "cashLedger",
    "notifications",
    "audit",
  ])
    for (const record of data[collection] || []) refreshFields(record);
  data.sampleContentVersion = 1;
}
