<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { useAppStore } from '@/stores/app'
import { useTheme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'

export type AppView = 'chat' | 'search' | 'settings'

const props = defineProps<{ view: AppView }>()
const emit = defineEmits<{ 'update:view': [value: AppView] }>()

const uiStore = useUiStore()
const appStore = useAppStore()
const { isDark, setTheme } = useTheme()

function selectView(v: AppView) {
  emit('update:view', v)
}

function toggleAppTheme() {
  const theme = isDark.value ? 'light' : 'dark'
  appStore.updateSettings({ theme })
  setTheme(theme)
}
</script>

<template>
  <aside class="rail">
    <div class="rail-logo">
      <Icon icon="tabler:rocket" :size="17" />
    </div>

    <nav class="rail-nav">
      <button
        class="rail-btn"
        :class="{ active: props.view === 'chat' }"
        title="对话"
        aria-label="对话"
        @click="selectView('chat')"
      >
        <Icon icon="tabler:message-circle" :size="20" />
      </button>

      <button
        class="rail-btn"
        :class="{ active: props.view === 'search' }"
        title="搜索"
        aria-label="搜索"
        @click="selectView('search')"
      >
        <Icon icon="tabler:search" :size="20" />
      </button>

      <button
        class="rail-btn"
        :class="{ active: props.view === 'settings' }"
        title="设置"
        aria-label="设置"
        @click="selectView('settings')"
      >
        <Icon icon="tabler:settings" :size="20" />
      </button>
    </nav>

    <div class="rail-bottom">
      <button
        class="rail-btn"
        title="切换主题"
        aria-label="切换主题"
        @click="toggleAppTheme"
      >
        <Icon :icon="isDark ? 'tabler:sun' : 'tabler:moon'" :size="19" />
      </button>

      <div class="rail-avatar">
        <span>L</span>
        <span class="rail-online" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.rail {
  display: flex;
  width: 68px;
  flex: 0 0 68px;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  background: var(--surface);
  border-right: 1px solid var(--line);
}

.rail-logo {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--brand);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 32px;
}

.rail-logo :deep(svg) {
  width: 17px;
  height: 17px;
}

.rail-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rail-btn {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background: transparent;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}

.rail-btn :deep(svg) {
  width: 20px;
  height: 20px;
}

.rail-bottom .rail-btn :deep(svg) {
  width: 19px;
  height: 19px;
}

.rail-btn:hover {
  color: var(--text);
  background: var(--surface-3);
}

.rail-btn.active {
  color: var(--brand);
  background: var(--brand-soft);
}

.rail-bottom {
  display: flex;
  margin-top: auto;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.rail-avatar {
  position: relative;
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  background: var(--surface-3);
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.rail-online {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  background: var(--success);
  border: 2px solid var(--surface);
  border-radius: 50%;
}

@media (max-width: 760px) {
  .rail { display: none; }
}
</style>
