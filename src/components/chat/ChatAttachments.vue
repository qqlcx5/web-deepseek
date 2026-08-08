<script setup lang="ts">
import { Attachments } from 'vue-element-plus-x'

interface FilesCardItem {
  uid?: string | number
  name?: string
  fileSize?: number
  fileType?: string
  description?: string
  url?: string
  status?: 'uploading' | 'done' | 'error'
  percent?: number
}

interface Props {
  items?: FilesCardItem[]
}

withDefaults(defineProps<Props>(), {
  items: () => [],
})

const emit = defineEmits<{
  delete: [item: FilesCardItem, index: number]
}>()

function onDeleteCard(item: FilesCardItem, index: number) {
  emit('delete', item, index)
}
</script>

<template>
  <div class="chat-attachments-wrap">
    <Attachments
      :items="items"
      :hide-upload="true"
      overflow="scrollX"
      @delete-card="onDeleteCard"
    />
  </div>
</template>

<style scoped>
.chat-attachments-wrap {
  width: 100%;
}
</style>
