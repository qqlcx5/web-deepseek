<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'

const uiStore = useUiStore()
</script>

<template>
  <div v-if="uiStore.toast" class="toast">
    <Icon icon="tabler:circle-check" />
    <span>{{ uiStore.toast }}</span>
    <button v-if="uiStore.undoAction" class="toast-action" @click="uiStore.undo()">撤销</button>
  </div>
</template>

<style scoped>
.toast {
  position: fixed; z-index: 100; bottom: 22px; left: 50%; right: auto;
  display: flex; min-height: 34px; align-items: center; gap: 7px;
  padding: 7px 12px; color: #fff; background: var(--text);
  border-radius: 7px; box-shadow: var(--shadow-lg);
  max-width: min(520px, calc(100vw - 40px)); max-height: 55dvh;
  overflow-y: auto; font-size: 11px; line-height: 1.5; white-space: pre-line;
  transform: translateX(-50%);
}
.toast :deep(svg) { width: 14px; }
.toast-action {
  margin-left: 3px; padding: 3px 7px; color: var(--brand);
  background: transparent; border: 1px solid rgba(255,255,255,0.18);
  border-radius: 4px; font-size: 10px; cursor: pointer;
}
.toast-action:hover { background: rgba(255,255,255,0.08); }
</style>
