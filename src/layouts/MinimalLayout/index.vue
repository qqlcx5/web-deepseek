<script setup lang="ts">
/**
 * MinimalLayout — 最小布局（无导航栏，纯内容）
 *
 * 用于 404 / 分享页等场景
 */
</script>

<template>
  <div class="minimal-layout">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.minimal-layout {
  min-height: 100vh;
  background: var(--color-bg, #fff);
}
</style>
