<script setup lang="ts">
import { computed } from 'vue'
import { ConfigProvider } from 'vue-element-plus-x'
import { useAppStore } from '@/stores/app'

const app = useAppStore()

const themeOverrides = computed(() => ({
  common: {
    'color-primary': app.settings.userTheme?.colorPrimary || '#5b56d6',
  },
}))
</script>

<template>
  <ConfigProvider
    :theme="app.isDark ? 'dark' : 'light'"
    :theme-overrides="themeOverrides"
    namespace="elx"
    apply-to="root"
  >
    <RouterView />
    <component :is="'style'" v-if="app.settings.customCss" v-html="app.settings.customCss" />
  </ConfigProvider>
</template>

<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  color: #172033;
  background: #f8fafc;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
}
</style>
