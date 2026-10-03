<script setup>
import ActionButton from "../ui/ActionButton.vue";
import MaterialIcon from "../shell/MaterialIcon.vue";
import CameraCloseIcon from "./CameraCloseIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
import { useViewState } from "../../composables/useViewState.js";
const { ui } = useViewState();
</script>
<template>
  <div class="document-camera-head">
    <h2 id="document-camera-title">التقاط المستمسك</h2>
    <div>
      <ActionButton
        :model="{
          action: 'document-flip',
          extra: 'aria-label=&quot;تبديل الكاميرا&quot;',
          kind: 'camera-icon',
        }"
        ><MaterialIcon
          :model="{
            n: 'cameraswitch',
          }"
      /></ActionButton>
      <ActionButton
        :model="{
          action: 'document-close',
          extra: 'aria-label=&quot;إغلاق الكاميرا&quot;',
          kind: 'wasel-close',
        }"
        ><CameraCloseIcon
          v-bind="{
            model: {
              CloseIcon: model.CloseIcon,
            },
          }"
      /></ActionButton>
    </div>
  </div>
  <p class="camera-document-name">{{ model.courierDocs[model.c.key] }}</p>
  <div class="document-camera-stage">
    <template v-if="model.c.photo"
      ><img
        :src="model.c.photo"
        :alt="'معاينة ' + model.courierDocs[model.c.key]"
    /></template>
    <template v-else
      ><video
        :autoplay="true"
        :muted="true"
        :playsinline="true"
        aria-label="معاينة الكاميرا"
      ></video>
      <div class="document-frame" aria-hidden="true"></div
    ></template>
  </div>
  <p class="camera-tip">
    <MaterialIcon
      :model="{
        n: 'light_mode',
      }"
    />
    {{ " اجعل المستمسك كاملاً داخل الإطار بإضاءة جيدة" }}
  </p>
  <p class="camera-error" role="alert">{{ ui.cameraError }}</p>
  <div class="camera-actions">
    <template v-if="model.c.photo"
      ><ActionButton
        :model="{
          action: 'document-save',
          extra: '',
          kind: 'camera-primary',
        }"
        >{{ "اعتماد الصورة " }}
        <MaterialIcon
          :model="{
            n: 'check',
          }"
      /></ActionButton>
      <ActionButton
        :model="{
          action: 'document-retake',
          extra: '',
          kind: 'camera-secondary',
        }"
        >إعادة التصوير</ActionButton
      ></template
    >
    <template v-else-if="ui.cameraReady"
      ><ActionButton
        :model="{
          action: 'document-shoot',
          kind: 'camera-primary',
        }"
        >التقاط الصورة
        <MaterialIcon
          :model="{
            n: 'photo_camera',
          }" /></ActionButton></template
    ><template v-else
      ><ActionButton
        :model="{
          action: 'document-start',
          extra: '',
          kind: 'camera-primary',
        }"
        >{{ "فتح الكاميرا " }}
        <MaterialIcon
          :model="{
            n: 'photo_camera',
          }" /></ActionButton
    ></template>
  </div>
  <label class="camera-upload"
    >اختيار صورة من الجهاز
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      data-camera-upload=""
      aria-label="اختيار صورة المستمسك من الجهاز"
  /></label>
</template>
