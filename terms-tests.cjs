const { test } = require("node:test");
const assert = require("node:assert/strict");

function storageFixture() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
}

test("consent is explicit, versioned, persistent and independent between applications", async () => {
  const { createConsentStore, validConsent } =
    await import("./src/services/termsConsent.js");
  const { TERMS_VERSION } = await import("./src/services/terms.js");
  const storage = storageFixture();
  const store = createConsentStore(() => storage);
  assert.equal(store.read("merchant"), null);
  assert.equal(store.read("courier"), null);
  const { record, persisted } = store.accept("merchant");
  assert.equal(persisted, true);
  assert.equal(record.version, TERMS_VERSION);
  assert.equal(validConsent(record, "merchant"), true);
  assert.equal(validConsent(record, "courier"), false);
  const reopened = createConsentStore(() => storage);
  assert.deepEqual(reopened.read("merchant"), record);
  assert.equal(reopened.read("courier"), null);
  for (const invalid of [
    null,
    {},
    { ...record, version: "old" },
    { ...record, acceptedAt: "invalid" },
    { ...record, method: "automatic" },
  ]) {
    storage.setItem("wasel-terms-consent-merchant", JSON.stringify(invalid));
    assert.equal(createConsentStore(() => storage).read("merchant"), null);
  }
  storage.setItem("wasel-terms-consent-merchant", "broken-json");
  assert.equal(createConsentStore(() => storage).read("merchant"), null);
});

test("blocked storage keeps explicit consent in memory without claiming persistence", async () => {
  const { createConsentStore } = await import("./src/services/termsConsent.js");
  const store = createConsentStore(() => {
    throw Error("storage blocked");
  });
  assert.equal(store.read("merchant"), null);
  const result = store.accept("merchant");
  assert.equal(result.persisted, false);
  assert.deepEqual(store.read("merchant"), result.record);
  assert.equal(store.read("courier"), null);
  assert.equal(createConsentStore(() => undefined).read("merchant"), null);
});

test("scroll gate handles partial scroll, end tolerance and fully visible content", async () => {
  const { reachedTermsEnd, scrollProgress } =
    await import("./src/services/termsConsent.js");
  const element = { scrollHeight: 1200, clientHeight: 400, scrollTop: 0 };
  assert.equal(reachedTermsEnd(element), false);
  assert.equal(scrollProgress(element), 0);
  element.scrollTop = 400;
  assert.equal(reachedTermsEnd(element), false);
  assert.equal(scrollProgress(element), 0.5);
  element.scrollTop = 798.5;
  assert.equal(reachedTermsEnd(element), true);
  element.scrollTop = 810;
  assert.equal(scrollProgress(element), 1);
  assert.equal(
    reachedTermsEnd({ scrollHeight: 200, clientHeight: 400, scrollTop: 0 }),
    true,
  );
  assert.equal(
    reachedTermsEnd({ scrollHeight: 0, clientHeight: 0, scrollTop: 0 }),
    false,
  );
});

test("registration saves the consent receipt for each account type", async () => {
  const { createConsentStore } = await import("./src/services/termsConsent.js");
  const { createDemoApi } = await import("./src/services/demoApi.js");
  const storage = storageFixture();
  const consent = createConsentStore(() => storage);
  for (const role of ["merchant", "free", "courier"]) {
    const appId = role === "courier" ? "courier" : "merchant";
    const { record } = consent.accept(appId);
    const api = createDemoApi(storage);
    const { user } = await api("/api/register", {
      role,
      name: "تسجيل تجريبي",
      businessName: "نشاط تجريبي",
      verificationCode: "111111",
      phone: "07912345678",
      password: "password123",
      confirmPassword: "password123",
      termsAcceptance: record,
    });
    assert.deepEqual(user.termsAcceptance, record);
    const reopened = createDemoApi(storage);
    await reopened("/api/login", { role, phone: user.phone });
    assert.deepEqual(
      (await reopened("/api/state")).user.termsAcceptance,
      record,
    );
  }
});

test("registration entry keeps account selection separate from returning login", async () => {
  const { parseRoute, routeHash } = await import("./src/services/routes.js");
  assert.equal(routeHash(null, "register"), "#/register");
  assert.deepEqual(parseRoute("#/register"), { role: null, page: "register" });
  assert.equal(routeHash(null, "login"), "#/choose");
  assert.equal(routeHash("courier", "register"), "#/courier/register");
});
