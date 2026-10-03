<script setup>
import MaterialIcon from "../shell/MaterialIcon.vue";

defineOptions({ inheritAttrs: false });
defineProps({ model: { type: Object, required: true } });
</script>
<template>
  <div class="entry-intro">
    <span class="entry-kicker">كل مشوار يبدأ بخطوة</span>
    <h1>حيّاك بواصل</h1>
    <p>اختار حسابك، وخلّي الباقي علينا.</p>
  </div>
  <div class="glass-role-grid">
    <template v-for="r in ['merchant', 'courier']"
      ><button
        type="button"
        :class="'glass-role ' + r"
        data-action="choose-role"
        :data-role="r"
      >
        <span class="glass-role-icon"
          ><MaterialIcon
            :model="{
              n: r === 'merchant' ? 'storefront' : 'two_wheeler',
            }"
        /></span>
        <strong>{{ model.roleNames[r] }}</strong>
        <span class="role-description"
          ><template v-if="r === 'merchant'">طلباتك بيد أمينة</template>
          <template v-else>كل مشوار، فرصة جديدة</template></span
        >
        <span class="role-enter"
          >{{ "دخول " }}
          {{ model.roleNames[r] }}
          {{ " " }}
          <MaterialIcon
            :model="{
              n: 'arrow_back',
            }"
        /></span></button
    ></template>
  </div>
  <div class="entry-promise">
    <span
      ><MaterialIcon
        :model="{
          n: 'bolt',
        }"
      />
      سهل وسريع</span
    >
    <span
      ><MaterialIcon
        :model="{
          n: 'route',
        }"
      />
      معك بكل خطوة</span
    >
  </div>
</template>
