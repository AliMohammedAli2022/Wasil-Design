"use strict";
require("./tools/register-vue-tests.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  vm = require("node:vm");
process.env.WASEL_DATA_DIR = fs.mkdtempSync(
  path.join(os.tmpdir(), "wasel-vue-tests-"),
);
const domain = require("./domain.cjs");
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
};
global.location = { hostname: "localhost" };
global.history = { pushState() {} };
global.window = {
  matchMedia: () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }),
  scrollTo() {},
};
global.document = {
  createElement: () => ({}),
  querySelector: () => null,
  hidden: false,
};
global.matchMedia = window.matchMedia;
async function renderPage(page, configure = () => {}) {
  const { createSSRApp, h } = await import("vue");
  const { renderToString } = await import("vue/server-renderer");
  const { useWasel } = await import("./src/composables/useWasel.js");
  let app;
  const html = await renderToString(
    createSSRApp({
      setup() {
        app = useWasel();
        app.state.S = domain.view(domain.user("MER-DEMO"));
        app.ui.page = page;
        configure(app);
        return () => h(app.currentView.value);
      },
    }),
  );
  assert.ok(
    !html.includes("[object Object]"),
    page + " must render Vue nodes, not stringified objects",
  );
  return { html, app };
}
test("account orders open details with English history dates", async () => {
  const { renderToString } = await import("vue/server-renderer");
  const { h } = await import("vue");
  const { app } = await renderPage("AccountView");
  const order = app.state.S.orders[0];
  assert.ok(order.history.length);
  const button = {
    dataset: { action: "order", id: order.id },
    disabled: false,
  };
  await app.dispatch("click", { target: { closest: () => button } });
  assert.equal(app.ui.dialogTitle, order.id);
  const html = await renderToString(h("div", app.ui.dialogContent));
  assert.match(html, /timeline/);
  assert.match(html, /\d{2}\/\d{2}\/\d{4}/);
  assert.doesNotMatch(html, /[٠-٩۰-۹]/);
});

test("auth screens preserve identity and safely escape content", async () => {
  const roles = await renderPage("AuthView");
  assert.match(roles.html, /حيّاك بواصل/);
  assert.match(roles.html, /glass-role merchant/);
  assert.match(roles.html, /data-role="free"/);
  assert.doesNotMatch(roles.html, /data-role="courier"/);
  const login = await renderPage("AuthView", (a) => {
    a.state.authRole = "courier";
    a.ui.authError = "<img onerror=alert(1)>";
    a.ui.formError = a.ui.authError;
  });
  assert.match(login.html, /login-form/);
  assert.match(login.html, /&lt;img/);
  assert.doesNotMatch(login.html, /<img onerror/);
});

test("template login fields retain typed credentials while password visibility changes", async () => {
  const { h, reactive, provide, nextTick } = await import("vue");
  const { mountView } = await import("./tools/mount-vue-test.mjs");
  const { viewStateKey } = await import("./src/composables/useViewState.js");
  const { default: FormInput } = await import("./src/views/ui/FormInput.vue");
  const { default: ActionButton } =
    await import("./src/views/ui/ActionButton.vue");
  const ui = reactive({
    page: "AuthView",
    passwordVisible: false,
    loginPhone: "",
    loginPassword: "",
  });
  const view = mountView(
    h({
      setup() {
        provide(viewStateKey, { ui, state: {} });
        return () =>
          h("div", [
            h(FormInput, { model: { name: "identifier", label: "الحساب" } }),
            h(FormInput, {
              model: {
                name: "password",
                label: "كلمة المرور",
                attrs: 'type="password"',
              },
            }),
            h(ActionButton, { model: { action: "toggle-password" } }),
          ]);
      },
    }),
  );
  const [identifier, password] = view.findAll((node) => node.tag === "input");
  identifier.props.onInput({ target: { value: "07700000001" } });
  password.props.onInput({ target: { value: "private-value" } });
  ui.passwordVisible = true;
  await nextTick();
  assert.equal(password.props.type, "text");
  assert.equal(password.props.value, "private-value");
  assert.equal(identifier.props.value, "07700000001");
  assert.equal(
    view.findAll((node) => node.tag === "button")[0].props["aria-pressed"],
    "true",
  );
  ui.passwordVisible = false;
  await nextTick();
  assert.equal(password.props.type, "password");
  assert.equal(password.props.value, "private-value");
  view.unmount();
});

