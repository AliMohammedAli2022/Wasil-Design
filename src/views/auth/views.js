import { createView } from "../../services/viewContent.js";
import { workflowRole } from "../../services/accounts.js";
import AuthView from "./AuthView.vue";
import MerchantIdentityFields from "./MerchantIdentityFields.vue";
import MerchantLocationFields from "./MerchantLocationFields.vue";
import MerchantReviewFields from "./MerchantReviewFields.vue";
import MerchantRegistration from "./MerchantRegistration.vue";
import CourierField from "./CourierField.vue";
import CourierPasswordField from "./CourierPasswordField.vue";
import DocumentField from "./DocumentField.vue";
import CourierRegistration from "./CourierRegistration.vue";
import { PHONE_ATTRIBUTES } from "../../services/formFields.js";
export function createAuthViews(context) {
  function authView() {
    const { state, roleNames, application } = context();
    return createView(AuthView, {
      model: {
        state,
        roleNames,
        application,
      },
    });
  }
  function merchantRegistrationView() {
    const {
      state,
      courierView,
      select,
      input,
      vehicleNames,
      provinces,
      roleNames,
    } = context();
    if (state.registration.role === "courier") return courierView();
    const r = state.registration;
    let fields = "";
    if (r.step === 0)
      fields = createView(MerchantIdentityFields, {
        model: {
          r,
          PHONE_ATTRIBUTES,
        },
      });
    else if (r.step === 1)
      fields = [
        input(
          "businessName",
          "اسم النشاط التجاري",
          r.businessName,
          'required maxlength="100"',
        ),
        workflowRole(r.role) === "merchant"
          ? select(
              "activity",
              "نوع النشاط",
              {
                shop: "محل",
                warehouse: "مخزن",
                ecommerce: "تجارة إلكترونية — قريباً",
              },
              r.activity,
            )
          : r.role === "courier"
            ? [
                select("vehicle", "نوع المركبة", vehicleNames, r.vehicle),
                input(
                  "plate",
                  "رقم المركبة",
                  r.plate,
                  'required maxlength="40"',
                ),
              ]
            : "",
        select(
          "province",
          "المحافظة",
          Object.fromEntries(provinces.map((p) => [p, p])),
          r.province,
        ),
        input("area", "المنطقة", r.area, "required"),
        input("address", "العنوان", r.address, "required"),
      ];
    else if (r.step === 2)
      fields = createView(MerchantLocationFields, {
        model: {
          r,
        },
      });
    else if (r.step === 3)
      fields = createView(MerchantReviewFields, {
        model: {
          r,
          roleNames,
        },
      });
    return createView(MerchantRegistration, {
      model: {
        r,
        fields,
      },
    });
  }
  function courierView() {
    const { state, courierDocs, provinces, vehicleNames } = context();
    state.registration.documents ??= {};
    const r = state.registration;
    const stage = Number(r.step || 0);
    const group = (n) => ({
      class: "courier-step",
      hidden: stage !== n,
      disabled: stage !== n,
    });
    const field = (name, label, ic, type = "text", extra = "") =>
      createView(CourierField, {
        model: {
          label,
          ic,
          name,
          type,
          r,
          extra,
        },
      });
    const password = (name, label) =>
      createView(CourierPasswordField, {
        model: {
          label,
          name,
          r,
        },
      });
    const doc = (key) =>
      createView(DocumentField, {
        model: {
          r,
          key,
          courierDocs,
        },
      });
    return createView(CourierRegistration, {
      model: {
        stage,
        group,
        field,
        provinces,
        r,
        PHONE_ATTRIBUTES,
        password,
        vehicleNames,
        doc,
      },
    });
  }
  return {
    authView,
    merchantRegistrationView,
    courierView,
  };
}
