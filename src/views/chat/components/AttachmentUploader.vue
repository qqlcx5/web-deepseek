<template>
  <div class="attachment-uploader">
    <elx-attachments
      v-model="fileList"
      :accept="acceptTypes"
      :max-size="maxSize"
      :multiple="true"
      @change="handleChange"
    >
      <template #default="{ trigger }">
        <div
          class="drop-zone"
          :class="{ 'is-dragover': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="trigger"
        >
          <el-icon :size="32" class="upload-icon"><UploadFilled /></el-icon>
          <p class="drop-text">拖拽文件到此处或点击上传</p>
          <p class="drop-hint">支持图片、PDF、文档、文本、代码文件，单文件最大 20MB</p>
        </div>
      </template>
    </elx-attachments>

    <!-- 上传进度列表 -->
    <div v-if="uploadTasks.length > 0" class="upload-progress-list">
      <div
        v-for="task in uploadTasks"
        :key="task.attachmentId"
        class="upload-progress-item"
      >
        <div class="file-info">
          <el-icon :size="20"><Document /></el-icon>
          <span class="file-name">{{ task.fileName }}</span>
        </div>
        <div class="progress-area">
          <el-progress
            :percentage="task.progress"
            :status="task.status === 'error' ? 'exception' : task.status === 'done' ? 'success' : undefined"
            :stroke-width="6"
          />
          <span v-if="task.status === 'uploading'" class="progress-text">{{ task.progress }}%</span>
          <span v-else-if="task.status === 'processing'" class="progress-text processing">处理中...</span>
          <span v-else-if="task.status === 'done'" class="progress-text done">完成</span>
          <span v-else-if="task.status === 'error'" class="progress-text error">
            {{ task.error || '失败' }}
          </span>
        </div>
        <el-button
          v-if="task.status === 'uploading' || task.status === 'processing'"
          type="danger"
          :icon="Close"
          circle
          size="small"
          @click="handleCancel(task.attachmentId)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled, Document, Close } from '@element-plus/icons-vue'
import { useAttachmentStore } from '@/stores/modules/attachment'

const props = defineProps<{
  conversationId: string
}>()

const emit = defineEmits<{
  uploadComplete: [attachments: import('@/types/attachment').Attachment[]]
}>()

const attachmentStore = useAttachmentStore()
const fileList = ref<any[]>([])
const isDragOver = ref(false)

const acceptTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/markdown', 'text/csv',
  'application/json', 'text/javascript', 'text/typescript',
  'text/html', 'text/css', 'text/x-python', 'text/x-java',
]
const maxSize = 20 * 1024 * 1024

const uploadTasks = attachmentStore.uploadTasks

async function processFiles(files: File[]) {
  if (files.length === 0) return

  const results = await attachmentStore.uploadFiles(props.conversationId, files)
  const successful = results.filter((r) => r !== null)
  if (successful.length > 0) {
    emit('uploadComplete', successful)
  }
}

function handleChange(files: any[]) {
  const rawFiles = files
    .map((f) => f.raw || f)
    .filter((f): f is File => f instanceof File)
  processFiles(rawFiles)
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

function handleCancel(attachmentId: string) {
  attachmentStore.cancelUpload(attachmentId)
}
</script>

<style scoped lang="scss">
.attachment-uploader {
  width: 100%;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &.is-dragover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .upload-icon {
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }

  .drop-text {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin: 0 0 4px;
  }

  .drop-hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    margin: 0;
  }
}

.upload-progress-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;

  .file-info {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-shrink: 1;

    .file-name {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .progress-area {
    flex: 1;
    min-width: 0;

    .progress-text {
      font-size: 11px;
      color: var(--el-text-color-secondary);

      &.processing {
        color: var(--el-color-warning);
      }
      &.done {
        color: var(--el-color-success);
      }
      &.error {
        color: var(--el-color-danger);
      }
    }
  }
}
</style>