test("camera template switches from opening to capture and photo review without losing errors", async () => {
  const { h, reactive, provide, nextTick } = await import("vue");
  const { mountView } = await import("./tools/mount-vue-test.mjs");
  const { viewStateKey } = await import("./src/composables/useViewState.js");
  const { default: DocumentCamera } =
    await import("./src/views/camera/DocumentCamera.vue");
  const ui = reactive({ cameraReady: false, cameraError: "" });
  const capture = reactive({ key: "identity", photo: "" });
  const view = mountView(
    h({
      setup() {
        provide(viewStateKey, { ui, state: {} });
        return () =>
          h(DocumentCamera, {
            model: { c: capture, courierDocs: { identity: "الهوية" } },
          });
      },
    }),
  );
  const actions = () =>
    view
      .findAll((node) => node.tag === "button")
      .map((node) => node.props["data-action"]);
  assert.ok(actions().includes("document-start"));
  ui.cameraReady = true;
  await nextTick();
  assert.ok(actions().includes("document-shoot"));
  assert.ok(!actions().includes("document-start"));
  capture.photo = "data:image/png;base64,test";
  ui.cameraError = "راجع الصورة";
  await nextTick();
  assert.ok(actions().includes("document-save"));
  assert.ok(actions().includes("document-retake"));
  assert.equal(
    view.findAll((node) => node.tag === "img")[0].props.src,
    capture.photo,
  );
  assert.ok(view.findAll((node) => node.text === "راجع الصورة").length);
  view.unmount();
});
test("merchant and courier main views render through Vue", async () => {
  for (const role of ["MER-DEMO", "COU-DEMO"])
    for (const page of [
      "HomeView",
      "OrdersView",
      "WalletView",
      "AccountView",
    ]) {
      const { html } = await renderPage(page, (a) => {
        a.state.S = domain.view(domain.user(role));
        a.state.screen = page === "OrdersView" ? "registry" : "home";
      });
      assert.ok(html.length > 100, page);
    }
});
test("order wizard retains all four steps and form constraints", async () => {
  const data = {
    kind: "merchant",
    amount: 1000,
    count: 1,
    weight: 1,
    length: 20,
    width: 20,
    height: 20,
    nature: "normal",
    vehicle: "sedan",
    baseFee: 5000,
    fee: 5000,
    returnFee: 0,
    feePayer: "customer",
    service: "normal",
    collection: "none",
    notes: "<script>test</script>",
    sender: { ...domain.user("MER-DEMO") },
    recipient: {
      name: "اختبار",
      phone: "07700000003",
      province: "بغداد",
      area: "الكرادة",
      address: "عنوان",
    },
  };
  for (let step = 0; step < 4; step++) {
    const { html } = await renderPage(
      "OrderWizard",
      (a) => (a.state.wizard = { step, data }),
    );
    assert.match(html, /order-form/);
    if (step === 0) assert.match(html, /name="amount"/);
    if (step === 2) assert.match(html, /name="phone"/);
    if (step === 3) {
      assert.match(html, /حفظ دون نشر/);
      assert.match(html, /&lt;script&gt;/);
    }
  }
});
test("free order forms use profile sender, address book and recipient wording without goods value", async () => {
  const { createDemoData } = await import("./src/services/demoData.js");
  const { merchantSender } = await import("./src/services/addressBook.js");
  const sample = createDemoData();
  const user = sample.users.find((user) => user.id === "FREE-DEMO");
  const data = {
    ...sample.orders.find((order) => order.merchant === user.id),
    sender: merchantSender(user),
  };
  for (let step = 0; step < 4; step++) {
    const { html } = await renderPage("OrderWizard", (app) => {
      app.state.S.user = user;
      app.state.wizard = { step, data };
    });
    assert.doesNotMatch(
      html,
      /name="amount"|قيمة البضاعة|اسم النشاط|اسم التاجر/,
    );
    if (step === 1) {
      assert.match(html, /الاسم/);
      assert.match(html, /مصطفى سعد كريم/);
      assert.match(html, /name="pickupAddress"/);
      assert.match(html, /name="senderAddressName"/);
      assert.match(html, /name="latitude"/);
      assert.doesNotMatch(html, /name="photo"|name="senderName"/);
    }
    if (step === 2) {
      assert.match(html, /اسم المستلم/);
      assert.doesNotMatch(html, /اسم الزبون/);
    }
    if (step === 3) {
      assert.match(html, /النشر يجعل الطلب متاحاً للمندوبين المتاحين/);
      assert.doesNotMatch(html, /المنظومة المحلية/);
    }
  }
});

