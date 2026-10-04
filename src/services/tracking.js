import { legacyOrderNumber } from "./orderNumbers.js";
import { orderStatus } from "./orderStatuses.js";

function trackingEvents(history = []) {
  let partialDelivered = false;
  return history.flatMap((event) => {
    if (!event || typeof event.status !== "string") return [];
    partialDelivered ||=
      event.status === "partial_pending" ||
      event.publicStatus === "partial_pending";
    const status =
      orderStatus(event.publicStatus) ||
      orderStatus({ status: event.status, partialDelivered });
    return status ? [{ at: event.at, status }] : [];
  });
}

export function trackingLink(
  order,
  base = globalThis.location?.href ||
    "https://alimohammedali2022.github.io/Wasil-Design/",
) {
  const safe = {
    id: order.id,
    status: orderStatus(order),
    at: new Date().toISOString(),
    events: trackingEvents(order.history).slice(-20),
  };
  const encoded = btoa(
    Array.from(new TextEncoder().encode(JSON.stringify(safe)), (b) =>
      String.fromCharCode(b),
    ).join(""),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return base.split("#")[0] + "#/track/" + encoded;
}
export function readTracking(hash) {
  try {
    const encoded = hash.split("/track/")[1];
    if (!encoded || encoded.length > 20000) return null;
    const data = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(encoded.replaceAll("-", "+").replaceAll("_", "/")),
          (c) => c.charCodeAt(0),
        ),
      ),
    );
    if (
      typeof data.id !== "string" ||
      typeof data.status !== "string" ||
      !Array.isArray(data.events)
    )
      return null;
    const events = trackingEvents(data.events);
    const status = orderStatus({ status: data.status, history: events });
    return status
      ? {
          id: legacyOrderNumber(data.id) ?? data.id,
          at: data.at,
          status,
          events,
        }
      : null;
  } catch {
    return null;
  }
}
