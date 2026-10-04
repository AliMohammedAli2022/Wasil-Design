import { createView } from "../../services/viewContent.js";
import AccountView from "./AccountView.vue";
import WalletView from "./WalletView.vue";
import ReadinessForm from "./ReadinessForm.vue";
import ProfileForm from "./ProfileForm.vue";
import { PHONE_ATTRIBUTES } from "../../services/formFields.js";
export function createAccountViews(context) {
  function accountView() {
    const { state, roleNames, vehicleNames, money, modal } = context();
    return createView(AccountView, {
      model: {
        state,
        u: state.S.user,
        roleNames,
        vehicleNames,
        money,
        modal,
      },
    });
  }
  function walletView() {
    const { state, money, ledger } = context();
    const credits = state.S.ledger.reduce(
        (n, r) => n + Math.max(0, r.amount),
        0,
      ),
      debits = state.S.ledger.reduce((n, r) => n + Math.max(0, -r.amount), 0);
    return createView(WalletView, {
      model: {
        money,
        state,
        credits,
        debits,
        ledger,
      },
    });
  }
  function readiness() {
    const { modal, state } = context();
    modal(
      "جاهزية المندوب",
      createView(ReadinessForm, {
        model: {
          state,
        },
      }),
    );
  }
  function profileForm() {
    const { state, modal, provinces } = context();
    const u = state.S.user;
    modal(
      "تعديل الملف",
      createView(ProfileForm, {
        model: {
          u,
          provinces,
          PHONE_ATTRIBUTES,
        },
      }),
    );
  }
  return {
    accountView,
    walletView,
    readiness,
    profileForm,
  };
}
