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
  free: { id: "free", accounts: ["free"], defaultAccount: "free" },
};

export function currentApplication(
  pathname = globalThis.location?.pathname || "",
  id = globalThis.document?.documentElement?.dataset?.application,
) {
  // The URL owns the account identity, even if an older parent cache supplied HTML.
  const entry = pathname.match(/\/(merchant|free|courier)(?:\/|$)/)?.[1];
  if (entry) return { id: entry, accounts: [entry], defaultAccount: entry };
  return applications[id] || applications.merchant;
}
