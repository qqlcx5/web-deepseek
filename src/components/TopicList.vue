<script setup lang="ts">
import { computed, h } from 'vue'
import { Conversations } from 'vue-element-plus-x'
import { useAppStore } from '@/stores/app'
import type { Topic } from '@/types'

const app = useAppStore()
const emit = defineEmits<{ select: [id: string] }>()

// Map topics to Conversations items format
const items = computed(() => {
  return app.sortedTopics.map((topic: Topic) => ({
    key: topic.id,
    label: topic.name,
    pinned: topic.pinned,
    timestamp: topic.updatedAt,
  }))
})

const active = computed({
  get: () => app.activeTopicId ?? undefined,
  set: (val: string | undefined) => { if (val) { app.selectTopic(val); emit('select', val) } },
})

// Built-in menu items
const menu = [
  { key: 'rename', label: '重命名', icon: h('i', { class: 'i-tabler-edit text-sm' }) },
  { key: 'pin', label: '置顶/取消', icon: h('i', { class: 'i-tabler-pin text-sm' }) },
  { key: 'clear', label: '清空消息', icon: h('i', { class: 'i-tabler-trash text-sm' }) },
  { key: 'delete', label: '删除', icon: h('i', { class: 'i-tabler-x text-sm' }), danger: true },
]

function onMenuClick(command: string, item: any) {
  const topicId = String(item.key)
  if (command === 'rename') {
    const newName = window.prompt('重命名话题', item.label)
    if (newName?.trim()) app.renameTopic(topicId, newName.trim())
  } else if (command === 'pin') {
    app.togglePin(topicId)
  } else if (command === 'clear') {
    if (window.confirm('清空所有消息？')) app.clearTopicMessages(topicId)
  } else if (command === 'delete') {
    if (window.confirm('删除话题？此操作不可撤销。')) app.deleteTopic(topicId)
  }
}
</script>

<template>
  <Conversations
    v-model:active="active"
    :items="items"
    :menu="menu"
    :show-built-in-menu="true"
    label-max-width="200"
    show-tooltip
    @menu-command="onMenuClick"
  />
</template>
