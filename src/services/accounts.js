// Account identity is separate from the shared merchant/courier workflow role.
// Free delivery initially uses every merchant feature without duplicating views.
export const accountNames = {
  merchant: "التاجر",
  free: "التوصيل الحر",
  courier: "المندوب",
};

export const accountType = (user) => user?.accountType || user?.role;
export const workflowRole = (type) => (type === "free" ? "merchant" : type);

export const applications = {
  merchant: {
    id: "merchant",
    accounts: ["merchant", "free"],
    defaultAccount: null,
  },
  courier: { id: "courier", accounts: ["courier"], defaultAccount: "courier" },
};

export function currentApplication() {
  const id = globalThis.document?.documentElement?.dataset?.application;
  return applications[id] || applications.merchant;
}
