<script setup lang="ts">
import { computed, h } from 'vue'
import { Conversations } from 'vue-element-plus-x'
import type { ConversationMenuCommand } from 'vue-element-plus-x/types/Conversations'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const emit = defineEmits<{ select: [id: string] }>()

// Map topics to Conversations items format
const items = computed(() => {
  return app.sortedTopics.map((topic) => ({
    key: topic.id,
    label: topic.name,
  }))
})

const active = computed({
  get: () => app.activeTopicId ?? '',
  set: (val: string) => { if (val) { app.selectTopic(val); emit('select', val) } },
})

function onMenuClick(command: ConversationMenuCommand, item: any) {
  const topicId = String(item.key)
  if (command === 'rename') {
    const newName = window.prompt('重命名话题', item.label)
    if (newName?.trim()) app.renameTopic(topicId, newName.trim())
  } else if (command === 'delete') {
    if (window.confirm('删除话题？此操作不可撤销。')) app.deleteTopic(topicId)
  }
}
</script>

<template>
  <Conversations
    v-model:active="active"
    :items="items"
    :label-max-width="200"
    row-key="key"
    show-tooltip
    show-built-in-menu
    @menu-command="onMenuClick"
  />
</template>
