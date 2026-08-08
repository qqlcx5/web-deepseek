<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'

const store = useChatStore()
const presets = [
  { name: '技术评审', value: '你是一名资深软件架构师。检查正确性、安全性、可维护性和迁移风险。先给结论，再给执行步骤。' },
  { name: '产品评审', value: '你是一名资深产品经理。围绕用户价值、业务目标、边界条件和验收标准评审需求。' },
  { name: '简洁回答', value: '使用简洁中文回答。先给结论，最多列出五个关键步骤，不重复用户已经知道的信息。' },
]
</script>

<template>
  <section class="dialog">
    <header class="dialog-head">
      <div>
        <div class="dialog-title">系统提示词</div>
        <div class="dialog-subtitle">仅影响当前会话。修改后不会重新生成已有回复。</div>
      </div>
      <button class="icon-btn" @click="store.modal = ''">
        <Icon icon="tabler:x" />
      </button>
    </header>

    <div class="dialog-body">
      <div class="prompt-presets">
        <button
          v-for="preset in presets"
          :key="preset.name"
          class="preset"
          @click="store.promptDraft = preset.value"
        >
          {{ preset.name }}
        </button>
      </div>
      <label class="field-label" for="system-prompt">当前提示词</label>
      <textarea id="system-prompt" v-model="store.promptDraft" class="field-area" />
    </div>

    <footer class="dialog-footer">
      <button class="secondary" @click="store.modal = ''">取消</button>
      <button class="primary" @click="store.savePrompt()">
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
  overflow-y: auto; background: white; border: 1px solid var(--line);
  border-radius: 8px; box-shadow: 0 24px 70px rgba(16, 24, 40, 0.24);
  transform: translate(-50%, -50%);
}
.dialog-head { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
.dialog-title { font-size: 13px; font-weight: 750; }
.dialog-subtitle { margin-top: 3px; color: var(--faint); font-size: 10px; }
.dialog-head .icon-btn { margin-top: -4px; }
.dialog-body { padding: 13px 16px; }
.prompt-presets { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.preset {
  height: 27px; padding: 0 9px; color: #475467; background: var(--surface-2);
  border: 1px solid var(--line); border-radius: 5px; font-size: 10px; cursor: pointer;
}
.preset:hover { border-color: #aaa7ec; color: var(--text); }
.field-label { display: block; margin-bottom: 6px; color: #344054; font-size: 11px; font-weight: 650; }
.field-area {
  width: 100%; height: 120px; resize: vertical; padding: 10px; color: var(--text);
  background: var(--surface-2); border: 1px solid var(--line-strong); border-radius: 6px;
  outline: 0; font-size: 11px; line-height: 1.55; font-family: inherit;
}
.field-area:focus { border-color: #b9b6f7; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 7px; padding: 11px 16px; border-top: 1px solid var(--line); }
.primary {
  display: inline-flex; min-height: 34px; align-items: center; justify-content: center;
  gap: 7px; padding: 0 13px; color: white; background: var(--brand);
  border-radius: 6px; font-size: 12px; font-weight: 600; border: 0; cursor: pointer;
}
.primary:hover { filter: brightness(1.08); }
.secondary {
  display: inline-flex; min-height: 34px; align-items: center; justify-content: center;
  gap: 7px; padding: 0 11px; color: #344054; background: white;
  border: 1px solid var(--line-strong); border-radius: 6px;
  font-size: 12px; font-weight: 600; cursor: pointer;
}
.secondary:hover { background: var(--surface-2); }
.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: #667085; background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
}
</style>
