import { inject } from "vue";

export const viewStateKey = Symbol("wasel-view-state");

export function useViewState() {
  return inject(viewStateKey, { ui: {}, state: {} });
}
