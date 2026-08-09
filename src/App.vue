<script setup lang="ts">
import { watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useTheme } from '@/composables/useTheme'

const appStore = useAppStore()
const { setTheme } = useTheme()

watch(() => appStore.settings.theme, theme => {
  setTheme(theme)
}, { immediate: true })

// Apply fontSize to root element
watch(() => appStore.settings.fontSize, (size) => {
  if (size && size > 0) {
    document.documentElement.style.fontSize = `${size}px`
  }
}, { immediate: true })
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>

<style scoped lang="scss"></style>
