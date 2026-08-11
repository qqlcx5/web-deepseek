<script setup lang="ts">
import { computed } from 'vue'
import { ConfigProvider } from 'vue-element-plus-x'
import { useAppStore } from '@/stores/app'

const app = useAppStore()

const themeOverrides = computed(() => ({
  common: {
    'color-primary': '#5b56d6',
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
