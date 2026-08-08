<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'

const store = useChatStore()
const input = ref<HTMLInputElement | null>(null)

onMounted(() => {
  nextTick(() => input.value?.focus())
})
</script>

<template>
  <section class="dialog command">
    <div class="command-search">
      <Icon icon="tabler:search" />
      <input
        ref="input"
        v-model="store.commandQuery"
        placeholder="搜索对话、文件或输入命令"
        @keydown.esc="store.modal = ''"
      />
      <span class="shortcut">ESC</span>
    </div>

    <div class="command-results scroll">
      <div class="command-group">快捷操作</div>
      <button
        v-for="cmd in store.filteredCommands"
        :key="cmd.title"
        class="command-item"
        @click="store.runCommand(cmd)"
      >
        <Icon :icon="`tabler:${cmd.icon}`" />
        <span class="command-item-copy">
          <span class="command-item-title">{{ cmd.title }}</span>
          <span class="command-item-desc">{{ cmd.description }}</span>
        </span>
        <span v-if="cmd.shortcut" class="shortcut">{{ cmd.shortcut }}</span>
      </button>

      <div v-if="store.filteredCommandChats.length" class="command-group">最近对话</div>
      <button
        v-for="chat in store.filteredCommandChats"
        :key="chat.id"
        class="command-item"
        @click="store.openConversation(chat.id); store.modal = ''"
      >
        <Icon icon="tabler:message" />
        <span class="command-item-copy">
          <span class="command-item-title">{{ chat.title }}</span>
          <span class="command-item-desc">{{ chat.preview }}</span>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.dialog {
  position: fixed; z-index: 80; top: 50%; left: 50%;
  width: min(520px, calc(100vw - 28px)); max-height: min(720px, calc(100dvh - 28px));
  overflow-y: auto; background: var(--surface); border: 1px solid var(--line);
  border-radius: 8px; box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%);
}
.command { width: min(580px, calc(100vw - 24px)); top: 14%; transform: translateX(-50%); }
.command-search { position: relative; border-bottom: 1px solid var(--line); }
.command-search :deep(svg) { position: absolute; top: 17px; left: 16px; width: 17px; color: var(--faint); }
.command-search input { width: 100%; height: 52px; padding: 0 46px; border: 0; outline: 0; font-size: 13px; font-family: inherit; background: transparent; color: var(--text); }
.command-results { max-height: 380px; overflow-y: auto; padding: 7px; }
.command-group { padding: 7px 8px 5px; color: var(--faint); font-size: 9px; font-weight: 700; text-transform: uppercase; }
.command-item { display: flex; width: 100%; min-height: 40px; align-items: center; gap: 10px; padding: 7px 9px; color: var(--text-secondary); background: transparent; border-radius: 5px; text-align: left; border: 0; cursor: pointer; }
.command-item:hover { background: var(--surface-3); }
.command-item :deep(svg) { width: 15px; color: var(--muted); }
.command-item-copy { min-width: 0; flex: 1; }
.command-item-title { display: block; font-size: 11px; font-weight: 650; color: var(--text); }
.command-item-desc { display: block; overflow: hidden; margin-top: 2px; color: var(--faint); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.shortcut { margin-left: auto; padding: 2px 5px; color: var(--faint); background: var(--surface-3); border: 1px solid var(--line); border-radius: 4px; font-size: 10px; }

@media (max-width: 760px) {
  .dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
  .command { top: 8px; right: 8px; bottom: auto; left: 8px; width: auto; max-height: calc(100dvh - 16px); border: 1px solid var(--line); border-radius: 8px; transform: none; }
}
</style>