test("saved pickup and recipient choices fill editable locations and preserve notes", async () => {
  const address = {
    id: "ADR-TEST",
    area: "المنصور",
    address: "مخزن",
    location: { lat: 33.32, lng: 44.35 },
  };
  const recipient = {
    name: "والدة أحمد",
    phone: "07912345678",
    area: "زيونة",
    address: "بيت الوالدة",
    location: { lat: 33.33, lng: 44.46 },
  };
  const { app } = await renderPage("OrderWizard", (a) => {
    a.state.S.user.addresses = [address];
    a.state.S.user.customers = [recipient];
    a.state.wizard = {
      step: 1,
      data: { kind: "merchant", sender: { ...a.state.S.user }, recipient: {} },
    };
  });
  const form = {
    id: "order-form",
    elements: {
      phone: { value: recipient.phone },
      notes: { value: "لا تضيع الملاحظات" },
    },
  };
  const select = async (name, value) =>
    app.dispatch("change", {
      target: { name, value, form, matches: () => false },
    });
  await select("pickupAddress", address.id);
  assert.deepEqual(app.state.wizard.data.sender.location, address.location);
  assert.equal(app.state.wizard.data.sender.name, app.state.S.user.name);
  assert.equal(app.state.wizard.data.sender.phone, app.state.S.user.phone);
  assert.equal(app.state.wizard.data.sender.addressId, address.id);
  await select("pickupAddress", "new");
  assert.equal(app.state.wizard.data.sender.location, null);
  app.state.wizard.step = 2;
  await select("name", recipient.name);
  assert.deepEqual(app.state.wizard.data.recipient, recipient);
  assert.equal(app.state.wizard.data.notes, "لا تضيع الملاحظات");
  await select("name", "مستلم جديد");
  assert.equal(app.state.wizard.data.recipient.phone, recipient.phone);
  assert.deepEqual(
    app.state.wizard.data.recipient.location,
    recipient.location,
  );
  app.state.S.user.customers.push({ ...recipient, address: "عنوان آخر" });
  app.state.wizard.data.recipient = {};
  await select("name", recipient.name);
  assert.deepEqual(app.state.wizard.data.recipient, {});
});

test("free registration combines personal details and address before verification", async () => {
  const registration = {
    step: 0,
    role: "free",
    province: "بغداد",
    location: null,
  };
  const { html, app } = await renderPage("MerchantRegistration", (a) => {
    a.state.registration = registration;
  });
  const fields = [
    "name",
    "phone",
    "password",
    "province",
    "area",
    "address",
    "latitude",
    "longitude",
  ];
  let previous = -1;
  for (const field of fields) {
    const position = html.indexOf(`name="${field}"`);
    assert.ok(position > previous, `${field} must follow the previous field`);
    previous = position;
  }
  assert.match(html, /إنشاء حساب توصيل حر/);
  assert.match(html, /تحديد موقعي الحالي/);
  assert.match(html, /location-validation/);
  assert.doesNotMatch(
    html,
    /wizard-steps|name="(?:addressName|businessName|activity|inside|outside|verificationCode)"/,
  );

  const verification = await renderPage("MerchantRegistration", (a) => {
    a.state.registration = { ...registration, step: 4, phone: "07912345678" };
  });
  assert.match(verification.html, /name="verificationCode"/);
  assert.doesNotMatch(verification.html, /name="password"|wizard-steps/);
  app.state.registration.step = 4;
  await app.dispatch("click", {
    target: { closest: () => ({ dataset: { action: "register-back" } }) },
  });
  assert.equal(app.state.registration.step, 0);
});

