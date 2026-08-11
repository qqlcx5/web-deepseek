<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const app = useAppStore()
const searchQuery = ref('')
const filterAssistant = ref('')

const filteredTopics = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let list = [...app.topics].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  if (filterAssistant.value) {
    list = list.filter(t => t.assistantId === filterAssistant.value)
  }
  if (!q) return list
  return list.filter(topic =>
    topic.name.toLowerCase().includes(q) ||
    topic.messages.some(m => m.content?.toLowerCase().includes(q))
  )
})

function openTopic(topicId: string) {
  app.selectTopic(topicId)
  router.push('/')
}
</script>

<template>
  <main class="search-main">
    <header class="search-header">
      <h1 class="text-lg font-semibold">搜索历史</h1>
    </header>

    <section class="search-body scrollbar">
      <div class="search-container">
        <div class="search-bar">
          <div class="search-input-wrap">
            <i class="i-tabler-search search-icon" />
            <el-input
              v-model="searchQuery"
              placeholder="搜索话题和消息内容..."
              size="large"
              clearable
            />
          </div>
          <el-select v-model="filterAssistant" placeholder="全部助手" size="large" clearable>
            <el-option label="全部助手" value="" />
            <el-option label="Orbit Assistant" value="default" />
          </el-select>
        </div>

        <div class="search-meta">
          {{ searchQuery ? `找到 ${filteredTopics.length} 个相关话题` : '最近话题' }}
        </div>

        <div v-if="filteredTopics.length" class="results-list">
          <button
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="result-card"
            @click="openTopic(topic.id)"
          >
            <div class="result-header">
              <i class="i-tabler-message text-sm text-brand" />
              <span class="result-title">{{ topic.name }}</span>
              <span class="result-time">{{ new Date(topic.updatedAt).toLocaleDateString() }}</span>
            </div>
            <p class="result-preview">
              {{ topic.messages[0]?.content || '暂无消息，点击进入话题开始对话' }}
            </p>
            <div class="result-meta">
              <span class="result-tag">Orbit Assistant</span>
              <span>{{ topic.messages.length }} 条消息</span>
              <span class="result-open">打开话题 →</span>
            </div>
          </button>
        </div>

        <div v-else class="no-results">
          <i class="i-tabler-search-off text-3xl text-slate-300" />
          <div class="font-medium mt-3">没有找到相关内容</div>
          <p class="text-sm text-muted mt-1">尝试使用其他关键词</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.search-main {
  margin-left: 344px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;

  @media (max-width: 759px) {
    margin-left: 0;
  }
}

.search-header {
  display: flex;
  align-items: center;
  height: 60px;
  shrink: 0;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  background: #fff;
}

.search-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px 20px;
}

.search-container {
  max-width: 900px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 639px) {
    flex-direction: column;
  }
}

.search-input-wrap {
  flex: 1;
  position: relative;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    color: #667085;
    pointer-events: none;
  }

  :deep(.el-input__wrapper) {
    padding-left: 36px;
    border-radius: 12px;
  }
}

.search-meta {
  margin-bottom: 16px;
  font-size: 12px;
  color: #667085;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  width: 100%;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 16px;
  text-align: left;
  box-shadow: 0 1px 3px rgba(16,24,40,0.06);
  transition: all 0.15s;

  &:hover {
    border-color: #5b56d6;
    box-shadow: 0 4px 12px rgba(16,24,40,0.1);
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-title {
  font-weight: 500;
}

.result-time {
  margin-left: auto;
  font-size: 12px;
  color: #667085;
}

.result-preview {
  font-size: 14px;
  line-height: 1.5;
  color: #667085;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: #667085;
}

.result-tag {
  border-radius: 6px;
  background: #efefff;
  padding: 2px 8px;
  color: #5b56d6;
}

.result-open {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s;

  .result-card:hover & { opacity: 1; }
}

.no-results {
  border-radius: 16px;
  border: 1px dashed #e5e7eb;
  background: #fff;
  padding: 80px 0;
  text-align: center;
}
</style>
