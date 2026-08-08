<template>
  <div class="settings-page">
    <aside class="settings-sidebar">
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: currentSection === item.key }"
          @click="currentSection = item.key"
        >
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <main class="settings-content">
      <GeneralSettings v-if="currentSection === 'general'" />
      <ProviderSettingsPage v-else-if="currentSection === 'models'" />
      <ShortcutSettings v-else-if="currentSection === 'shortcuts'" />
      <DataSettings v-else-if="currentSection === 'data'" />
      <AboutSettings v-else-if="currentSection === 'about'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/modules/settings'
import GeneralSettings from './GeneralSettings.vue'
import ShortcutSettings from './ShortcutSettings.vue'
import DataSettings from './DataSettings.vue'
import AboutSettings from './AboutSettings.vue'
import ProviderSettingsPage from '@/views/model/ProviderSettings.vue'

type SectionKey = 'general' | 'models' | 'shortcuts' | 'data' | 'about'

const route = useRoute()
const settingsStore = useSettingsStore()

const navItems: { key: SectionKey; label: string }[] = [
  { key: 'general', label: '通用' },
  { key: 'models', label: '模型' },
  { key: 'shortcuts', label: '快捷键' },
  { key: 'data', label: '数据' },
  { key: 'about', label: '关于' },
]

const currentSection = ref<SectionKey>('general')

// 支持从路由参数初始化 section
function resolveSection(param?: string): SectionKey {
  const map: Record<string, SectionKey> = {
    general: 'general',
    models: 'models',
    shortcuts: 'shortcuts',
    data: 'data',
    about: 'about',
  }
  return param && map[param] ? map[param] : 'general'
}

onMounted(() => {
  currentSection.value = resolveSection(route.params.section as string | undefined)
  if (!settingsStore.settingsLoaded) {
    settingsStore.loadSettings()
  }
})

watch(
  () => route.params.section,
  (val) => {
    currentSection.value = resolveSection(val as string | undefined)
  }
)
</script>

<style scoped lang="scss">
.settings-page {
  display: flex;
  height: 100%;
  background: var(--bg-primary, #fff);
}

.settings-sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color, #e5e7eb);
  padding: 16px 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  width: 100%;
  text-align: left;
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: var(--bg-hover, #f3f4f6);
    color: var(--text-primary, #111827);
  }

  &.active {
    background: var(--bg-active, #eff6ff);
    color: var(--color-primary, #3b82f6);
    font-weight: 600;
  }
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}
</style>
