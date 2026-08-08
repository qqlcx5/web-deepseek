<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div
        v-if="visible"
        class="attachment-preview-overlay"
        @click.self="handleClose"
        @keydown.escape="handleClose"
        tabindex="0"
      >
        <!-- 图片灯箱 -->
        <template v-if="isImage">
          <div class="image-preview">
            <img :src="previewUrl" :alt="fileName" class="preview-image" />
            <div class="preview-toolbar">
              <el-button-group>
                <el-button :icon="ZoomIn" circle @click="handleZoomIn" />
                <el-button :icon="ZoomOut" circle @click="handleZoomOut" />
                <el-button :icon="RefreshRight" circle @click="handleRotate" />
              </el-button-group>
              <el-button :icon="Download" circle @click="handleDownload" />
            </div>
          </div>
        </template>

        <!-- PDF 预览 -->
        <template v-else-if="isPdf">
          <div class="pdf-preview">
            <div class="pdf-toolbar">
              <span class="pdf-title">{{ fileName }}</span>
              <el-button :icon="Download" circle @click="handleDownload" />
            </div>
            <iframe :src="previewUrl" class="pdf-frame" />
          </div>
        </template>

        <!-- 通用文件信息 -->
        <template v-else>
          <div class="file-card-preview">
            <el-icon :size="48" class="file-icon"><Document /></el-icon>
            <div class="file-info">
              <span class="file-name">{{ fileName }}</span>
              <span class="file-size">{{ formatSize(size) }}</span>
            </div>
            <el-button type="primary" :icon="Download" @click="handleDownload">
              下载文件
            </el-button>
          </div>
        </template>

        <!-- 关闭按钮 -->
        <el-button
          class="close-btn"
          :icon="Close"
          circle
          size="large"
          @click="handleClose"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Close,
  ZoomIn,
  ZoomOut,
  RefreshRight,
  Download,
  Document,
} from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  fileName: string
  fileType: string
  mimeType: string
  size: number
  url: string
}>()

const emit = defineEmits<{
  close: []
  download: []
}>()

const isImage = computed(() =>
  props.fileType === 'image' || props.mimeType.startsWith('image/')
)

const isPdf = computed(() => props.mimeType === 'application/pdf')

const previewUrl = computed(() => props.url)

const imageScale = ref(1)
const imageRotation = ref(0)

function handleClose() {
  emit('close')
  imageScale.value = 1
  imageRotation.value = 0
}

function handleZoomIn() {
  imageScale.value = Math.min(imageScale.value + 0.25, 3)
  applyTransform()
}

function handleZoomOut() {
  imageScale.value = Math.max(imageScale.value - 0.25, 0.25)
  applyTransform()
}

function handleRotate() {
  imageRotation.value = (imageRotation.value + 90) % 360
  applyTransform()
}

function applyTransform() {
  const img = document.querySelector('.preview-image') as HTMLElement
  if (img) {
    img.style.transform = `scale(${imageScale.value}) rotate(${imageRotation.value}deg)`
  }
}

function handleDownload() {
  emit('download')
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<script lang="ts">
import { ref } from 'vue'
</script>

<style scoped lang="scss">
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.25s ease;
}
.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.attachment-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

// 图片灯箱
.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 90vw;
  max-height: 90vh;

  .preview-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 8px;
    transition: transform 0.2s ease;
  }

  .preview-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

// PDF 预览
.pdf-preview {
  width: 80vw;
  height: 85vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .pdf-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;

    .pdf-title {
      font-size: 14px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .pdf-frame {
    flex: 1;
    width: 100%;
    border: none;
  }
}

// 通用文件预览
.file-card-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
  background: #fff;
  border-radius: 12px;
  text-align: center;

  .file-icon {
    color: var(--el-color-primary);
  }

  .file-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .file-name {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .file-size {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
