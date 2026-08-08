<script setup lang="ts">
/**
 * TrashPage — 回收站页面
 */
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useConversationStore } from '@/stores/modules/conversation'
import type { ConversationListItem } from '@/types/conversation'

const conversationStore = useConversationStore()

// 加载回收站列表
onMounted(() => {
  conversationStore.fetchDeletedConversations()
})

// 恢复
function handleRestore(id: string) {
  conversationStore.restoreConversation(id)
}

// 永久删除
function handlePermanentDelete(id: string) {
  conversationStore.permanentDelete(id)
}

// 清空回收站
function handleClearTrash() {
  conversationStore.clearTrash()
}
</script>

<template>
  <div class="trash-page">
    <div class="trash-page__header">
      <h2 class="trash-page__title">回收站</h2>
      <el-button
        v-if="conversationStore.deletedConversations.length > 0"
        type="danger"
        plain
        @click="handleClearTrash"
      >
        清空回收站
      </el-button>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="
        !conversationStore.deletedLoading &&
        conversationStore.deletedConversations.length === 0
      "
      description="回收站为空"
    />

    <!-- 加载中 -->
    <div v-if="conversationStore.deletedLoading" class="trash-page__loading">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- 回收站列表 -->
    <div v-else class="trash-page__list">
      <div
        v-for="item in conversationStore.deletedConversations"
        :key="item.id"
        class="trash-page__item"
      >
        <div class="trash-page__item-info">
          <span class="trash-page__item-title">{{ item.title }}</span>
          <span class="trash-page__item-time">
            删除于 {{ new Date(item.updatedAt).toLocaleString() }}
          </span>
        </div>
        <div class="trash-page__item-actions">
          <el-button size="small" text @click="handleRestore(item.id)">
            恢复
          </el-button>
          <el-button size="small" text type="danger" @click="handlePermanentDelete(item.id)">
            永久删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trash-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 0;
  }

  &__loading {
    padding: 16px 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--color-bg-elevated, #fff);
    border: 1px solid var(--color-border-light, #e5e7eb);
    border-radius: 8px;
    transition: box-shadow .2s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
    }
  }

  &__item-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary, #111827);
  }

  &__item-time {
    font-size: 12px;
    color: var(--color-text-muted, #9ca3af);
  }

  &__item-actions {
    display: flex;
    gap: 4px;
  }
}
</style>
