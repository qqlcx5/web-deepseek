<template>
  <div class="attachment-list">
    <!-- 过滤标签 -->
    <div class="filter-tabs">
      <el-radio-group
        v-model="activeFilter"
        size="small"
        @change="handleFilterChange"
      >
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="image">图片</el-radio-button>
        <el-radio-button value="document">文档</el-radio-button>
        <el-radio-button value="other">其他</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 附件网格/列表 -->
    <div v-if="filteredAttachments.length > 0" class="attachment-grid">
      <div
        v-for="attachment in filteredAttachments"
        :key="attachment.id"
        class="attachment-card"
        @click="handlePreview(attachment)"
      >
        <!-- 图片缩略图 -->
        <div v-if="attachment.fileType === 'image'" class="card-thumb">
          <img
            :src="attachment.thumbnailUrl || attachment.url"
            :alt="attachment.fileName"
            loading="lazy"
          />
        </div>

        <!-- 文件图标 -->
        <div v-else class="card-icon">
          <el-icon :size="32">
            <PictureFilled v-if="attachment.fileType === 'image'" />
            <Document v-else-if="attachment.fileType === 'pdf'" />
            <Tickets v-else-if="attachment.fileType === 'document'" />
            <Notebook v-else-if="attachment.fileType === 'text'" />
            <Monitor v-else-if="attachment.fileType === 'code'" />
            <Folder v-else />
          </el-icon>
        </div>

        <div class="card-info">
          <span class="file-name" :title="attachment.fileName">
            {{ attachment.fileName }}
          </span>
          <span class="file-size">{{ formatSize(attachment.size) }}</span>
        </div>

        <!-- 操作菜单 -->
        <el-dropdown
          trigger="click"
          class="card-menu"
          @command="(cmd: string) => handleCommand(cmd, attachment)"
        >
          <el-button :icon="MoreFilled" circle size="small" @click.stop />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="preview">
                <el-icon><View /></el-icon> 预览
              </el-dropdown-item>
              <el-dropdown-item command="download">
                <el-icon><Download /></el-icon> 下载
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>
                <el-icon><Delete /></el-icon> 删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无附件" :image-size="80" />

    <!-- 附件预览弹窗 -->
    <AttachmentPreview
      v-if="previewAttachment"
      :visible="previewVisible"
      :file-name="previewAttachment.fileName"
      :file-type="previewAttachment.fileType"
      :mime-type="previewAttachment.mimeType"
      :size="previewAttachment.size"
      :url="previewAttachment.url"
      @close="previewVisible = false"
      @download="handleDownload(previewAttachment)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  PictureFilled,
  Document,
  Tickets,
  Notebook,
  Monitor,
  Folder,
  MoreFilled,
  View,
  Download,
  Delete,
} from '@element-plus/icons-vue'
import { useAttachmentStore } from '@/stores/modules/attachment'
import type { Attachment } from '@/types/attachment'
import AttachmentPreview from './AttachmentPreview.vue'

const props = defineProps<{
  conversationId: string
}>()

const attachmentStore = useAttachmentStore()
const activeFilter = ref('all')

const previewVisible = ref(false)
const previewAttachment = ref<Attachment | null>(null)

const attachments = computed(() =>
  attachmentStore.conversationAttachments.get(props.conversationId) || []
)

const filteredAttachments = computed(() => {
  if (activeFilter.value === 'all') return attachments.value
  if (activeFilter.value === 'image') {
    return attachments.value.filter((a) => a.fileType === 'image')
  }
  if (activeFilter.value === 'document') {
    return attachments.value.filter((a) =>
      ['pdf', 'document', 'text'].includes(a.fileType)
    )
  }
  if (activeFilter.value === 'other') {
    return attachments.value.filter((a) =>
      ['code', 'other'].includes(a.fileType)
    )
  }
  return attachments.value
})

function handleFilterChange() {
  // filter is reactive, no extra action needed
}

function handlePreview(attachment: Attachment) {
  previewAttachment.value = attachment
  previewVisible.value = true
}

function handleCommand(cmd: string, attachment: Attachment) {
  switch (cmd) {
    case 'preview':
      handlePreview(attachment)
      break
    case 'download':
      handleDownload(attachment)
      break
    case 'delete':
      attachmentStore.deleteAttachment(attachment.id)
      break
  }
}

function handleDownload(attachment: Attachment) {
  const a = document.createElement('a')
  a.href = attachment.url
  a.download = attachment.fileName
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(() => {
  if (props.conversationId) {
    attachmentStore.fetchAttachments(props.conversationId)
  }
})

watch(
  () => props.conversationId,
  (newId) => {
    if (newId) {
      attachmentStore.fetchAttachments(newId)
    }
  }
)
</script>

<style scoped lang="scss">
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-tabs {
  padding: 4px 0;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.attachment-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .card-menu {
      opacity: 1;
    }
  }
}

.card-thumb {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--el-fill-color-light);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-icon {
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.card-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .file-name {
    font-size: 12px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}

.card-menu {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}
</style>
