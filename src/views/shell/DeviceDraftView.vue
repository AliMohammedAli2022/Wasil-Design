<script setup>
import DeviceDraftDetail from "../../components/DeviceDraftDetail.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <DeviceDraftDetail
    :user="model.state.S.user"
    :draftId="model.state.localDraftId"
    :offline="model.state.offline"
    @back="
      () => {
        model.state.screen = 'account';
        model.render();
        model.modal('المسودات', [model.offlineDraftsView()]);
      }
    "
    @done="
      async (message) => {
        model.state.screen = 'account';
        await model.refresh();
        model.modal('المسودات', [model.offlineDraftsView()]);
        model.toast(message);
      }
    "
  ></DeviceDraftDetail>
</template>
