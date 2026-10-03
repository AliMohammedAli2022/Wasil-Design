import { h } from "vue";

// Controllers can open a template component without owning its markup.
// Native elements belong in .vue templates, never in this adapter.
export function createView(component, props = {}) {
  if (typeof component === "string") {
    throw new TypeError("View content must be a Vue component");
  }
  return h(component, props);
}
