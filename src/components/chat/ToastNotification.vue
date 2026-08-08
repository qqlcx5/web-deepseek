<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'

const store = useChatStore()
</script>

<template>
  <div v-if="store.toast" class="toast">
    <Icon icon="tabler:circle-check" />
    <span>{{ store.toast }}</span>
    <button v-if="store.undoAction" class="toast-action" @click="store.undo()">撤销</button>
  </div>
</template>

<style scoped>
.toast {
  position: fixed; z-index: 100; bottom: 22px; left: 50%; right: auto;
  display: flex; min-height: 34px; align-items: center; gap: 7px;
  padding: 7px 12px; color: white; background: #1e293b;
  border-radius: 7px; box-shadow: 0 8px 32px rgba(16, 24, 40, 0.28);
  font-size: 11px; transform: translateX(-50%);
  max-width: calc(100vw - 40px);
}
.toast :deep(svg) { width: 14px; }
.toast-action {
  margin-left: 3px; padding: 3px 7px; color: var(--brand);
  background: transparent; border: 1px solid rgba(255,255,255,0.18);
  border-radius: 4px; font-size: 10px; cursor: pointer;
}
.toast-action:hover { background: rgba(255,255,255,0.08); }
</style>
