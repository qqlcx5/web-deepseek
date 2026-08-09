<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'

const appStore = useAppStore()
const uiStore = useUiStore()

// Group models by provider name
const modelGroups = computed(() => {
  const groups: Record<string, Array<{
    id: string
    name: string
    providerName: string
    providerId: string
    contextLength?: number
    description?: string
  }>> = {}

  for (const provider of appStore.providers) {
    if (!provider.enabled) continue
    const enabledModels = provider.models.filter(m => m.enabled)
    if (enabledModels.length === 0) continue

    const group = groups[provider.name] ?? (groups[provider.name] = [])
    for (const model of enabledModels) {
      group.push({
        id: model.id,
        name: model.name,
        providerName: provider.name,
        providerId: provider.id,
        contextLength: model.contextLength,
        description: model.description,
      })
    }
  }

  return Object.entries(groups).map(([providerName, models]) => ({
    providerName,
    models,
  }))
})

function selectModel(model: { id: string; providerId: string; name: string; contextLength?: number; description?: string }) {
  uiStore.selectModelById(model.id, model.providerId)
}
</script>

<template>
  <section class="dialog">
    <header class="dialog-head">
      <div>
        <div class="dialog-title">选择模型</div>
        <div class="dialog-subtitle">从已启用的 Provider 中选择模型</div>
      </div>
      <button class="icon-btn" @click="uiStore.modal = ''">
        <Icon icon="tabler:x" />
      </button>
    </header>

    <div class="dialog-body">
      <div class="model-list scroll">
        <template v-for="group in modelGroups" :key="group.providerName">
          <div class="model-group-label">{{ group.providerName }}</div>
          <button
            v-for="model in group.models"
            :key="model.id"
            class="model-option"
            :class="{ selected: uiStore.selectedModel?.id === model.id }"
            @click="selectModel(model)"
          >
            <span class="model-dot" :style="{ backgroundColor: '#4d6bfe' }" />
            <span class="model-copy">
              <span class="model-name">{{ model.name }}</span>
              <span class="model-description">{{ model.description ?? `${group.providerName} · ${model.name}` }}</span>
              <span class="model-tags">
                <span class="tag">{{ group.providerName }}</span>
                <span v-if="model.contextLength" class="tag">{{ Math.round(model.contextLength / 1000) }}K</span>
              </span>
            </span>
            <Icon
              v-if="uiStore.selectedModel?.id === model.id"
              icon="tabler:check"
              width="15"
              class="check-icon"
            />
          </button>
        </template>

        <div v-if="modelGroups.length === 0" class="empty-hint">
          暂无可用模型，请先在 Provider 管理中启用 Provider 和模型
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dialog {
  position: fixed; z-index: 80; top: 50%; left: 50%;
  width: min(420px, calc(100vw - 28px));
  max-height: min(600px, calc(100dvh - 28px));
  overflow-y: auto; background: var(--surface); border: 1px solid var(--line);
  border-radius: 8px; box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%);
}
.dialog-head { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
.dialog-title { font-size: 13px; font-weight: 750; color: var(--text); }
.dialog-subtitle { margin-top: 3px; color: var(--faint); font-size: 10px; }
.dialog-head .icon-btn { margin-top: -4px; }
.dialog-body { padding: 11px; }
.model-list { display: flex; flex-direction: column; gap: 3px; max-height: 480px; overflow-y: auto; }
.model-group-label { padding: 8px 4px 4px; color: var(--faint); font-size: 9px; font-weight: 700; text-transform: uppercase; }
.model-option { display: flex; width: 100%; align-items: flex-start; gap: 10px; padding: 9px; color: var(--text-secondary); background: var(--surface); border: 1px solid var(--line); border-radius: 7px; text-align: left; cursor: pointer; }
.model-option:hover { border-color: var(--brand); }
.model-option.selected { border-color: var(--brand); background: var(--brand-soft); }
.model-dot { width: 10px; height: 10px; flex: 0 0 10px; border-radius: 50%; margin-top: 4px; }
.model-copy { min-width: 0; flex: 1; }
.model-name { font-size: 11px; font-weight: 750; color: var(--text); }
.model-description { margin-top: 2px; color: var(--muted); font-size: 9px; line-height: 1.4; }
.model-tags { display: flex; gap: 4px; margin-top: 5px; }
.tag { padding: 2px 5px; color: var(--muted); background: var(--surface-3); border: 1px solid var(--line); border-radius: 4px; font-size: 8px; }
.check-icon { color: var(--brand); }
.empty-hint { text-align: center; padding: 24px 0; color: var(--faint); font-size: 11px; }

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
}
</style>
