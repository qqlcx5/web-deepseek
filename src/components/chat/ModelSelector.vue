<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'

const store = useChatStore()
</script>

<template>
  <section class="dialog">
    <header class="dialog-head">
      <div>
        <div class="dialog-title">选择模型</div>
        <div class="dialog-subtitle">价格为估算值，最终消耗以模型服务商账单为准。</div>
      </div>
      <button class="icon-btn" @click="store.modal = ''">
        <Icon icon="tabler:x" />
      </button>
    </header>

    <div class="dialog-body">
      <div class="model-list">
        <button
          v-for="model in store.models"
          :key="model.id"
          class="model-option"
          :class="{ selected: store.selectedModel?.id === model.id }"
          @click="store.selectModel(model)"
        >
          <span class="model-dot" :style="{ backgroundColor: model.color }" />
          <span class="model-copy">
            <span class="model-name">{{ model.name }}</span>
            <span class="model-description">{{ model.description }}</span>
            <span class="model-tags">
              <span v-for="tag in model.tags" :key="tag" class="tag">{{ tag }}</span>
            </span>
          </span>
          <Icon
            v-if="store.selectedModel?.id === model.id"
            icon="tabler:check"
            width="15"
            class="check-icon"
          />
        </button>
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
.model-list { display: grid; gap: 7px; }
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

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
}
</style>
