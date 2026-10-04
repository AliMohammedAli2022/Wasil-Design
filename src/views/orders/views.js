import { createView } from "../../services/viewContent.js";
import MetricOrdersDialog from "./MetricOrdersDialog.vue";
import HomeView from "./HomeView.vue";
import StatusPicker from "./StatusPicker.vue";
import OrdersView from "./OrdersView.vue";
import OrderList from "./OrderList.vue";
import OrderDetail from "./OrderDetail.vue";
import MissingOrder from "./MissingOrder.vue";
import ShipmentFields from "./ShipmentFields.vue";
import SenderFields from "./SenderFields.vue";
import RecipientFields from "./RecipientFields.vue";
import OrderReview from "./OrderReview.vue";
import OrderWizard from "./OrderWizard.vue";
import OrderChat from "./OrderChat.vue";
import ConfirmationField from "./ConfirmationField.vue";
import ActionDescription from "./ActionDescription.vue";
import ExtendPickupFields from "./ExtendPickupFields.vue";
import ArrivalInstructions from "./ArrivalInstructions.vue";
import ExcludePickupFields from "./ExcludePickupFields.vue";
import ResolveExclusionFields from "./ResolveExclusionFields.vue";
import PickupFields from "./PickupFields.vue";
import ReturnArrivalFields from "./ReturnArrivalFields.vue";
import DeliveryFields from "./DeliveryFields.vue";
import DeferDeliveryFields from "./DeferDeliveryFields.vue";
import ReturnInspectionField from "./ReturnInspectionField.vue";
import ReturnSettlementFields from "./ReturnSettlementFields.vue";
import DeliverySettlementFields from "./DeliverySettlementFields.vue";
import PartialReturnFields from "./PartialReturnFields.vue";
import RatingFields from "./RatingFields.vue";
import AcceptOfferNotice from "./AcceptOfferNotice.vue";
import OrderActionForm from "./OrderActionForm.vue";
import OrderMap from "./OrderMap.vue";
import CouriersDialog from "./CouriersDialog.vue";
import OrdersMapDialog from "./OrdersMapDialog.vue";
import {
  statuses,
  orderStatus,
  filterOrders,
} from "../../services/orderStatuses.js";
import { paginate } from "../../services/pagination.js";
import { trackingLink } from "../../services/tracking.js";
import {
  areas,
  orderVehicles,
  vehicleFits,
} from "../../services/orderPolicy.js";
import { PHONE_ATTRIBUTES } from "../../services/formFields.js";
export function createOrdersViews(context) {
  function homeView() {
    const {
      state,
      before,
      closed,
      money,
      date,
      statusPicker,
      orderList,
      modal,
    } = context();
    const u = state.S.user;
    const own = state.S.orders.filter(
        (o) => u.role === "merchant" || o.courier === u.id,
      ),
      active = own.filter(
        (o) => !before.includes(o.status) && !closed.includes(o.status),
      ),
      pickup = own.filter((o) =>
        ["reserved", "approaching", "arrived", "waiting"].includes(o.status),
      ),
      returns = own.filter((o) =>
        ["failed", "returning", "partial_pending"].includes(orderStatus(o)),
      );
    const showMetric = (title, orders) => ({
      "aria-label": `${title}، ${orders.length} طلب، عرض التفاصيل`,
      onClick: () =>
        modal(
          title,
          createView(MetricOrdersDialog, {
            model: {
              orders,
              orderList,
            },
          }),
        ),
    });
    const pagination = paginate(filterOrders(own, state), state.homePage);
    return createView(HomeView, {
      model: {
        u,
        money,
        state,
        date,
        active,
        showMetric,
        pickup,
        returns,
        statusPicker,
        pagination,
        orderList,
      },
    });
  }
  function statusPicker() {
    const { state, baseOrders } = context();
    const options = [["all", "جميع الحالات"], ...Object.entries(statuses)];
    return createView(StatusPicker, {
      model: {
        state,
        baseOrders,
        options,
      },
    });
  }
  function baseOrders() {
    const { state } = context();
    return state.S.orders.filter((o) =>
      state.screen === "available"
        ? o.status === "published"
        : state.S.user.role === "courier"
          ? o.courier === state.S.user.id
          : true,
    );
  }
  function ordersView() {
    const { baseOrders, state, statusPicker, orderList, refresh } = context();
    const os = filterOrders(baseOrders(), state);
    const registry = state.screen === "registry";
    const bulkActions =
      registry &&
      state.S.user.role === "merchant" &&
      ["draft", "published"].includes(state.filter);
    return createView(OrdersView, {
      model: {
        state,
        statusPicker,
        registry,
        os,
        bulkActions,
        refresh,
        orderList,
      },
    });
  }
  function orderList(os, selection = null) {
    const { state, vehicleNames, money } = context();
    return createView(OrderList, {
      model: {
        os,
        selection,
        state,
        vehicleNames,
        money,
        orderVehicles,
      },
    });
  }
  function availableActions(o) {
    const { state, before, closed } = context();
    const own = state.S.user.id === o.merchant,
      assigned = state.S.user.id === o.courier,
      entries = [];
    const add = (action, label) => entries.push([action, label]);
    if (assigned && o.editPending) {
      add("keep_edit", "قبول بيانات الطلب المعدلة");
      add("decline_edit", "رفض التعديل دون عقوبة");
    }
    if (assigned && o.settled && ["delivered", "returned"].includes(o.status))
      add("complete", "إنهاء الطلب");
    if (own && o.exclusionPending)
      add("resolve_exclusion", "معالجة الطلب المستثنى");
    if (own) {
      if (before.includes(o.status)) {
        add("edit", "تعديل الطلب");
        if (o.status === "draft") {
          add("publish", "نشر الطلب");
          add("delete", "حذف الطلب المحفوظ");
        } else {
          if (o.status === "published") {
            add("unpublish", "إلغاء النشر");
            add("raise_fee", "أنا مستعجل — زيادة الأجرة");
          }
        }
      }
      if (before.includes(o.status)) add("cancel", "إلغاء الطلب");
      if (o.status === "retry" && !o.retryApproved)
        add("approve_retry", "الموافقة على الموعد");
      if (o.status === "at_customer" && o.partial && !o.partial.approved)
        add("partial_approve", "الموافقة على التسليم الجزئي");
      if (["failed", "retry"].includes(o.status))
        add("return", "طلب إرجاع الشحنة");
      if (o.status === "returning" && o.returnArrived && !o.returnReceived)
        add("receive_return", "تأكيد استلام المرتجع");
    }
    if (state.S.user.role === "courier" && o.status === "published") {
      add("reserve", "حجز الطلب");
      if (
        Date.now() - Date.parse(o.publishedAt || o.createdAt) >=
        state.S.settings.offerAfterMinutes * 60000
      )
        add("offer", "اقتراح أجرة");
    }
    if (
      assigned &&
      ["received", "transit", "at_customer"].includes(o.status) &&
      !o.partial?.approved
    )
      add("defer", "تأجيل بطلب الزبون");
    if (assigned) {
      if (o.status === "reserved") add("depart", "أنا في الطريق");
      if (["reserved", "approaching"].includes(o.status)) {
        add("arrive", "وصلت إلى موقع الاستلام");
        if (
          (o.extensionMinutes ??
            (o.extended ? Math.ceil(o.originalMinutes / 2) : 0)) <
          Math.ceil(o.originalMinutes / 2)
        )
          add("extend", "تمديد المهلة");
      }
      if (["reserved", "approaching", "arrived", "waiting"].includes(o.status))
        add("release", "إلغاء الحجز مع سبب");
      if (o.status === "arrived") add("wait", "بانتظار تجهيز الشحنة");
      if (["arrived", "waiting"].includes(o.status))
        add("exclude_pickup", "استثناء الطلب لوجود مشكلة");
      if (["arrived", "waiting"].includes(o.status))
        add("pickup", "فحص ودفع واستلام");
      if (o.status === "received") add("transit", "بدء التوصيل");
      if (o.status === "transit" || (o.status === "retry" && o.retryApproved))
        add("customer_arrive", "وصلت إلى الزبون");
      if (o.status === "at_customer") {
        add("deliver", "تأكيد التسليم والتحصيل");
        if (state.S.settings.partialEnabled && o.kind !== "free") {
          if (!o.partial) add("partial_propose", "اقتراح راجع جزئي");
          if (o.partial?.approved) add("partial_confirm", "تأكيد الجزء المسلم");
        }
      }
      if (["transit", "at_customer", "retry"].includes(o.status))
        add("fail", "تعذر التسليم");
      if (o.status === "failed") {
        if (true) add("retry", "اقتراح إعادة المحاولة");
        add("return", "بدء مسار الإرجاع");
      }
      if (["return_pending", "partial_pending"].includes(o.status))
        add("return_start", "التوجه لإرجاع الشحنة");
      if (o.status === "returning") {
        if (!o.returnArrived) add("return_arrive", "وصلت بالمرتجع");
        if (o.returnReceived)
          add("settle_return", "تأكيد استرداد القيمة والأجور");
      }
      if (o.status === "delivered" && !o.settled)
        add("settle_delivery", "تأكيد التسوية مع المرسل");
    }
    if ((own || assigned) && o.courier)
      add("chat", own ? "محادثة مع المندوب" : "محادثة مع التاجر");
    if (
      (own || assigned) &&
      closed.includes(o.status) &&
      o.status !== "cancelled" &&
      o.settled &&
      !state.S.ratings.some(
        (r) => r.owner === state.S.user.id && r.orderId === o.id,
      )
    )
      add("rate", "تقييم الطرف الآخر");
    return entries;
  }
  function orderDetail(oid) {
    const {
      state,
      modal,
      natureNames,
      vehicleNames,
      money,
      customerDue,
      before,
      date,
      maps,
      availableActions,
    } = context();
    const o = state.S.orders.find((o) => o.id === oid);
    if (!o) return;
    const isOwn = o.merchant === state.S.user.id;
    const offers = state.S.offers.filter((x) => x.orderId === oid);
    modal(
      o.id,
      createView(OrderDetail, {
        model: {
          o,
          state,
          natureNames,
          orderVehicles,
          vehicleNames,
          money,
          customerDue,
          isOwn,
          before,
          date,
          maps,
          trackingLink,
          availableActions,
          oid,
          offers,
        },
      }),
    );
  }
  function orderWizard() {
    const { state, natureNames, vehicleNames, money, customerDue } = context();
    if (!state.wizard)
      return createView(MissingOrder, {
        model: {},
      });
    const d = state.wizard.data,
      r = d.recipient,
      u = state.S.user;
    let fields = "";
    if (state.wizard.step === 0) {
      fields = createView(ShipmentFields, {
        model: {
          d,
          natureNames,
          orderVehicles,
          vehicleNames,
          vehicleFits,
          state,
          money,
        },
      });
    } else if (state.wizard.step === 1) {
      fields = createView(SenderFields, {
        model: {
          d,
          PHONE_ATTRIBUTES,
          u,
        },
      });
    } else if (state.wizard.step === 2) {
      fields = createView(RecipientFields, {
        model: {
          u,
          r,
          PHONE_ATTRIBUTES,
          areas,
          d,
        },
      });
    } else {
      fields = createView(OrderReview, {
        model: {
          d,
          u,
          r,
          natureNames,
          vehicleNames,
          money,
          customerDue,
          state,
          orderVehicles,
        },
      });
    }
    return createView(OrderWizard, {
      model: {
        state,
        d,
        fields,
      },
    });
  }
  function orderActionForm(o, op, extra = {}) {
    const {
      startOrder,
      modal,
      state,
      date,
      input,
      select,
      money,
      customerDue,
    } = context();
    if (op === "edit") return startOrder(o.kind, o);
    if (op === "chat") {
      return modal(
        "محادثة " + o.id,
        createView(OrderChat, {
          model: {
            o,
            state,
            date,
          },
        }),
      );
    }
    const confirm = (label) =>
      createView(ConfirmationField, {
        model: {
          label,
        },
      });
    const contents = {
      publish: "سيظهر الطلب للمندوبين المناسبين في النظام المحلي.",
      unpublish: "سيعود الطلب إلى حالة محفوظ ولن يظهر للمندوبين.",
      delete: "سيُحذف الطلب المحفوظ. الطلب المنشور لا يمكن حذفه بهذه الطريقة.",
      cancel: "يُلغى الطلب قبل استلام الشحنة.",
      reserve: "يُحجز الطلب لك وحدك. لا يمكنك حجز طلب ثانٍ حتى استلامه.",
      depart: "تأكيد التوجه إلى التاجر.",
      extend: `يُمدد الحجز مرة واحدة بنسبة ${state.S.settings.extensionPercent}% من المدة الأصلية.`,
      arrive: "تأكيد وصولك إلى موقع الاستلام يوقف مهلة الوصول.",
      wait: "الطلب بانتظار التجهيز أو معالجة اختلاف في البيانات.",
      transit: "تأكيد بدء توصيل الشحنة إلى الزبون.",
      customer_arrive: "تأكيد الوصول إلى عنوان الزبون.",
      approve_retry: "الموافقة على موعد المحاولة المقترح: " + date(o.retryAt),
      return: "تأكيد نقل الطلب إلى مسار الإرجاع.",
      return_start: "تأكيد بدء رحلة الإرجاع.",
      return_arrive: "تأكيد الوصول بالشحنة المرتجعة.",
      partial_approve: "الموافقة على القطع والقيمة المقترحة للتسليم الجزئي.",
    };
    let fields = createView(ActionDescription, {
      model: {
        contents,
        op,
      },
    });
    if (op === "extend") {
      const remaining = Math.max(
        0,
        Math.ceil(o.originalMinutes / 2) -
          (o.extensionMinutes ??
            (o.extended ? Math.ceil(o.originalMinutes / 2) : 0)),
      );
      fields = createView(ExtendPickupFields, {
        model: {
          remaining,
        },
      });
    }
    if (op === "arrive")
      fields = createView(ArrivalInstructions, {
        model: {
          state,
        },
      });
    if (op === "exclude_pickup")
      fields = createView(ExcludePickupFields, {
        model: {},
      });
    if (op === "resolve_exclusion")
      fields = createView(ResolveExclusionFields, {
        model: {
          o,
        },
      });
    if (
      [
        "complete",
        "keep_edit",
        "decline_edit",
        "approve_extension",
        "reject_extension",
      ].includes(op)
    )
      fields = confirm("راجعت البيانات وأؤكد هذا الإجراء.");
    if (op === "raise_fee" || op === "offer")
      fields = input(
        "fee",
        "أجرة التوصيل المقترحة (د.ع)",
        op === "raise_fee" ? o.fee + 1000 : o.fee,
        'type="number" min="1" required',
      );
    if (op === "release" || op === "fail")
      fields = [
        select(
          "reason",
          "السبب",
          {
            "": "اختر السبب",
            "عدم الرد أو إغلاق الهاتف": "عدم الرد أو إغلاق الهاتف",
            "عدم وجود الزبون": "عدم وجود الزبون",
            "خطأ في العنوان": "خطأ في العنوان",
            "رفض الاستلام أو الدفع": "رفض الاستلام أو الدفع",
            "اختلاف أو مشكلة في الشحنة": "اختلاف أو مشكلة في الشحنة",
            "سبب آخر": "سبب آخر",
          },
          "",
          "required",
        ),
        input("reasonDetails", "التوضيح", "", 'maxlength="300"'),
      ];
    if (op === "pickup")
      fields = createView(PickupFields, {
        model: {
          money,
          o,
        },
      });
    if (op === "return_arrive")
      fields = createView(ReturnArrivalFields, {
        model: {
          o,
        },
      });
    if (op === "deliver")
      fields = createView(DeliveryFields, {
        model: {
          money,
          customerDue,
          o,
          confirm,
        },
      });
    if (op === "defer")
      fields = createView(DeferDeliveryFields, {
        model: {},
      });
    if (op === "retry")
      fields = input(
        "when",
        "الموعد المقترح",
        "",
        'type="datetime-local" required',
      );
    if (op === "receive_return")
      fields = createView(ReturnInspectionField, {
        model: {},
      });
    if (op === "settle_return")
      fields = createView(ReturnSettlementFields, {
        model: {
          money,
          o,
          confirm,
        },
      });
    if (op === "settle_delivery")
      fields = createView(DeliverySettlementFields, {
        model: {
          money,
          o,
          confirm,
        },
      });
    if (op === "partial_propose")
      fields = createView(PartialReturnFields, {
        model: {
          money,
          o,
        },
      });
    if (op === "partial_confirm")
      fields = confirm(
        "سلمت الجزء المعتمد وحصلت قيمته مع أجرة التوصيل إذا كانت على الزبون.",
      );
    if (op === "rate")
      fields = createView(RatingFields, {
        model: {},
      });
    if (op === "accept_offer")
      fields = createView(AcceptOfferNotice, {
        model: {},
      });
    modal(
      "إجراء على " + o.id,
      createView(OrderActionForm, {
        model: {
          o,
          op,
          extra,
          fields,
        },
      }),
    );
  }
  function mapPlot(groups) {
    return createView(OrderMap, {
      model: {
        groups,
      },
    });
  }
  function localMap(couriers = false) {
    const { state, baseOrders, modal, mapPlot, maps, vehicleNames } = context();
    const groups = couriers
      ? state.S.couriers.map((c) => ({
          id: c.id,
          name: c.name,
          vehicle: c.vehicle,
          cooling: c.cooling,
          plate: c.plate,
          phone: c.phone,
          vehicleLabel:
            c.cooling === "frozen"
              ? "براد — تجميد"
              : c.cooling === "chilled"
                ? "سيارة تبريد"
                : vehicleNames[c.vehicle] || c.vehicle,
          location: c.location,
          count: 1,
        }))
      : Object.values(
          baseOrders().reduce((a, o) => {
            const key =
              o.merchant +
              ":" +
              (o.sender.addressId ||
                o.sender.address ||
                JSON.stringify(o.sender.location));
            a[key] ??= {
              id: key,
              name: o.sender.name,
              location: o.sender.location,
              count: 0,
              ids: [],
            };
            a[key].vip ||= o.service === "vip";
            a[key].count++;
            a[key].ids.push(o.id);
            return a;
          }, {}),
        );
    if (couriers) {
      modal(
        "مواقع المناديب المسجلة",
        createView(CouriersDialog, {
          model: {
            groups,
          },
        }),
      );
      return;
    }
    modal(
      "طلبات كل موقع",
      createView(OrdersMapDialog, {
        model: {
          mapPlot,
          groups,
          maps,
        },
      }),
    );
  }
  return {
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
  };
}
