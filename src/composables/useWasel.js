import { addressLocation } from "../services/coordinates.js";
import { provinces } from "../services/geography.js";
import { merchantSender, pickupAddress } from "../services/addressBook.js";
import ViewHost from "../components/ViewHost.vue";
import { provide } from "vue";
import { viewStateKey } from "./useViewState.js";
import { createView } from "../services/viewContent.js";
import MaterialIcon from "../views/shell/MaterialIcon.vue";
import AppNavigation from "../views/shell/AppNavigation.vue";
import WalletNumberDialog from "../views/shell/WalletNumberDialog.vue";
import PasswordChangeDialog from "../views/shell/PasswordChangeDialog.vue";
import NotificationsDialog from "../views/shell/NotificationsDialog.vue";
import {
  accountType,
  accountNames,
  currentApplication,
  workflowRole,
} from "../services/accounts.js";
import InstallInstructions from "../views/shell/InstallInstructions.vue";
import SplashArtView from "../views/shell/SplashArt.vue";
import {
  recommendVehicle,
  vehicleFits,
  nearestArea,
} from "../services/orderPolicy.js";
import { api as frontendApi } from "../services/api.js";
import { parseRoute, routeHash } from "../services/routes.js";
import { termsConsent } from "../services/termsConsent.js";
import { createCameraViews } from "../views/camera/views.js";
import { createAccountViews } from "../views/account/views.js";
import { createOrdersViews } from "../views/orders/views.js";
import { createAuthViews } from "../views/auth/views.js";
import { createUiViews } from "../views/ui/views.js";
import {
  shallowReactive,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import {
  clone,
  phoneDigits,
  phoneError,
  PHONE_FIELDS,
} from "../services/formFields.js";
export function useWasel(application = currentApplication()) {
  function viewContext() {
    return {
      input,
      money,
      date,
      roleNames,
      application,
      state,
      refresh,
      courierView,
      select,
      vehicleNames,
      provinces,
      courierDocs,
      before,
      closed,
      statusPicker,
      orderList,
      baseOrders,
      modal,
      natureNames,
      customerDue,
      maps,
      availableActions,
      startOrder,
      mapPlot,
      ledger,
      cameraDialog,
      documentCapture,
      ui,
      nextTick,
      gatherCourier,
    };
  }
  const {
    button,
    input,
    select,
    row,
    stepper,
    coords,
    maps,
    metric,
    ledger,
    navIcon,
    splashBike,
    splashScenery,
    routeLines,
  } = createUiViews(viewContext);
  const { authView, merchantRegistrationView, courierView } =
    createAuthViews(viewContext);
  const {
    homeView,
    statusPicker,
    baseOrders,
    ordersView,
    orderList,
    availableActions,
    orderDetail,
    orderWizard,
    orderActionForm,
    mapPlot,
    localMap,
  } = createOrdersViews(viewContext);
  const { accountView, walletView, readiness, profileForm } =
    createAccountViews(viewContext);
  const { drawDocumentCamera, reviewCourierRegistration } =
    createCameraViews(viewContext);
  const cleanups = [];
  const handlers = {
    click: [],
    submit: [],
    change: [],
    input: [],
    keydown: [],
  };
  const onEvent = (event, fn) => handlers[event].push(fn);
  const listen = (target, event, fn, options) => {
    onMounted(() => target.addEventListener(event, fn, options));
    cleanups.push(() => target.removeEventListener(event, fn, options));
  };
  const state = shallowReactive({
    S: null,
    screen: "home",
    filter: "all",
    homePage: 1,
    registryPage: 1,
    registrySize: "10",
    query: "",
    wizard: null,
    registration: null,
    offline: false,
    trackingId: null,
    authRole: application.defaultAccount,
    authIntent: "login",
  });
  const ui = shallowReactive({
    page: "AuthView",
    auth: true,
    authError: "",
    formError: "",
    revision: 0,
    formRevision: 0,
    dialogTitle: "",
    dialogContent: null,
    cameraContent: null,
    cameraError: "",
    cameraReady: false,
    toast: "",
    splash: false,
    installed: false,
    installVisible: false,
    passwordVisible: false,
    loginPassword: "",
    loginPhone: "",
  });
  function loginPage(error = "") {
    writeRoute(state.authRole, state.authIntent);
    ui.passwordVisible = false;
    ui.loginPassword = "";
    ui.loginPhone = "";
    ui.auth = true;
    ui.page = "AuthView";
    ui.authError = error;
    ui.formError = error;
    ui.revision++;
    window.scrollTo(0, 0);
  }
  function registrationView() {
    writeRoute(state.registration.role, "register");
    ui.formError = "";
    ui.auth = state.registration.role === "courier";
    ui.page =
      state.registration.role === "courier"
        ? "CourierRegistration"
        : "MerchantRegistration";
    ui.formRevision++;
    ui.revision++;
  }
  function beginRegistration(role) {
    state.authRole = role;
    state.authIntent = "register";
    state.registration = {
      step: 0,
      role,
      province: "بغداد",
      ...(role === "free"
        ? { location: null }
        : {
            activity: "shop",
            vehicle: "sedan",
            photos: [],
            documents: {},
            location: { lat: 33.3, lng: 44.43 },
          }),
    };
    registrationView();
  }
  function registerAccount(registration, verificationCode) {
    return api("/api/register", {
      ...registration,
      verificationCode,
      termsAcceptance: termsConsent.read(application.id),
    });
  }
  function courierRegistrationView() {
    writeRoute("courier", "register");
    ui.auth = true;
    ui.page = "CourierRegistration";
    ui.revision++;
  }
  ("use strict");
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const money = (n) => new Intl.NumberFormat("en-US").format(n || 0),
    date = (x) =>
      x
        ? new Date(x).toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "";
  const icon = (n) =>
    createView(MaterialIcon, {
      model: {
        n,
      },
    });
  const roleNames = accountNames;
  const vehicleNames = {
    motorcycle: "دراجة نارية",
    sedan: "سيارة صالون",
    truck: "سيارة حمل",
    refrigerated: "سيارة مبردة",
  };
  const natureNames = {
    normal: "عادية",
    fragile: "قابلة للكسر",
    food: "طعام",
    cold: "تحتاج إلى تبريد",
  };
  const before = [
      "draft",
      "published",
      "reserved",
      "approaching",
      "arrived",
      "waiting",
    ],
    closed = ["delivered", "returned", "cancelled", "completed"];

  let installPrompt = null,
    toastTimer;
  let lastLocationSent = 0;
  function toast(text) {
    ui.toast = text;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (ui.toast = ""), 5000);
  }
  async function api(url, data) {
    return frontendApi(url, data);
  }
  function modal(title, content) {
    ui.formError = "";
    ui.dialogTitle = title;
    ui.dialogContent = content;
    nextTick(() => $("#app-dialog")?.showModal());
  }
  function closeModal() {
    $("#app-dialog")?.close();
    ui.dialogContent = null;
  }
  function customerDue(o) {
    return (
      (o.kind === "free" ? 0 : o.amount) +
      (o.feePayer === "customer" ? o.fee : 0)
    );
  }
  async function refresh(draw = true) {
    try {
      state.S = await api("/api/state");
      state.offline = navigator.onLine === false;
      if (draw) render();
    } catch (error) {
      if (error.status === 401) {
        state.S = null;
        loginPage();
      } else toast(error.message);
    }
  }
  const splashKey = "wasel-splash-shown-" + application.id;
  function splashSeen() {
    try {
      return sessionStorage.getItem(splashKey) === "1";
    } catch {
      return false;
    }
  }
  function rememberSplash() {
    try {
      sessionStorage.setItem(splashKey, "1");
    } catch {}
  }
  function reducedMotion() {
    try {
      return matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }
  function showWelcomeSplash() {
    // A refresh, a back-navigation or a re-entry must neither replay the
    // greeting nor trap the visitor behind it.
    if (splashSeen()) return Promise.resolve();
    rememberSplash();
    ui.auth = true;
    ui.splash = true;
    return new Promise((resolve) => {
      const started = Date.now();
      let settled = false;
      let timer;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", dismissEarly);
        document.removeEventListener("pointerdown", dismissEarly);
        ui.splash = false;
        resolve();
      };
      // A tab restored from the background can drop pending timers, and a
      // visitor must always be able to step past the greeting — so coming
      // back to the page or tapping once closes it as well.
      const dismissEarly = () => {
        if (
          document.visibilityState === "visible" &&
          Date.now() - started >= 1000
        )
          finish();
      };
      timer = setTimeout(finish, reducedMotion() ? 700 : 3000);
      document.addEventListener("visibilitychange", dismissEarly);
      document.addEventListener("pointerdown", dismissEarly);
      cleanups.push(() => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", dismissEarly);
        document.removeEventListener("pointerdown", dismissEarly);
        finish();
      });
    });
  }
  async function login(role, phone, password) {
    await api("/api/login", {
      role,
      phone,
      password,
    });
    state.screen = "home";
    state.filter = "all";
    state.homePage = 1;
    state.registryPage = 1;
    ui.loginPassword = "";
    ui.loginPhone = "";
    await refresh();
  }
  function nav() {
    const r = state.S.user.role;
    const list =
      r === "merchant"
        ? [
            ["home", "الرئيسية"],
            ["registry", "طلباتي"],
            ["new", "طلب جديد"],
            ["wallet", "المحفظة"],
            ["account", "حسابي"],
          ]
        : [
            ["home", "الرئيسية"],
            ["available", "المتاح"],
            ["registry", "طلباتي"],
            ["wallet", "المحفظة"],
            ["account", "حسابي"],
          ];
    return createView(AppNavigation, {
      model: {
        list,
        state,
      },
    });
  }
  function render() {
    ui.formError = "";
    if (!state.S) return loginPage();
    writeRoute(accountType(state.S.user), state.screen);
    ui.auth = false;
    ui.page =
      {
        home: "HomeView",
        registry: "OrdersView",
        available: "OrdersView",
        wallet: "WalletView",
        account: "AccountView",
        new: "OrderWizard",
      }[state.screen] || "HomeView";
    ui.revision++;
  }
  function startOrder(kind = "merchant", old = null) {
    if (accountType(state.S.user) === "free") kind = "free";
    state.wizard = {
      step: 0,
      id: old?.id,
      data: old
        ? clone(old)
        : {
            kind,
            amount: 0,
            count: 1,
            weight: 1,
            length: 20,
            width: 20,
            height: 20,
            nature: "normal",
            vehicle: "motorcycle",
            baseFee: 5000,
            fee: 5000,
            returnFee: 0,
            feePayer: "customer",
            service: "normal",
            collection: "none",
            notes: "",
            sender: merchantSender(state.S.user),
            recipient: {
              province: state.S.user.province,
              name: "",
              phone: "",
              phone2: "",
              area: "",
              address: "",
              landmark: "",
            },
          },
    };
    state.screen = "new";
    closeModal();
    render();
    window.scrollTo(0, 0);
  }
  function gatherOrder(form) {
    const f = Object.fromEntries(new FormData(form)),
      d = state.wizard.data;
    if (state.wizard.step === 0) {
      for (const key of [
        "amount",
        "count",
        "weight",
        "length",
        "width",
        "height",
        "baseFee",
        "returnFee",
      ])
        d[key] = Number(f[key]);
      for (const key of ["nature", "service", "feePayer"]) d[key] = f[key];
      d.vehicles = new FormData(form).getAll("vehicles");
      if (!d.vehicles.length) throw Error("اختر وسيلة نقل واحدة على الأقل");
      if (d.vehicles.length > 2) throw Error("اختر وسيلتي نقل كحد أقصى");
      if (!d.vehicles.every((v) => vehicleFits(v, d, state.S.settings)))
        throw Error("اختر وسائل نقل تناسب طبيعة الشحنة ووزنها وأبعادها");
      d.vehicle = d.vehicles[0];
      d.collection = f.collection || d.collection;
      if (!f.hasReturn) d.returnFee = 0;
      d.fee =
        d.baseFee + (d.service === "vip" ? state.S.settings.vipSurcharge : 0);
      if (d.kind === "free") {
        d.amount = 0;
        d.collection = "none";
      }
      if (d.returnFee > d.fee)
        throw Error("أجرة الراجع لا تتجاوز أجرة التوصيل");
      if (d.nature === "cold" && d.vehicle !== "refrigerated")
        throw Error("الشحنة المبردة تحتاج سيارة مبردة");
    } else if (state.wizard.step === 1) {
      d.sender = {
        name: state.S.user.name,
        phone: state.S.user.phone,
        province:
          f.senderProvince || d.sender.province || state.S.user.province,
        addressId: d.sender.addressId || "",
        addressName: f.senderAddressName,
        phone2: f.senderPhone2 || "",
        ...(d.kind === "free"
          ? {}
          : { businessName: state.S.user.businessName }),
        area: f.senderArea,
        address: f.senderAddress,
        location: {
          lat: Number(f.lat),
          lng: Number(f.lng),
        },
      };
      pickupAddress(state.S.user, d.sender);
    } else if (state.wizard.step === 2) {
      const point = addressLocation(f.latitude ?? f.lat, f.longitude ?? f.lng);
      if ((f.latitude || f.longitude || f.lat || f.lng) && !point)
        throw Error("أدخل خط عرض بين ‎-90 و90 وخط طول بين ‎-180 و180.");
      d.recipient = {
        name: f.name,
        phone: f.phone,
        phone2: f.phone2,
        province: f.province || state.S.user.province,
        area: f.area,
        address: d.recipient?.address || "",
        landmark: f.landmark,
        location: point,
      };
      d.notes = f.notes;
      d.saveCustomer = true;
      d.recipient.area = f.area === "other" ? f.otherArea : f.area;
    }
  }
  async function imageData(file) {
    if (!file) return null;
    if (!file.type.startsWith("image/")) throw Error("اختر ملف صورة");
    if (file.size > 15000000) throw Error("حجم الصورة كبير");
    return new Promise((resolve, reject) => {
      const image = new Image(),
        url = URL.createObjectURL(file);
      image.onload = () => {
        const ratio = Math.min(1, 900 / Math.max(image.width, image.height));
        const c = document.createElement("canvas");
        c.width = image.width * ratio;
        c.height = image.height * ratio;
        c.getContext("2d").drawImage(image, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.75));
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(Error("تعذرت قراءة الصورة"));
      };
      image.src = url;
    });
  }
  async function runAction(id, action, data = {}) {
    await api(`/api/orders/${encodeURIComponent(id)}/action`, {
      action,
      ...data,
    });
    await refresh();
    if (action === "delete") closeModal();
    else if (action === "chat")
      orderActionForm(
        state.S.orders.find((o) => o.id === id),
        "chat",
      );
    else orderDetail(id);
    toast("تم تسجيل الإجراء");
  }
  onEvent("click", async (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const a = b.dataset.action;
    try {
      if (a === "logout") {
        if (state.trackingId !== null) {
          navigator.geolocation.clearWatch(state.trackingId);
          state.trackingId = null;
        }
        await api("/api/logout", {});
        state.S = null;
        state.authRole = application.defaultAccount;
        state.authIntent = "login";
        closeModal();
        loginPage();
      } else if (a === "login-page") {
        state.registration = null;
        state.authIntent = "login";
        loginPage();
      } else if (a === "choose-role") {
        if (!application.accounts.includes(b.dataset.role)) return;
        state.authRole = b.dataset.role;
        if (state.authIntent === "register") beginRegistration(state.authRole);
        else loginPage();
      } else if (a === "choose-again") {
        state.authRole = application.defaultAccount;
        loginPage();
      } else if (a === "nav") {
        if (b.dataset.screen === "new") startOrder();
        else {
          state.screen = b.dataset.screen;
          state.wizard = null;
          state.filter = "all";
          state.homePage = 1;
          state.registryPage = 1;
          state.query = "";
          render();
          window.scrollTo(0, 0);
        }
      } else if (a === "refresh") await refresh();
      else if (a === "copy-wallet") {
        try {
          await navigator.clipboard.writeText(state.S.user.walletId);
          toast("تم نسخ رقم المحفظة");
        } catch {
          modal(
            "رقم المحفظة",
            createView(WalletNumberDialog, {
              model: {
                state,
              },
            }),
          );
        }
      } else if (a === "wallet-statement")
        modal("كشف المحفظة", [
          row("الرصيد الحالي", money(state.S.balance) + " د.ع"),
          ledger(state.S.ledger),
        ]);
      else if (a === "toggle-password") {
        const p = document.querySelector("#login-form input[name=password]");
        const visible = p.type === "password";
        // Capture autofilled values as well before Vue patches the input type.
        ui.loginPassword = p.value;
        ui.loginPhone = document.querySelector(
          "#login-form input[name=identifier]",
        ).value;
        ui.passwordVisible = visible;
        b.setAttribute(
          "aria-label",
          visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور",
        );
        b.setAttribute("aria-pressed", String(visible));
      } else if (a === "order") orderDetail(b.dataset.id);
      else if (a === "filter-open") {
        const menu = $("#status-menu");
        if (menu.matches(":popover-open")) menu.hidePopover();
        else {
          menu.showPopover();
          const r = b.getBoundingClientRect(),
            w = Math.min(340, innerWidth - 24),
            above = r.top - 12,
            below = innerHeight - r.bottom - 12;
          menu.style.width = w + "px";
          menu.style.maxHeight = Math.min(450, Math.max(above, below)) + "px";
          menu.style.left =
            Math.max(12, Math.min(r.right - w, innerWidth - w - 12)) + "px";
          menu.style.top =
            (below < 350 && above > below
              ? Math.max(12, r.top - menu.offsetHeight - 8)
              : r.bottom + 8) + "px";
          b.setAttribute("aria-expanded", "true");
          menu.querySelector("[aria-selected=true]").focus({
            preventScroll: true,
          });
          menu.ontoggle = () =>
            b.setAttribute(
              "aria-expanded",
              String(menu.matches(":popover-open")),
            );
        }
      } else if (a === "home-page" || a === "registry-page") {
        state[a === "home-page" ? "homePage" : "registryPage"] = Math.max(
          1,
          Number(b.dataset.page) || 1,
        );
        await nextTick();
        const trigger = $("#status-trigger");
        trigger?.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
        trigger?.focus({
          preventScroll: true,
        });
      } else if (a === "filter") {
        const menu = $("#status-menu");
        if (menu?.matches(":popover-open")) menu.hidePopover();
        state.filter = b.dataset.value;
        state.homePage = 1;
        state.registryPage = 1;
        render();
        $("#status-trigger")?.focus({
          preventScroll: true,
        });
      } else if (a === "wizard-back") {
        state.wizard.step--;
        ui.formRevision++;
        render();
      } else if (a === "save-order") {
        b.disabled = true;
        const data = {
          ...state.wizard.data,
          publish: b.dataset.publish === "true",
        };
        if (state.offline || navigator.onLine === false)
          throw Error(
            "اتصل بالإنترنت لحفظ أو نشر الطلب؛ بياناتك باقية في النموذج",
          );
        if (state.wizard.id)
          await api(`/api/orders/${state.wizard.id}/action`, {
            ...data,
            action: "edit",
          });
        else await api("/api/orders", data);
        state.wizard = null;
        state.screen = "registry";
        await refresh();
        toast(data.publish ? "تم نشر الطلب" : "تم حفظ الطلب");
      } else if (a === "refresh-chat") {
        await refresh(false);
        orderActionForm(
          state.S.orders.find((o) => o.id === b.dataset.id),
          "chat",
        );
      } else if (a === "order-action")
        orderActionForm(
          state.S.orders.find((o) => o.id === b.dataset.id),
          b.dataset.op,
          {
            offer: b.dataset.offer,
          },
        );
      else if (a === "readiness") readiness();
      else if (a === "tracking") {
        if (state.trackingId !== null) {
          navigator.geolocation.clearWatch(state.trackingId);
          state.trackingId = null;
          render();
          toast("توقفت مشاركة الموقع");
        } else {
          if (!navigator.geolocation) throw Error("الموقع غير مدعوم");
          state.trackingId = navigator.geolocation.watchPosition(
            async (pos) => {
              if (Date.now() - lastLocationSent < 15000) return;
              lastLocationSent = Date.now();
              try {
                await api("/api/profile", {
                  action: "location",
                  location: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  },
                });
                await refresh(false);
              } catch (err) {
                toast(err.message);
              }
            },
            () => {
              navigator.geolocation.clearWatch(state.trackingId);
              state.trackingId = null;
              toast("تعذرت مشاركة الموقع؛ راجع إذن المتصفح");
            },
            {
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 20000,
            },
          );
          render();
          toast("المشاركة تعمل أثناء فتح التطبيق فقط");
        }
      } else if (a === "edit-profile") profileForm();
      else if (a === "change-password") {
        modal(
          "تغيير كلمة مرور الحساب",
          createView(PasswordChangeDialog, {
            model: {},
          }),
        );
      } else if (a === "preferences") {
        await api("/api/profile", {
          action: "preferences",
          motivational: state.S.user.motivational === false,
        });
        await refresh();
      } else if (a === "nearby") localMap(true);
      else if (a === "merchant-map") localMap();
      else if (a === "notifications")
        modal(
          "الإشعارات",
          createView(NotificationsDialog, {
            model: {
              state,
              date,
            },
          }),
        );
      else if (a === "gps") {
        if (!navigator.geolocation) throw Error("الموقع غير مدعوم في المتصفح");
        const form = b.closest("form");
        b.disabled = true;
        navigator.geolocation.getCurrentPosition(
          (p) => {
            form.elements.lat.value = p.coords.latitude;
            form.elements.lng.value = p.coords.longitude;
            const area = nearestArea({
              lat: p.coords.latitude,
              lng: p.coords.longitude,
            });
            if (area && form.elements.area) {
              if (
                form.elements.area.tagName === "SELECT" &&
                ![...form.elements.area.options].some((o) => o.value === area)
              ) {
                form.elements.area.value = "other";
                if (form.elements.otherArea)
                  form.elements.otherArea.value = area;
              } else form.elements.area.value = area;
            }
            b.disabled = false;
            toast("تم تحديد الموقع؛ راجع العنوان والمنطقة");
          },
          () => {
            b.disabled = false;
            toast("تعذر تحديد الموقع؛ اختره بالضغط على الخريطة");
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
          },
        );
      } else if (a === "register") {
        beginRegistration(
          state.authRole || application.defaultAccount || "merchant",
        );
      } else if (a === "register-back") {
        state.registration.step =
          state.registration.role === "free" ? 0 : state.registration.step - 1;
        registrationView();
      } else if (a === "install") {
        await requestAppInstall(b);
      }
    } catch (err) {
      toast(err.message);
      b.disabled = false;
    }
  });
  onEvent("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const f = Object.fromEntries(new FormData(form));
    const error = form.querySelector(".inline-error");
    ui.formError = "";
    const submit = form.querySelector("button[type=submit],button:not([type])");
    if (submit) submit.disabled = true;
    try {
      // Every phone field must hold eleven English digits once the user submits.
      for (const phoneField of form.elements)
        if (PHONE_FIELDS.has(phoneField.name)) {
          const problem = phoneError(phoneField.value);
          if (problem) throw Error(problem);
        }
      if (form.id === "login-form") {
        const identifier = f.identifier.trim();
        if (identifier !== "iraq") {
          const problem = phoneError(identifier);
          if (problem) throw Error(problem);
        }
        await login(
          f.role,
          identifier === "iraq" ? identifier : phoneDigits(identifier),
          f.password,
        );
      } else if (form.id === "password-change-form") {
        if (f.newPassword.length < 8)
          throw Error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        if (f.newPassword !== f.confirmPassword)
          throw Error("كلمتا المرور غير متطابقتين");
        form.reset();
        closeModal();
        toast("كلمة المرور صالحة. الحفظ الفعلي متاح بعد ربط الخادم.");
      } else if (form.id === "courier-register-form")
        reviewCourierRegistration();
      else if (form.id === "order-form") {
        gatherOrder(form);
        state.wizard.step++;
        ui.formRevision++;
        render();
        window.scrollTo(0, 0);
      } else if (form.id === "register-form") {
        const r = state.registration;
        if (r.role === "free" && r.step === 0) {
          const location = addressLocation(f.latitude, f.longitude);
          if (!location)
            throw Error("حدد الموقع على الخارطة أو أدخل إحداثيات صحيحة");
          for (const key of [
            "name",
            "phone",
            "password",
            "province",
            "area",
            "address",
          ])
            r[key] = key === "password" ? f[key] : f[key]?.trim();
          r.location = location;
        } else if (r.role !== "free")
          Object.assign(
            r,
            Object.fromEntries(
              Object.entries(f).filter(
                ([k, v]) => typeof v === "string" && k !== "verificationCode",
              ),
            ),
          );
        if (r.step === 1) {
          r.businessName = r.businessName?.trim();
          if (!r.businessName) throw Error("أدخل اسم النشاط التجاري");
        }
        if (
          r.step === 1 &&
          workflowRole(r.role) === "merchant" &&
          r.activity === "ecommerce"
        )
          throw Error("تسجيل التجارة الإلكترونية معطل حالياً؛ سيتاح لاحقاً");
        if (r.step === 2) {
          r.location = {
            lat: Number(f.lat),
            lng: Number(f.lng),
          };
          r.photos = [];
          for (const k of ["inside", "outside"])
            if (form.elements[k]?.files[0])
              r.photos.push(await imageData(form.elements[k].files[0]));
        }
        if (r.step === 4) {
          await registerAccount(r, f.verificationCode);
          await login(r.role, r.phone, r.password);
          toast("تم إنشاء الحساب");
          state.registration = null;
        } else {
          r.step = r.role === "free" ? 4 : r.step + 1;
          registrationView();
        }
      } else if (form.id === "action-form") {
        for (const name of ["confirmed", "inspected", "paid"])
          if (form.elements[name]) f[name] = form.elements[name].checked;
        if (f.reasonDetails) f.reason += " — " + f.reasonDetails;
        if (["retry", "defer"].includes(form.dataset.op))
          f.when = new Date(f.when).toISOString();
        if (form.dataset.op === "arrive") {
          if (!navigator.geolocation)
            throw Error("المتصفح لا يدعم تحديد الموقع");
          const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(
              resolve,
              () =>
                reject(
                  Error("تعذر تحديد موقعك؛ اسمح بالوصول للموقع وأعد المحاولة"),
                ),
              {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 15000,
              },
            ),
          );
          f.location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          f.accuracy = position.coords.accuracy;
        }
        await runAction(form.dataset.id, form.dataset.op, {
          ...f,
          offer: form.dataset.offer,
        });
      } else if (form.id === "readiness-form") {
        await api("/api/profile", {
          ...f,
          action: "readiness",
          available: form.elements.available.checked,
          location: {
            lat: Number(f.lat),
            lng: Number(f.lng),
          },
        });
        closeModal();
        await refresh();
      } else if (form.id === "account-location-form") {
        if (!f.lat || !f.lng) throw Error("حدد الموقع على الخريطة أولاً.");
        await api("/api/profile", {
          action: "location",
          location: {
            lat: Number(f.lat),
            lng: Number(f.lng),
          },
        });
        closeModal();
        await refresh();
        toast("تم حفظ موقع الحساب");
      } else if (form.id === "profile-form") {
        await api("/api/profile", {
          ...f,
          action: "profile",
          location: {
            lat: Number(f.lat),
            lng: Number(f.lng),
          },
        });
        closeModal();
        await refresh();
      }
    } catch (err) {
      if (error) ui.formError = err.message;
      else toast(err.message);
    } finally {
      if (submit) submit.disabled = false;
    }
  });
  onEvent("change", (e) => {
    if (e.target.id === "registry-show-all") {
      state.registrySize = e.target.checked ? "all" : "10";
      state.registryPage = 1;
    }
    const f = e.target.form;
    if (f?.id === "order-form" && e.target.name === "area") {
      const other = f.querySelector(".other-area-field");
      if (other) other.hidden = e.target.value !== "other";
    }
    if (
      f?.id === "order-form" &&
      state.wizard?.step === 0 &&
      ["nature", "weight", "length", "width", "height"].includes(e.target.name)
    ) {
      const d = Object.fromEntries(new FormData(f));
      const choices = [...f.querySelectorAll('input[name="vehicles"]')];
      for (const choice of choices) {
        choice.disabled = !vehicleFits(choice.value, d, state.S.settings);
        if (choice.disabled) choice.checked = false;
      }
      if (!choices.some((c) => c.checked)) {
        const suggested = choices.find(
          (c) =>
            c.value === recommendVehicle(d, state.S.settings) && !c.disabled,
        );
        if (suggested) suggested.checked = true;
      }
      const summary = f.querySelector("#vehicle-selection");
      if (summary)
        summary.textContent =
          choices
            .filter((c) => c.checked)
            .map((c) => vehicleNames[c.value])
            .join(" أو ") || "اختر المركبة";
    }
    if (f?.id === "order-form" && e.target.name === "vehicles") {
      const choices = [...f.querySelectorAll('input[name="vehicles"]')];
      if (choices.filter((c) => c.checked).length > 2) {
        e.target.checked = false;
        toast("تگدر تختار وسيلتين كحد أقصى");
      }
      const summary = f.querySelector("#vehicle-selection");
      if (summary)
        summary.textContent =
          choices
            .filter((c) => c.checked)
            .map((c) => vehicleNames[c.value])
            .join(" أو ") || "اختر المركبة";
    }
    if (
      f?.id === "order-form" &&
      state.wizard?.step === 2 &&
      e.target.name === "phone"
    ) {
      const matches = (state.S.user.customers || []).filter(
        (c) => c.phone === e.target.value,
      );
      for (const [id, key] of [["recipient-names", "name"]]) {
        const list = document.getElementById(id);
        if (list)
          list.replaceChildren(
            ...matches.map((c) =>
              Object.assign(document.createElement("option"), {
                value: c[key],
              }),
            ),
          );
      }
    }
    if (f?.id === "order-form" && e.target.name === "pickupAddress") {
      const address = state.S.user.addresses?.find(
        (a) => a.id === e.target.value,
      );
      const backupPhone =
        f.elements.senderPhone2?.value ?? state.wizard.data.sender.phone2;
      state.wizard.data.sender = merchantSender(
        state.S.user,
        e.target.value === "new" ? { province: "" } : address,
      );
      state.wizard.data.sender.phone2 = backupPhone;
      state.wizard.data.pickupChoice = e.target.value;
      ui.formRevision++;
      render();
    }
    if (
      f?.id === "order-form" &&
      state.wizard?.step === 2 &&
      e.target.name === "name"
    ) {
      const matches = (state.S.user.customers || []).filter(
        (c) => c.phone === f.elements.phone.value && c.name === e.target.value,
      );
      if (matches.length !== 1) return;
      state.wizard.data.notes = f.elements.notes?.value || "";
      state.wizard.data.recipient = clone(matches[0]);
      ui.formRevision++;
      render();
    }
  });
  let searchTimer;
  onEvent("input", (e) => {
    const field = e.target;
    // Phone fields accept English digits only and never exceed eleven characters.
    if (PHONE_FIELDS.has(field.name) && typeof field.value === "string") {
      const clean = phoneDigits(field.value);
      if (clean !== field.value) {
        const at = field.selectionStart ?? clean.length;
        field.value = clean;
        const next = Math.min(at, clean.length);
        try {
          field.setSelectionRange(next, next);
        } catch {
          /* Some input types expose no caret; overwriting the value is enough. */
        }
      }
    }
    if (
      field.name === "phone" &&
      field.form?.id === "order-form" &&
      state.wizard?.step === 2
    ) {
      for (const handler of handlers.change || []) handler(e);
    }
    if (
      field.name === "returnAmount" &&
      field.form?.dataset.op === "partial_propose"
    ) {
      const preview = document.getElementById("partial-return-preview");
      const total = Number(preview?.dataset.total),
        returned = Number(field.value);
      if (preview)
        preview.textContent =
          returned > 0 && returned < total
            ? "قيمة الجزء المسلَّم: " +
              money(total - returned) +
              " د.ع — قيمة المرتجع: " +
              money(returned) +
              " د.ع. الأجور منفصلة."
            : "أدخل قيمة مرتجع أقل من قيمة البضاعة الكلية.";
    }
    if (field.id === "order-search") {
      const pos = e.target.selectionStart;
      state.query = e.target.value;
      state.registryPage = 1;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        render();
        const input = $("#order-search");
        input.focus();
        input.setSelectionRange(pos, pos);
      }, 250);
    }
  });
  onEvent("keydown", (e) => {
    const menu = $("#status-menu");
    if (!menu?.matches(":popover-open")) return;
    const options = [...menu.querySelectorAll("[role=option]")],
      index = options.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? options.length - 1
            : (index + (e.key === "ArrowDown" ? 1 : -1) + options.length) %
              options.length;
      options[next].focus();
    }
    if (e.key === "Escape")
      $("#status-trigger").setAttribute("aria-expanded", "false");
  });
  const standaloneMode = window.matchMedia("(display-mode: standalone)");
  let installedThisSession = false;
  function updateInstallBanner() {
    ui.installed =
      installedThisSession ||
      standaloneMode.matches ||
      navigator.standalone === true;
    ui.installVisible = !ui.installed;
  }
  async function requestAppInstall(button) {
    if (
      standaloneMode.matches ||
      navigator.standalone === true ||
      installedThisSession
    ) {
      updateInstallBanner();
      return;
    }
    if (installPrompt) {
      const prompt = installPrompt;
      installPrompt = null;
      button.disabled = true;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === "accepted") {
          installedThisSession = true;
          updateInstallBanner();
        }
      } finally {
        button.disabled = false;
      }
    } else {
      const ios =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      modal(
        "تثبيت واصل",
        createView(InstallInstructions, {
          model: {
            ios,
          },
        }),
      );
    }
  }
  listen(window, "beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    updateInstallBanner();
  });
  listen(window, "appinstalled", () => {
    installPrompt = null;
    installedThisSession = true;
    updateInstallBanner();
  });
  listen(standaloneMode, "change", updateInstallBanner);
  listen(window, "offline", () => {
    // Keep saved records available, hide live availability until connected.
    state.offline = navigator.onLine === false;
    if (state.S) refresh(!state.wizard && !$("#app-dialog").open);
  });
  listen(window, "online", () => {
    if (state.S) refresh(!state.wizard && !$("#app-dialog").open);
  });
  // Adapted from the supplied Bal3D interaction, keeping the existing wallet artwork.
  function stopWalletMotion() {}
  function initWalletMotion() {}
  ("use strict");
  const courierDocs = {
    residenceFront: "الوجه الأمامي لبطاقة السكن",
    nationalFront: "الوجه الأمامي للبطاقة الوطنية",
    nationalBack: "الوجه الخلفي للبطاقة الوطنية",
    licenseFront: "الوجه الأمامي لإجازة السوق",
    licenseBack: "الوجه الخلفي لإجازة السوق",
  };
  let documentStream = null,
    documentCapture = null,
    cameraFacing = "environment",
    cameraGeneration = 0;
  function gatherCourier() {
    const f = document.querySelector("#courier-register-form");
    if (!f) return;
    for (const [k, v] of new FormData(f))
      if (typeof v === "string") state.registration[k] = v;
    state.registration.location = {
      lat: Number(f.elements.lat.value),
      lng: Number(f.elements.lng.value),
    };
  }
  function stopDocumentCamera() {
    ui.cameraReady = false;
    ui.cameraError = "";
    cameraGeneration++;
    if (documentStream) documentStream.getTracks().forEach((t) => t.stop());
    documentStream = null;
  }
  function cameraDialog() {
    return $("#document-camera-dialog");
  }
  async function startDocumentCamera() {
    stopDocumentCamera();
    const gen = cameraGeneration;
    if (!documentCapture) return;
    documentCapture.photo = null;
    drawDocumentCamera();
    await nextTick();
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      ui.cameraError =
        "الكاميرا تحتاج رابط HTTPS. يمكنك اختيار صورة من الجهاز.";
      return;
    }
    const start = $('[data-action="document-start"]');
    if (start) start.disabled = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: cameraFacing,
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 960,
          },
        },
        audio: false,
      });
      if (
        gen !== cameraGeneration ||
        !documentCapture ||
        !cameraDialog().open
      ) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      documentStream = stream;
      const video = $("#document-camera-dialog video");
      video.srcObject = stream;
      await video.play();
      if (gen !== cameraGeneration) return;
      ui.cameraReady = true;
      drawDocumentCamera();
      await nextTick();
    } catch (err) {
      if (gen !== cameraGeneration) return;
      ui.cameraError =
        err.name === "NotAllowedError"
          ? "لم يُسمح بالكاميرا. فعّل الإذن أو اختر صورة من الجهاز."
          : "تعذّر فتح الكاميرا. جرّب مجدداً أو اختر صورة من الجهاز.";
      if (start) start.disabled = false;
    }
  }
  onEvent("click", async (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const a = b.dataset.action;
    try {
      if (a === "courier-password") {
        const input = $(
            `#courier-register-form input[name="${b.dataset.field}"]`,
          ),
          visible = input.type === "password";
        input.type = visible ? "text" : "password";
        b.textContent = visible ? "إخفاء" : "إظهار";
        b.setAttribute("aria-pressed", String(visible));
        b.setAttribute(
          "aria-label",
          (visible ? "إخفاء " : "إظهار ") +
            (b.dataset.field === "password"
              ? "كلمة المرور"
              : "تأكيد كلمة المرور"),
        );
      } else if (a === "document-open") {
        gatherCourier();
        documentCapture = {
          key: b.dataset.document,
          photo: state.registration.documents[b.dataset.document] || null,
        };
        drawDocumentCamera();
      } else if (a === "document-start" || a === "document-retake")
        await startDocumentCamera();
      else if (a === "document-flip") {
        cameraFacing = cameraFacing === "environment" ? "user" : "environment";
        await startDocumentCamera();
      } else if (a === "document-close") cameraDialog().close();
      else if (a === "document-shoot") {
        const video = $("#document-camera-dialog video");
        if (!video?.videoWidth) throw Error("انتظر جاهزية الكاميرا");
        const canvas = document.createElement("canvas"),
          ratio = Math.min(1, 900 / video.videoWidth);
        canvas.width = video.videoWidth * ratio;
        canvas.height = video.videoHeight * ratio;
        canvas
          .getContext("2d")
          .drawImage(video, 0, 0, canvas.width, canvas.height);
        documentCapture.photo = canvas.toDataURL("image/jpeg", 0.75);
        stopDocumentCamera();
        drawDocumentCamera();
      } else if (a === "document-save") {
        const { key, photo } = documentCapture;
        if (!photo) throw Error("التقط الصورة أولاً");
        state.registration.documents[key] = photo;
        cameraDialog().close();
        courierRegistrationView();
        $(`[data-document="${key}"]`)?.focus();
      } else if (a === "courier-step-back") {
        gatherCourier();
        state.registration.step = Math.max(
          0,
          (state.registration.step || 0) - 1,
        );
        courierRegistrationView();
      } else if (a === "courier-edit") {
        closeModal();
        courierRegistrationView();
      } else if (a === "courier-confirm") {
        b.disabled = true;
        await registerAccount(state.registration);
        const r = state.registration;
        closeModal();
        await login("courier", r.phone, r.password);
        state.registration = null;
        toast("تم إنشاء حساب المندوب");
      }
    } catch (err) {
      toast(err.message);
      b.disabled = false;
    }
  });
  onEvent("change", async (e) => {
    const input = e.target;
    if (!input.matches("[data-document-upload],[data-camera-upload]")) return;
    const file = input.files?.[0];
    if (!file) return;
    try {
      gatherCourier();
      const photo = await imageData(file);
      if (photo.length > 600000)
        throw Error("الصورة كبيرة؛ جرّب صورة أوضح وأصغر");
      if (input.hasAttribute("data-camera-upload")) {
        if (!documentCapture) return;
        stopDocumentCamera();
        documentCapture.photo = photo;
        drawDocumentCamera();
      } else {
        const key = input.dataset.documentUpload;
        state.registration.documents[key] = photo;
        courierRegistrationView();
        $(`[data-document="${key}"]`)?.focus();
      }
    } catch (err) {
      toast(err.message);
    } finally {
      input.value = "";
    }
  });
  listen(window, "pagehide", stopDocumentCamera);
  listen(document, "visibilitychange", () => {
    if (document.hidden && documentStream) {
      stopDocumentCamera();
      if (documentCapture)
        drawDocumentCamera(
          "توقفت الكاميرا عند مغادرة الصفحة. اضغط فتح الكاميرا للمتابعة.",
        );
    }
  });
  provide(viewStateKey, {
    ui,
    state,
    get documentCapture() {
      return documentCapture;
    },
  });
  const viewFactories = {
    AuthView: () => authView(),
    HomeView: homeView,
    OrdersView: ordersView,
    OrderWizard: orderWizard,
    AccountView: accountView,
    WalletView: walletView,
    MerchantRegistration: merchantRegistrationView,
    CourierRegistration: courierView,
  };
  const views = Object.fromEntries(
    Object.entries(viewFactories).map(([name, factory]) => [
      name,
      createView(ViewHost, {
        factory: () => {
          ui.revision;
          return factory();
        },
      }),
    ]),
  );
  const Navigation = createView(ViewHost, {
    factory: () => (state.S ? nav() : null),
  });
  const SplashArt = createView(ViewHost, {
    factory: () =>
      createView(SplashArtView, {
        model: {
          splashScenery,
          routeLines,
        },
      }),
  });
  const currentView = computed(() => views[ui.page]);
  const title = computed(
    () =>
      ({
        home: "لوحة " + roleNames[accountType(state.S?.user)],
        registry: "سجل الطلبات",
        available: "الطلبات المتاحة",
        wallet: "المحفظة",
        account: "حسابي",
        new: "طلب جديد",
      })[state.screen] || "واصل",
  );
  async function dispatch(type, event) {
    for (const fn of handlers[type] || []) await fn(event);
  }
  function cameraClosed() {
    stopDocumentCamera();
    documentCapture = null;
    ui.cameraContent = null;
    ui.cameraReady = false;
  }
  let restoringRoute = false;
  function writeRoute(role, page) {
    if (restoringRoute) return;
    const hash = routeHash(role, page);
    if (location.hash !== hash) history.pushState(null, "", hash);
  }
  async function restoreRoute() {
    restoringRoute = true;
    try {
      closeModal();
      cameraDialog()?.close();
      const route = parseRoute(location.hash, application.accounts);
      state.authRole = route.role || application.defaultAccount;
      state.authIntent = route.page === "register" ? "register" : "login";
      if (
        !route.role &&
        location.hash !== routeHash(state.authRole, state.authIntent)
      ) {
        history.replaceState(
          null,
          "",
          routeHash(state.authRole, state.authIntent),
        );
      }
      if (
        !state.authRole ||
        route.page === "login" ||
        route.page === "choose"
      ) {
        state.S = null;
        state.registration = null;
        state.wizard = null;
        loginPage();
        return;
      }
      if (route.page === "register") {
        state.S = null;
        beginRegistration(state.authRole);
        return;
      }
      state.registration = null;
      if (!state.S || accountType(state.S.user) !== route.role) {
        await api("/api/login", {
          role: route.role,
        });
        await refresh(false);
      }
      state.screen = route.page;
      state.filter = "all";
      state.homePage = 1;
      state.registryPage = 1;
      state.query = "";
      if (route.page === "new") {
        if (!state.wizard) startOrder();
        else render();
      } else {
        state.wizard = null;
        render();
      }
    } catch (error) {
      toast(error.message);
    } finally {
      restoringRoute = false;
    }
  }
  listen(window, "hashchange", restoreRoute);
  onMounted(() => {
    showWelcomeSplash().then(() => {
      restoreRoute();
      updateInstallBanner();
    });
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register(new URL("sw.js", document.baseURI), {
          updateViaCache: "none",
        })
        .then((r) => r.update())
        .catch(() => {});
    const interval = setInterval(() => {
      if (
        state.S &&
        !state.wizard &&
        !state.registration &&
        !$("#app-dialog").open &&
        !$("#status-menu")?.matches(":popover-open") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement.tagName,
        )
      )
        refresh();
      else if (state.S) refresh(false);
    }, 5000);
    cleanups.push(() => clearInterval(interval));
  });
  onBeforeUnmount(() => {
    cleanups.forEach((fn) => fn());
    clearTimeout(toastTimer);
    clearTimeout(searchTimer);
    stopDocumentCamera();
    if (state.trackingId !== null)
      navigator.geolocation.clearWatch(state.trackingId);
  });
  return {
    ui,
    state,
    currentView,
    Navigation,
    SplashArt,
    title,
    roleNames,
    dispatch,
    closeModal,
    cameraClosed,
    refresh,
    requestAppInstall,
  };
}
