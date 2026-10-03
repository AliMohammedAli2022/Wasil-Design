import { workflowRole } from "./accounts.js";

export function parseRoute(
  hash,
  allowedAccounts = ["merchant", "free", "courier"],
) {
  const [role, page] = (hash || "").replace(/^#\/?/, "").split("/");
  if (!allowedAccounts.includes(role)) return { role: null, page: "choose" };
  const pages = [
    "login",
    "register",
    "home",
    "registry",
    "wallet",
    "account",
    ...(workflowRole(role) === "merchant" ? ["new", "draft"] : ["available"]),
  ];
  return { role, page: pages.includes(page) ? page : "home" };
}
export function routeHash(role, page) {
  return role ? `#/${role}/${page}` : "#/choose";
}