test("registration separates identity and business, simplifies location and includes verification", async () => {
  for (let step = 0; step < 5; step++) {
    const { html } = await renderPage(
      "MerchantRegistration",
      (a) =>
        (a.state.registration = {
          step,
          role: "merchant",
          name: "اختبار",
          province: "بغداد",
          photos: [],
          location: { lat: 33, lng: 44 },
        }),
    );
    assert.match(html, /register-form/);
    if (step === 0) {
      assert.match(html, /الاسم الثلاثي/);
      assert.doesNotMatch(html, /الاسم \/ اسم النشاط/);
    }
    if (step === 1) {
      assert.ok(
        html.indexOf('name="businessName"') < html.indexOf('name="activity"'),
      );
      assert.match(html, /اسم النشاط التجاري/);
    }
    if (step === 2) {
      assert.doesNotMatch(html, /فتح الخريطة|مشاركة الموقع|اسحب العلامة/);
      assert.match(html, /تحديد موقعي الحالي/);
    }
    if (step === 3) {
      assert.match(html, /سيصبح الحساب جاهزا بعد ادخال كود التحقق/);
      assert.doesNotMatch(html, /SMS|النسخة المحلية/);
    }
    if (step === 4) {
      assert.match(html, /name="verificationCode"/);
      assert.match(html, /autocomplete="one-time-code"/);
      assert.match(html, /تحقق وادخل/);
      assert.doesNotMatch(html, /wizard-steps/);
    }
  }
  const { html } = await renderPage(
    "CourierRegistration",
    (a) =>
      (a.state.registration = {
        role: "courier",
        vehicle: "sedan",
        province: "بغداد",
        documents: {},
        location: { lat: 33, lng: 44 },
      }),
  );
  assert.equal((html.match(/data-document-upload=/g) || []).length, 5);
  assert.match(html, /confirmPassword/);
  assert.match(html, /data-field="confirmPassword"/);
});
test("built PWA caches only public files and supports offline role routes", async () => {
  const source = fs.readFileSync("dist/sw.js", "utf8"),
    handlers = {},
    entries = new Map();
  let precache = [];
  const cache = {
    addAll: async (list) => {
      precache = list;
      for (const url of list) {
        const file = new URL(url).pathname.slice(1) || "index.html";
        assert.ok(fs.existsSync(path.join("dist", file)), file);
        entries.set(url, new Response(file));
      }
    },
    match: async (key) => entries.get(key.url || key),
    put: async (key, value) => entries.set(key.url || key, value),
  };
  const context = {
    URL,
    Response,
    fetch: async () => {
      throw Error("offline");
    },
    caches: { open: async () => cache },
    self: {
      location: { href: "https://wasel.test/sw.js" },
      skipWaiting: async () => {},
      addEventListener: (name, fn) => (handlers[name] = fn),
    },
  };
  vm.runInNewContext(source, context);
  let ready;
  handlers.install({ waitUntil: (p) => (ready = p) });
  await ready;
  assert.ok(precache.length > 5);
  assert.ok(precache.every((u) => !u.includes("/api/") && !u.includes(".cjs")));
  let response;
  handlers.fetch({
    request: {
      url: "https://wasel.test/merchant/",
      method: "GET",
      mode: "navigate",
    },
    respondWith: (p) => (response = p),
  });
  assert.equal(await (await response).text(), "index.html");
  response = undefined;
  handlers.fetch({
    request: {
      url: "https://wasel.test/courier/",
      method: "GET",
      mode: "navigate",
    },
    respondWith: (p) => (response = p),
  });
  assert.equal(
    response,
    undefined,
    "parent worker must not serve the courier application",
  );
  assert.ok(precache.every((url) => !url.includes("/courier/")));
  response = undefined;
  handlers.fetch({
    request: { url: "https://wasel.test/api/state", method: "GET" },
    respondWith: (p) => (response = p),
  });
  assert.equal(response, undefined);
  context.fetch = async () => new Response("latest");
  handlers.fetch({
    request: { url: "https://wasel.test/index.html", method: "GET" },
    respondWith: (p) => (response = p),
  });
  assert.equal(await (await response).text(), "latest");
});

