<script setup lang="ts">
/**
 * ConversationList — 对话列表容器
 * 基于 Element-Plus-X Conversations 组件
 */
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Conversations } from 'vue-element-plus-x'
import { Plus, Search } from '@element-plus/icons-vue'
import { useConversationStore } from '@/stores/modules/conversation'
import { useWorkspaceStore } from '@/stores/modules/workspace'
import type { ConversationListItem } from '@/types/conversation'

const router = useRouter()
const route = useRoute()
const conversationStore = useConversationStore()
const workspaceStore = useWorkspaceStore()

// 当前活跃对话 ID
const activeId = ref<string | null>(null)
watch(
  () => route.params.conversationId,
  (id) => {
    activeId.value = (id as string) ?? null
  },
  { immediate: true }
)

// 多选模式
const batchMode = ref(false)
const selectedIds = ref<string[]>([])

// DOM 引用，用于 IntersectionObserver 无限滚动
const listRef = ref<HTMLElement | null>(null)

// 工作区切换时重新加载对话列表
watch(
  () => workspaceStore.currentWorkspaceId,
  (wid) => {
    if (wid) {
      conversationStore.fetchConversations(wid)
    }
  }
)

// 新建对话
async function handleCreate() {
  const conv = await conversationStore.createConversation()
  if (conv) {
    router.push(`/chat/${conv.id}`)
  }
}

// 选择对话
function handleSelect(id: string) {
  router.push(`/chat/${id}`)
}

// 置顶
function handlePin(id: string) {
  conversationStore.togglePin(id)
}

// 菜单命令
function handleMenuCommand(command: string, id: string) {
  switch (command) {
    case 'pin':
      conversationStore.togglePin(id)
      break
    case 'rename': {
      // 触发内联编辑（Conversations 组件内置）
      break
    }
    case 'archive':
      conversationStore.toggleArchive(id)
      break
    case 'delete':
      conversationStore.deleteConversation(id)
      break
  }
}

// 批量操作
function handleBatchDelete() {
  if (selectedIds.value.length > 0) {
    conversationStore.batchOperation(selectedIds.value, 'delete')
    batchMode.value = false
    selectedIds.value = []
  }
}

function handleBatchArchive() {
  if (selectedIds.value.length > 0) {
    conversationStore.batchOperation(selectedIds.value, 'archive')
    batchMode.value = false
    selectedIds.value = []
  }
}

// 无限滚动
function handleLoadMore() {
  conversationStore.loadMore()
}

// 进入搜索
function handleSearch() {
  router.push('/search')
}

// 初始化
onMounted(() => {
  if (workspaceStore.currentWorkspaceId) {
    conversationStore.fetchConversations(workspaceStore.currentWorkspaceId)
  }
})
</script>

<template>
  <div ref="listRef" class="conversation-list">
    <!-- 顶部操作栏 -->
    <div class="conversation-list__header">
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新建对话
      </el-button>
      <el-button :icon="Search" circle @click="handleSearch" />
    </div>

    <!-- Conversations 组件 -->
    <div class="conversation-list__body">
      <!-- 空状态 -->
      <el-empty
        v-if="!conversationStore.loading && conversationStore.conversations.length === 0"
        description="暂无对话，点击上方按钮创建"
      />

      <!-- 对话列表 -->
      <Conversations
        v-else
        v-loading="conversationStore.loading"
        :items="conversationStore.conversations"
        :active="activeId"
        :pinned-ids="conversationStore.pinnedConversations.map(c => c.id)"
        :show-built-in-menu="true"
        :batch-mode="batchMode"
        :selected-ids="selectedIds"
        :has-more="conversationStore.hasMore"
        @select="handleSelect"
        @pin="handlePin"
        @menu-command="handleMenuCommand"
        @load-more="handleLoadMore"
        @update:selected-ids="selectedIds = $event"
      >
        <!-- 自定义列表项内容 -->
        <template #default="{ item }">
          <div class="conversation-item">
            <div class="conversation-item__title">{{ item.title }}</div>
            <div class="conversation-item__preview">
              {{ item.lastMessagePreview ?? '' }}
            </div>
            <div class="conversation-item__time">
              {{ item.updatedAt }}
            </div>
          </div>
        </template>
      </Conversations>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="batchMode && selectedIds.length > 0" class="conversation-list__batch-bar">
      <span class="conversation-list__batch-count">
        已选择 {{ selectedIds.length }} 个对话
      </span>
      <div class="conversation-list__batch-actions">
        <el-button size="small" @click="handleBatchArchive">批量归档</el-button>
        <el-button size="small" type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.conversation-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-sidebar, #f9fafb);

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-light, #e5e7eb);

    .el-button {
      flex-shrink: 0;
    }

    .el-button--primary {
      flex: 1;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  &__batch-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--color-bg-elevated, #fff);
    border-top: 1px solid var(--color-border-light, #e5e7eb);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, .05);
  }

  &__batch-count {
    font-size: 13px;
    color: var(--color-text-secondary, #6b7280);
  }

  &__batch-actions {
    display: flex;
    gap: 8px;
  }
}

.conversation-item {
  flex: 1;
  min-width: 0;

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary, #111827);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__preview {
    font-size: 12px;
    color: var(--color-text-muted, #9ca3af);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
  }

  &__time {
    font-size: 11px;
    color: var(--color-text-muted, #9ca3af);
    margin-top: 2px;
  }
}
</style>
