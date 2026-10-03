import { createView } from "../../services/viewContent.js";
import DocumentCamera from "./DocumentCamera.vue";
import CourierReview from "./CourierReview.vue";
import CloseIcon from "../../components/CloseIcon.vue";
export function createCameraViews(context) {
  function drawDocumentCamera(message = "") {
    const { cameraDialog, documentCapture, ui, courierDocs, nextTick } =
      context();
    ui.cameraError = message;
    const d = cameraDialog(),
      c = documentCapture;
    if (!c) return;
    ui.cameraContent = createView(DocumentCamera, {
      model: {
        CloseIcon,
        courierDocs,
        c,
      },
    });
    nextTick(() => {
      if (!d.open) d.showModal();
    });
  }
  function reviewCourierRegistration() {
    const { gatherCourier, state, courierDocs, modal, vehicleNames } =
      context();
    gatherCourier();
    const r = state.registration;
    if (r.password !== r.confirmPassword)
      throw Error("كلمة المرور وتأكيدها غير متطابقين");
    for (const [key, label] of Object.entries(courierDocs))
      if (!r.documents[key]) throw Error("أضف صورة " + label);
    modal(
      "مراجعة حساب المندوب",
      createView(CourierReview, {
        model: {
          r,
          vehicleNames,
          courierDocs,
        },
      }),
    );
  }
  return {
    drawDocumentCamera,
    reviewCourierRegistration,
  };
}
