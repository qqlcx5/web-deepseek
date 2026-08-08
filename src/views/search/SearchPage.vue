<script setup lang="ts">
/**
 * SearchPage — 全局搜索页（AppLayout 子路由）
 */
import { ref } from 'vue'

const query = ref('')
const results = ref<unknown[]>([])
const searching = ref(false)

function handleSearch() {
  if (!query.value.trim()) return
  searching.value = true
  // 搜索逻辑由 search 模块实现
  setTimeout(() => {
    searching.value = false
    results.value = []
  }, 500)
}
</script>

<template>
  <div class="search-page">
    <div class="search-page__header">
      <el-input
        v-model="query"
        placeholder="搜索对话、消息、文件..."
        size="large"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <span class="search-icon">🔍</span>
        </template>
      </el-input>
    </div>

    <div class="search-page__results">
      <el-empty v-if="!searching && query && results.length === 0" description="未找到相关结果" />
      <el-empty v-else-if="!query" description="输入关键词开始搜索" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    margin-bottom: 24px;
  }

  &__results {
    flex: 1;
    overflow-y: auto;
  }
}

.search-icon {
  font-size: 16px;
}
</style>