test("wallet ledger keeps rows inside tbody and escapes merchant names", async () => {
  const { html } = await renderPage("WalletView", (app) => {
    app.state.S = {
      ...app.state.S,
      ledger: [
        {
          reason: "<img src=x>",
          amount: 10,
          orderId: "T",
          at: new Date().toISOString(),
        },
      ],
    };
  });
  assert.match(
    html.replace(/<!--[\s\S]*?-->/g, ""),
    /<tbody><tr[^>]*><td>&lt;img src=x&gt;<\/td>/,
  );
  assert.match(html, /orbit-motion/);
  assert.match(html, /orbit-shimmer/);
});
test("all order action forms render with their validation fields", async () => {
  const { renderToString } = await import("vue/server-renderer");
  const { h } = await import("vue");
  const { app } = await renderPage("HomeView");
  const order = app.state.S.orders[0];
  assert.ok(order);
  const ops = {
    publish: null,
    unpublish: null,
    delete: null,
    cancel: null,
    reserve: null,
    depart: null,
    extend: null,
    arrive: null,
    wait: null,
    transit: null,
    customer_arrive: null,
    approve_retry: null,
    return: null,
    return_start: null,
    return_arrive: null,
    partial_approve: null,
    raise_fee: "fee",
    offer: "fee",
    exclude_pickup: "reason",
    resolve_exclusion: "resolution",
    release: "reason",
    fail: "reason",
    pickup: "code",
    deliver: "proof",
    retry: "when",
    receive_return: "inspected",
    settle_return: "fees",
    settle_delivery: "confirmed",
    partial_propose: "returnAmount",
    defer: "when",
    partial_confirm: "confirmed",
    rate: "stars",
    accept_offer: null,
    chat: "text",
  };
  for (const [op, field] of Object.entries(ops)) {
    const button = {
      dataset: { action: "order-action", id: order.id, op },
      disabled: false,
    };
    await app.dispatch("click", { target: { closest: () => button } });
    const html = await renderToString(h("div", app.ui.dialogContent));
    assert.match(html, /action-form/, op);
    assert.ok(!html.includes("[object Object]"), op);
    if (field)
      assert.ok(html.includes('name="' + field + '"'), op + " " + field);
  }
});

test("registry progressively renders twenty cards including selectable draft and published filters", async () => {
  const { createDemoData } = await import("./src/services/demoData.js");
  for (const status of ["all", "draft", "published", "transit"]) {
    const { html } = await renderPage("OrdersView", (app) => {
      const data = createDemoData();
      app.state.S.orders = data.orders;
      app.state.screen = "registry";
      app.state.filter = status;
    });
    assert.equal((html.match(/<article/g) || []).length, 20);
    assert.match(html, /إظهار الكل/);
    assert.doesNotMatch(html, /id="registry-show-all"/);
    if (["draft", "published"].includes(status)) {
      assert.equal(
        (html.match(/class="order-card-selection"/g) || []).length,
        20,
      );
      assert.match(html, /<article[^>]*><label class="order-card-selection"/);
    } else assert.doesNotMatch(html, /class="order-card-selection"/);
  }
});

test("offline publishing keeps the form in memory and creates no device draft", async () => {
  const { app } = await renderPage("AccountView");
  const key = "wasel-offline-" + app.state.S.user.id;
  storage.delete(key);
  app.state.offline = true;
  app.state.wizard = {
    data: { recipient: { name: "Offline recipient" }, kind: "merchant" },
  };
  const button = {
    dataset: { action: "save-order", publish: "true" },
    disabled: false,
  };
  await app.dispatch("click", { target: { closest: () => button } });
  assert.equal(localStorage.getItem(key), null);
  assert.equal(app.state.wizard.data.recipient.name, "Offline recipient");
  assert.match(app.ui.toast, /اتصل بالإنترنت/);
});
