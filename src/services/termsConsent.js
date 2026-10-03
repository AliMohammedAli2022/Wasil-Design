import { TERMS_VERSION } from "./terms.js";

export function validConsent(record, applicationId) {
  return Boolean(
    record &&
    record.version === TERMS_VERSION &&
    record.applicationId === applicationId &&
    record.method === "scroll-and-accept" &&
    typeof record.acceptedAt === "string" &&
    Number.isFinite(Date.parse(record.acceptedAt)),
  );
}

export function createConsentStore(getStorage = () => globalThis.localStorage) {
  const memory = new Map();
  const key = (applicationId) => `wasel-terms-consent-${applicationId}`;
  return {
    read(applicationId) {
      try {
        const record = JSON.parse(
          getStorage()?.getItem(key(applicationId)) || "null",
        );
        if (validConsent(record, applicationId)) return record;
      } catch {
        /* Storage can be unavailable in private browser modes. */
      }
      return memory.get(applicationId) || null;
    },
    accept(applicationId) {
      const record = {
        version: TERMS_VERSION,
        applicationId,
        acceptedAt: new Date().toISOString(),
        method: "scroll-and-accept",
      };
      memory.set(applicationId, record);
      let persisted = false;
      try {
        const storage = getStorage();
        storage?.setItem(key(applicationId), JSON.stringify(record));
        persisted = validConsent(
          JSON.parse(storage?.getItem(key(applicationId)) || "null"),
          applicationId,
        );
      } catch {
        /* The explicit consent remains valid for this session. */
      }
      return { record, persisted };
    },
  };
}

export const termsConsent = createConsentStore();

export function scrollProgress(element) {
  const maximum = Math.max(0, element.scrollHeight - element.clientHeight);
  return maximum <= 1
    ? 1
    : Math.min(1, Math.max(0, element.scrollTop) / maximum);
}

export function reachedTermsEnd(element) {
  return (
    element.clientHeight > 0 &&
    element.scrollHeight - element.clientHeight - element.scrollTop <= 2
  );
}
