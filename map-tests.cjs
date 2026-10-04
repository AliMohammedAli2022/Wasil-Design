const { test } = require("node:test");
const assert = require("node:assert/strict");

test("map providers and the Android map intent preserve the selected coordinates", async () => {
  const { mapLinks, nativeMapLink } =
    await import("./src/services/mapLinks.js");
  for (const location of [
    { lat: 33.3, lng: 44.43 },
    { lat: 0, lng: 0 },
    { lat: -24.5, lng: -120 },
  ]) {
    const links = mapLinks(location, "موقع الاستلام");
    assert.deepEqual(
      links.map((link) => link.id),
      ["google", "waze", "apple"],
    );
    for (const link of links) {
      const url = new URL(link.url);
      assert.equal(url.protocol, "https:");
      assert.equal(
        url.searchParams.get(link.id === "google" ? "query" : "ll"),
        `${location.lat},${location.lng}`,
      );
    }
    assert.match(nativeMapLink(location), /^geo:/);
    assert.ok(
      decodeURIComponent(nativeMapLink(location, "موقع الاستلام")).includes(
        `${location.lat},${location.lng} (موقع الاستلام)`,
      ),
    );
  }
  for (const location of [
    null,
    {},
    { lat: 91, lng: 44 },
    { lat: NaN, lng: 44 },
    { lat: 1, lng: Infinity },
  ]) {
    assert.deepEqual(mapLinks(location), []);
    assert.equal(nativeMapLink(location), "");
  }
});

test("sharing uses the chosen map provider, respects cancellation and offers clipboard fallback", async () => {
  const { shareMapLink, mapLinks } = await import("./src/services/mapLinks.js");
  let shared, copied;
  const url = mapLinks({ lat: 33.3, lng: 44.43 })[1].url;
  assert.equal(
    await shareMapLink(url, "الاستلام", {
      share: async (value) => {
        shared = value;
      },
    }),
    "shared",
  );
  assert.equal(shared.url, url);
  const clipboard = {
    writeText: async (value) => {
      copied = value;
    },
  };
  assert.equal(
    await shareMapLink(url, "الاستلام", {
      clipboard,
      share: async () => {
        throw Object.assign(Error(), { name: "AbortError" });
      },
    }),
    "cancelled",
  );
  assert.equal(copied, undefined);
  assert.equal(await shareMapLink(url, "الاستلام", { clipboard }), "copied");
  assert.equal(copied, url);
  assert.equal(await shareMapLink(url, "الاستلام", {}), "manual");
  assert.equal(
    await shareMapLink(url, "الاستلام", {
      clipboard: {
        writeText: async () => {
          throw Error();
        },
      },
    }),
    "manual",
  );
});

test("retiring device drafts deletes their keys and sample markers without touching saved orders or consent", async () => {
  const { removeDeviceDraftStorage } =
    await import("./src/services/storageMigrations.js");
  const data = new Map([
    ["wasel-offline-MER-DEMO", "old drafts"],
    ["wasel-offline-FREE-DEMO-samples-oct-1", "1"],
    ["wasel-vue-frontend-demo-v1", "saved orders"],
    ["wasel-terms-consent-merchant", "consent"],
  ]);
  const storage = {
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index],
    removeItem: (key) => data.delete(key),
  };
  removeDeviceDraftStorage(storage);
  removeDeviceDraftStorage(storage);
  assert.deepEqual([...data.values()], ["saved orders", "consent"]);
  assert.doesNotThrow(() =>
    removeDeviceDraftStorage({
      get length() {
        throw Error();
      },
    }),
  );
});

test("removed device draft routes fall back to the account home", async () => {
  const { parseRoute } = await import("./src/services/routes.js");
  for (const role of ["merchant", "free", "courier"])
    assert.deepEqual(parseRoute(`#/${role}/draft/old-id`), {
      role,
      page: "home",
    });
});
