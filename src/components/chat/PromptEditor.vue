<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'

const uiStore = useUiStore()
</script>

<template>
  <section class="dialog">
    <header class="dialog-head">
      <div>
        <div class="dialog-title">系统提示词</div>
        <div class="dialog-subtitle">仅影响当前会话。修改后不会重新生成已有回复。</div>
      </div>
      <button class="icon-btn" @click="uiStore.modal = ''">
        <Icon icon="tabler:x" />
      </button>
    </header>

    <div class="dialog-body">
      <div class="prompt-presets">
        <button
          v-for="preset in uiStore.promptPresets"
          :key="preset.name"
          class="preset"
          @click="uiStore.promptDraft = preset.value"
        >
          {{ preset.name }}
        </button>
      </div>
      <label class="field-label" for="system-prompt">当前提示词</label>
      <textarea id="system-prompt" v-model="uiStore.promptDraft" class="field-area" />
    </div>

    <footer class="dialog-footer">
      <button class="secondary" @click="uiStore.modal = ''">取消</button>
      <button class="primary" @click="uiStore.savePrompt()">
        <Icon icon="tabler:check" width="14" />
        保存版本
      </button>
    </footer>
  </section>
</template>

<style scoped>
.dialog {
  position: fixed; z-index: 80; top: 50%; left: 50%;
  width: min(480px, calc(100vw - 28px));
  max-height: min(580px, calc(100dvh - 28px));
  overflow-y: auto; background: var(--surface); border: 1px solid var(--line);
  border-radius: 8px; box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%);
}
.dialog-head { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
.dialog-title { font-size: 13px; font-weight: 750; }
.dialog-subtitle { margin-top: 3px; color: var(--faint); font-size: 10px; }
.dialog-head .icon-btn { margin-top: -4px; }
.dialog-body { padding: 13px 16px; }
.prompt-presets { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.preset {
  height: 27px; padding: 0 9px; color: var(--text-secondary); background: var(--surface-2);
  border: 1px solid var(--line); border-radius: 5px; font-size: 10px; cursor: pointer;
}
.preset:hover { border-color: var(--brand); color: var(--text); }
.field-label { display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 11px; font-weight: 650; }
.field-area {
  width: 100%; height: 120px; resize: vertical; padding: 10px; color: var(--text);
  background: var(--surface-2); border: 1px solid var(--line-strong); border-radius: 6px;
  outline: 0; font-size: 11px; line-height: 1.55; font-family: inherit;
}
.field-area:focus { border-color: var(--brand); }
.dialog-footer { display: flex; justify-content: flex-end; gap: 7px; padding: 11px 16px; border-top: 1px solid var(--line); }
.primary {
  display: inline-flex; min-height: 34px; align-items: center; justify-content: center;
  gap: 7px; padding: 0 13px; color: white; background: var(--brand);
  border-radius: 6px; font-size: 12px; font-weight: 600; border: 0; cursor: pointer;
}
.primary:hover { filter: brightness(1.08); }
.secondary {
  display: inline-flex; min-height: 34px; align-items: center; justify-content: center;
  gap: 7px; padding: 0 11px; color: var(--text-secondary); background: var(--surface);
  border: 1px solid var(--line-strong); border-radius: 6px;
  font-size: 12px; font-weight: 600; cursor: pointer;
}
.secondary:hover { background: var(--surface-2); }
.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
}
</style>
