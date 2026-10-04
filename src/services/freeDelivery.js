import { accountType } from "./accounts.js";

// Upgrade the initial merchant copies to delivery-only accounts and orders.
export function normalizeFreeDeliveryAccounts(data) {
  const owners = new Set();
  for (const user of data.users) {
    if (accountType(user) !== "free") continue;
    owners.add(user.id);
    delete user.businessName;
  }
  for (const order of data.orders) {
    if (!owners.has(order.merchant)) continue;
    order.kind = "free";
    order.amount = 0;
    order.collection = "none";
    if (order.sender) delete order.sender.businessName;
    if (order.partial) order.partial.amount = 0;
  }
}
