import { createView } from "../../services/viewContent.js";
import DetailRow from "./DetailRow.vue";
import ActionButton from "./ActionButton.vue";
import FormInput from "./FormInput.vue";
import FormSelect from "./FormSelect.vue";
import WizardSteps from "./WizardSteps.vue";
import LocationFields from "./LocationFields.vue";
import LocationDetails from "./LocationDetails.vue";
import MapLink from "./MapLink.vue";
import SplashBike from "./SplashBike.vue";
import RouteLines from "./RouteLines.vue";
import SplashScenery from "./SplashScenery.vue";
import NavigationIcon from "./NavigationIcon.vue";
import SummaryMetric from "./SummaryMetric.vue";
import WalletLedger from "./WalletLedger.vue";
export function createUiViews(context) {
  function row(label, value) {
    return createView(DetailRow, {
      model: {
        label,
        value,
      },
    });
  }
  function button(action, label, extra = "", kind = "secondary-button") {
    return createView(ActionButton, {
      model: {
        kind,
        action,
        extra,
        label,
      },
    });
  }
  function input(name, label, value = "", attrs = "") {
    return createView(FormInput, {
      model: {
        label,
        name,
        value,
        attrs,
      },
    });
  }
  function select(name, label, values, value, attrs = "") {
    return createView(FormSelect, {
      model: {
        label,
        name,
        attrs,
        values,
        value,
      },
    });
  }
  function stepper(step, labels) {
    return createView(WizardSteps, {
      model: {
        labels,
        step,
      },
    });
  }
  function coords(loc, readonly = false) {
    return createView(LocationFields, {
      model: {
        loc,
        readonly,
      },
    });
  }
  function maps(loc, label = "فتح الموقع بالخرائط", compact = false) {
    if (!compact)
      return createView(LocationDetails, {
        model: {
          loc,
          label,
        },
      });
    return createView(MapLink, {
      model: {
        loc,
        label,
      },
    });
  }
  function splashBike() {
    return createView(SplashBike, {
      model: {},
    });
  }
  function routeLines() {
    return createView(RouteLines, {
      model: {},
    });
  }
  function splashScenery() {
    return createView(SplashScenery, {
      model: {},
    });
  }
  function navIcon(key) {
    return createView(NavigationIcon, {
      model: {
        key,
      },
    });
  }
  function metric(label, value, ic, color = "", attributes = {}) {
    return createView(SummaryMetric, {
      model: {
        color,
        attributes,
        label,
        ic,
        value,
      },
    });
  }
  function ledger(items) {
    const { money, date } = context();
    return createView(WalletLedger, {
      model: {
        items,
        money,
        date,
      },
    });
  }
  return {
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
  };
}
