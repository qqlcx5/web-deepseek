<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import { searchTopics } from '@/services/search'
import type { Topic } from '@/types'

const chatStore = useChatStore()
const appStore = useAppStore()
const uiStore = useUiStore()

const searchQuery = ref('')
const selectedScope = ref<'all' | 'current'>('all')

interface SearchResult {
  topic: Topic
  assistantName: string
  matchedMessages: { id: string; role: string; content: string }[]
}

const searchResults = computed<SearchResult[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  let topics = appStore.topics

  if (selectedScope.value === 'current' && chatStore.activeAssistantId) {
    topics = topics.filter(t => t.assistantId === chatStore.activeAssistantId)
  }

  if (!query) {
    return topics
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(topic => ({
        topic,
        assistantName: appStore.assistants.find(a => a.id === topic.assistantId)?.name ?? '未知',
        matchedMessages: topic.messages.slice(-2).map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      }))
  }

  return topics
    .filter(topic =>
      topic.name.toLowerCase().includes(query) ||
      topic.messages.some(m => m.content.toLowerCase().includes(query)),
    )
    .map(topic => ({
      topic,
      assistantName: appStore.assistants.find(a => a.id === topic.assistantId)?.name ?? '未知',
      matchedMessages: topic.messages
        .filter(m => m.content.toLowerCase().includes(query))
        .slice(-2)
        .map(m => ({ id: m.id, role: m.role, content: m.content })),
    }))
})

function highlight(text: string): string {
  const query = searchQuery.value.trim()
  if (!query) return escapeHtml(text).slice(0, 200)
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const html = escapeHtml(text).replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="search-highlight">$1</mark>',
  )
  return html
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function openTopic(topicId: string) {
  chatStore.openConversation(topicId)
  emitView('chat')
}

const emit = defineEmits<{ 'switch-view': [view: 'chat' | 'search' | 'settings'] }>()
function emitView(v: 'chat' | 'search' | 'settings') {
  emit('switch-view', v)
}
</script>

<template>
  <section class="search-view scroll">
    <div class="search-container">
      <div class="search-header">
        <div class="search-title-row">
          <div>
            <h1 class="search-heading">搜索历史</h1>
            <p class="search-subtitle">跨 Assistant 和 Topic 搜索消息内容</p>
          </div>
          <div class="search-index-badge">
            <Icon icon="tabler:search" :size="14" />
            MiniSearch 已索引
          </div>
        </div>

        <div class="search-input-row">
          <div class="search-input-wrap">
            <Icon icon="tabler:search" :size="18" class="search-input-icon" />
            <input
              v-model="searchQuery"
              autofocus
              placeholder="搜索 Topic、消息正文……"
              class="search-input"
            />
            <kbd class="search-shortcut">⌘ K</kbd>
          </div>
          <select v-model="selectedScope" class="search-scope">
            <option value="all">全部助手</option>
            <option value="current">当前助手</option>
          </select>
        </div>
      </div>

      <div v-if="searchResults.length" class="search-results">
        <div class="search-result-count">找到 {{ searchResults.length }} 个相关话题</div>

        <article
          v-for="result in searchResults"
          :key="result.topic.id"
          class="search-result-card"
          @click="openTopic(result.topic.id)"
        >
          <div class="search-result-top">
            <div class="search-result-info">
              <div class="search-result-title-row">
                <h2 class="search-result-title">{{ result.topic.name }}</h2>
                <Icon v-if="result.topic.pinned" icon="tabler:pinned" :size="13" class="search-result-pin" />
              </div>
              <div class="search-result-meta">
                {{ result.assistantName }} · {{ result.topic.updatedAt }}
              </div>
            </div>
            <Icon icon="tabler:external-link" :size="16" class="search-result-link" />
          </div>

          <div v-if="result.matchedMessages.length" class="search-result-messages">
            <div
              v-for="msg in result.matchedMessages"
              :key="msg.id"
              class="search-result-message"
            >
              <span
                class="search-result-message-icon"
                :class="msg.role === 'user' ? 'user' : 'assistant'"
              >
                <Icon :icon="msg.role === 'user' ? 'tabler:user' : 'tabler:robot'" :size="13" />
              </span>
              <p
                class="search-result-message-text"
                v-html="highlight(msg.content)"
              />
            </div>
          </div>
        </article>
      </div>

      <div v-else class="search-empty">
        <Icon icon="tabler:search" :size="36" class="search-empty-icon" />
        <h2 class="search-empty-title">没有找到相关内容</h2>
        <p class="search-empty-hint">尝试搜索其他关键词</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.search-view {
  height: 100%;
  overflow-y: auto;
}

.search-container {
  width: min(100%, 1000px);
  margin: 0 auto;
  padding: 32px 20px;
}

@media (min-width: 1024px) {
  .search-container { padding: 32px 40px; }
}

.search-header { margin-bottom: 32px; }

.search-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.search-heading {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.search-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
}

.search-index-badge {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface-2);
  border-radius: 8px;
  font-size: 12px;
  color: var(--muted);
}

@media (min-width: 640px) {
  .search-index-badge { display: flex; }
}

.search-input-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

@media (min-width: 640px) {
  .search-input-row { flex-direction: row; }
}

.search-input-wrap {
  position: relative;
  flex: 1;
}

.search-input-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  color: var(--muted);
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 40px 0 40px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 140ms ease;
}

.search-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 10%, transparent);
}

.search-shortcut {
  position: absolute;
  top: 50%;
  right: 12px;
  display: none;
  padding: 4px 8px;
  background: var(--surface-3);
  border-radius: 4px;
  font-size: 10px;
  color: var(--muted);
  transform: translateY(-50%);
}

@media (min-width: 640px) {
  .search-shortcut { display: block; }
}

.search-scope {
  height: 48px;
  padding: 0 16px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.search-scope:focus {
  border-color: var(--brand);
}

.search-result-count {
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--muted);
}

.search-result-card {
  margin-bottom: 12px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.search-result-card:hover {
  border-color: var(--brand);
  box-shadow: var(--shadow-sm);
}

.search-result-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.search-result-info { min-width: 0; flex: 1; }

.search-result-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-result-title {
  margin: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}

.search-result-pin { color: var(--brand); flex-shrink: 0; }

.search-result-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}

.search-result-link {
  flex-shrink: 0;
  color: var(--muted);
}

.search-result-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.search-result-message {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: 8px;
}

.search-result-message-icon {
  display: flex;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.search-result-message-icon.user {
  color: white;
  background: var(--brand);
}

.search-result-message-icon.assistant {
  color: var(--brand);
  background: var(--surface);
  border: 1px solid var(--line);
}

.search-result-message-text {
  margin: 0;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

:deep(.search-highlight) {
  padding: 0 2px;
  background: color-mix(in srgb, var(--warning) 30%, transparent);
  border-radius: 2px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 380px;
  text-align: center;
}

.search-empty-icon { color: var(--line-strong); }

.search-empty-title {
  margin: 16px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
}

.search-empty-hint {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
}
</style>
