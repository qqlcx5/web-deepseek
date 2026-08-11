<script setup lang="ts">
import { ref, computed } from 'vue'
import { Attachments } from 'vue-element-plus-x'
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const emit = defineEmits<{ filesChange: [files: AttachedFile[]] }>()

export interface AttachedFile {
  id: string
  uid: string
  name: string
  fileSize: number
  fileType?: string
  imgFile?: File
  imgVariant?: 'square' | 'circle'
  showDelIcon?: boolean
  url?: string
  thumbUrl?: string
  description?: string
  status?: 'uploading' | 'error'
}

const files = ref<(AttachedFile & FilesCardProps)[]>([])
const maxFileSize = 10 * 1024 * 1024 // 10MB default

const isOverLimit = computed(() => false)

function beforeUpload(file: File): boolean {
  if (file.size > maxFileSize) {
    ElMessage.error(`文件大小不能超过 ${maxFileSize / 1024 / 1024}MB!`)
    return false
  }
  // Block folders
  if (file.type === '') {
    ElMessage.error('禁止上传文件夹！')
    return false
  }
  return true
}

async function httpRequest(options: { file: File }): Promise<void> {
  const file = options.file
  const id = crypto.randomUUID()
  const fileItem: AttachedFile & FilesCardProps = {
    id,
    uid: id,
    name: file.name,
    fileSize: file.size,
    imgFile: file,
    imgVariant: 'square',
    showDelIcon: true,
    status: 'uploading',
  }
  files.value.push(fileItem)
  emit('filesChange', files.value.map(f => ({ ...f })))

  // Simulate "upload" (local storage — just read file)
  try {
    // For images, create object URL for preview
    if (file.type.startsWith('image/')) {
      fileItem.url = URL.createObjectURL(file)
      fileItem.thumbUrl = fileItem.url
    }
    fileItem.status = 'success' as any
    // Remove status from emitted data since FilesCardProps doesn't have it
    const { status, ...cardProps } = fileItem
    void status
    void cardProps
  } catch (e) {
    fileItem.status = 'error'
    ElMessage.error(`上传失败: ${file.name}`)
  }
  emit('filesChange', files.value.map(f => ({ ...f })))
}

async function handleUploadDrop(droppedFiles: File[], _props: any): Promise<void> {
  if (!droppedFiles?.length) return
  if (droppedFiles[0]?.type === '') {
    ElMessage.error('禁止上传文件夹！')
    return
  }
  for (const f of droppedFiles) {
    if (beforeUpload(f)) {
      await httpRequest({ file: f })
    }
  }
}

function handleDeleteCard(item: FilesCardProps, _index: number): void {
  const target = files.value.find(f => f.uid === item.uid)
  if (target?.url) URL.revokeObjectURL(target.url)
  files.value = files.value.filter(f => f.uid !== item.uid)
  emit('filesChange', files.value.map(f => ({ ...f })))
  ElMessage.success('已删除')
}

function clearAll(): void {
  files.value.forEach(f => { if (f.url) URL.revokeObjectURL(f.url) })
  files.value = []
  emit('filesChange', [])
}

defineExpose({ clearAll, files })
</script>

<template>
  <div class="chat-attachments">
    <Attachments
      :http-request="httpRequest"
      :items="files"
      drag
      overflow="scrollX"
      :before-upload="beforeUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    />
  </div>
</template>

<style scoped lang="scss">
.chat-attachments {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 4px 8px;
}
</style>
