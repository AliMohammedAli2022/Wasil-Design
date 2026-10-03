<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import TermsContent from "./TermsContent.vue";
import { reachedTermsEnd, scrollProgress } from "../services/termsConsent.js";

const emit = defineEmits(["accept"]);
const logo = new URL("assets/logo-mark.svg", document.baseURI).href;
const viewport = ref(null);
const content = ref(null);
const reachedEnd = ref(false);
const progress = ref(0);
let observer;
let disposed = false;
function measure() {
  if (!viewport.value || disposed) return;
  progress.value = scrollProgress(viewport.value);
  if (reachedTermsEnd(viewport.value)) reachedEnd.value = true;
}
function accept() {
  if (reachedEnd.value) emit("accept");
}
onMounted(async () => {
  await nextTick();
  if (disposed) return;
  measure();
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(measure);
    observer.observe(viewport.value);
    observer.observe(content.value);
  }
  document.fonts?.ready.then(measure);
});
onBeforeUnmount(() => {
  disposed = true;
  observer?.disconnect();
});
</script>

<template>
  <div
    role="main"
    class="terms-onboarding"
    dir="rtl"
    aria-labelledby="terms-title"
  >
    <section class="terms-card">
      <div class="terms-heading">
        <div class="terms-brand">
          <img
            class="terms-logo"
            :src="logo"
            width="66"
            height="40"
            alt="شعار واصل"
          />
          <strong>واصل</strong><span>نبدأ بثقة</span>
        </div>
        <h1 id="terms-title">شروط الاستخدام والمسؤولية</h1>
        <p>لحمايتك وحماية الجميع، اطّلع على الشروط قبل إنشاء حسابك.</p>
      </div>
      <div
        class="terms-progress"
        role="progressbar"
        aria-label="التقدم في عرض الشروط"
        :aria-valuenow="Math.round(progress * 100)"
        :aria-valuemin="0"
        :aria-valuemax="100"
      >
        <span :style="{ width: progress * 100 + '%' }"></span>
      </div>
      <div
        ref="viewport"
        class="terms-scroll"
        tabindex="0"
        role="region"
        aria-label="نص الشروط، مرّر للوصول إلى النهاية"
        aria-describedby="terms-scroll-hint"
        @scroll.passive="measure"
      >
        <div ref="content">
          <TermsContent />
          <p class="terms-end">وصلت إلى نهاية الشروط</p>
        </div>
      </div>
      <footer class="terms-footer">
        <p id="terms-scroll-hint" role="status">
          {{
            reachedEnd
              ? "يمكنك الآن الموافقة والمتابعة إلى التسجيل."
              : "مرّر الشروط حتى النهاية لتفعيل زر الموافقة."
          }}
        </p>
        <button
          type="button"
          class="terms-accept"
          :disabled="!reachedEnd"
          @click="accept"
        >
          اطلعت وأوافق
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 5-7 7 7 7M8 12h13" />
          </svg>
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.terms-onboarding {
  min-height: 100svh;
  padding: max(16px, env(safe-area-inset-top)) 16px
    max(16px, env(safe-area-inset-bottom));
  display: grid;
  place-items: center;
  background:
    radial-gradient(ellipse at 95% 0, #00567a1c, transparent 55%),
    radial-gradient(ellipse at 0 100%, #f47d2f20, transparent 55%), #f6f9fa;
}
.terms-card {
  width: min(100%, 720px);
  height: min(
    850px,
    calc(100svh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom))
  );
  min-height: 360px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffffed;
  border: 1px solid #fff;
  border-top: 3px solid #f47d2f;
  border-radius: 28px;
  box-shadow: 0 22px 60px -30px #00567a52;
}
.terms-heading {
  padding: 22px 28px 18px;
}
.terms-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00567a;
}
.terms-logo {
  width: 66px;
  height: 40px;
  object-fit: contain;
}
.terms-brand strong {
  font-size: 24px;
}
.terms-brand > span:last-child {
  margin-inline-start: auto;
  padding: 4px 12px;
  border-radius: 20px;
  background: #fff0e3;
  color: #975021;
  font-size: 12px;
}
.terms-heading h1 {
  color: #00567a;
  font-size: clamp(20px, 4.8vw, 26px);
  line-height: 1.6;
  margin: 16px 0 5px;
}
.terms-heading p {
  color: #607b88;
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
}
.terms-progress {
  height: 3px;
  flex: 0 0 3px;
  background: #eaf2f5;
}
.terms-progress span {
  display: block;
  height: 100%;
  background: #f47d2f;
}
.terms-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #91b2c0 transparent;
  padding: 22px 28px;
  -webkit-overflow-scrolling: touch;
}
.terms-scroll:focus-visible,
.terms-accept:focus-visible {
  outline: 3px solid #f47d2f;
  outline-offset: -3px;
}
.terms-end {
  margin: 24px 0 0;
  text-align: center;
  font-size: 12px;
  color: #617b87;
}
.terms-footer {
  padding: 12px 28px 20px;
  border-top: 1px solid #e0ebf0;
  background: #f8fbfc;
}
.terms-footer p {
  margin: 0 0 10px;
  color: #57717f;
  font-size: 12px;
  line-height: 1.8;
}
.terms-accept {
  width: 100%;
  min-height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border: 0;
  border-radius: 15px;
  background: #00567a;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.terms-accept svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.terms-accept:disabled {
  background: #dce7ec;
  color: #617783;
  cursor: not-allowed;
}
.terms-accept:enabled:hover {
  background: #004563;
}
@media (max-width: 480px) {
  .terms-onboarding {
    padding-inline: 12px;
  }
  .terms-card {
    border-radius: 22px;
  }
  .terms-heading {
    padding: 18px 20px 14px;
  }
  .terms-scroll {
    padding: 18px 20px;
  }
  .terms-footer {
    padding: 12px 20px 16px;
  }
}
@media (max-height: 520px) {
  .terms-card {
    min-height: 280px;
  }
  .terms-heading {
    padding: 10px 18px;
  }
  .terms-brand {
    display: none;
  }
  .terms-heading h1 {
    margin: 0;
    font-size: 20px;
  }
  .terms-footer {
    padding: 8px 18px;
  }
}
:global(html[data-theme="dark"] .terms-onboarding) {
  background:
    radial-gradient(ellipse at 0 100%, #f47d2f10, transparent 55%), #0c1d29;
}
:global(html[data-theme="dark"] .terms-card) {
  background: #142c3d;
  border-color: #2b4657;
  border-top-color: #f47d2f;
}
:global(html[data-theme="dark"] .terms-heading h1),
:global(html[data-theme="dark"] .terms-brand) {
  color: #e5f1f5;
}
:global(html[data-theme="dark"] .terms-heading p),
:global(html[data-theme="dark"] .terms-footer p),
:global(html[data-theme="dark"] .terms-end) {
  color: #b7ccd6;
}
:global(html[data-theme="dark"] .terms-brand > span:last-child) {
  background: #3b3029;
  color: #ffbe89;
}
:global(html[data-theme="dark"] .terms-footer) {
  background: #102534;
  border-color: #2b4657;
}
:global(html[data-theme="dark"] .terms-progress) {
  background: #294758;
}
:global(html[data-theme="dark"] .terms-accept:disabled) {
  background: #294454;
  color: #abc0cb;
}
</style>
