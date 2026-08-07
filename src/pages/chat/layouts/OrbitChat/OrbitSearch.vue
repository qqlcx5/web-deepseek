<!--
  Orbita AI 全局搜索弹窗
  Cmd+K / Ctrl+K 触发，支持标题/消息搜索、高亮、高级筛选、结果跳转
-->
<script setup lang="ts">
import type { OrbitState } from './useOrbitState';

const props = defineProps<{ state: OrbitState }>();
const { state } = props;
const searchInput = ref<HTMLInputElement | null>(null);

const scopeTabs = [
  { key: 'all' as const, label: '全部' },
  { key: 'title' as const, label: '标题' },
  { key: 'messages' as const, label: '消息' },
];

const tagOptions = computed(() => {
  const set = new Set<string>();
  for (const c of state.chats.value) {
    for (const t of c.tags ?? []) {
      if (t) set.add(t);
    }
  }
  return Array.from(set);
});

const modelOptions = computed(() => {
  return state.models.value.map(m => m.name || m.id);
});

function focusInput() {
  setTimeout(() => searchInput.value?.focus(), 60);
}

function highlightText(text: string, query: string): string {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function getSnippet(content: string, query: string, maxLen = 120): string {
  if (!query || !content) return content.slice(0, maxLen);
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, maxLen);
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + query.length + 60);
  let snip = content.slice(start, end);
  if (start > 0) snip = '…' + snip;
  if (end < content.length) snip += '…';
  return snip;
}

watch(() => state.searchQuery.value, () => {
  state.runSearch();
});
</script>

<template>
  <teleport to="body">
    <!-- overlay -->
    <div
      v-if="state.searchOpen.value"
      class="orbit-search-overlay"
      @click.self="state.closeSearch()"
    />

    <!-- search dialog -->
    <div
      v-if="state.searchOpen.value"
      class="orbit-search"
      @vue:mounted="focusInput"
    >
      <!-- search input -->
      <div class="orbit-search-input-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref="searchInput"
          v-model="state.searchQuery.value"
          type="text"
          placeholder="搜索对话与消息…"
          class="orbit-search-input"
        />
        <span class="orbit-search-kbd">ESC</span>
      </div>

      <!-- scope tabs -->
      <div class="orbit-search-tabs">
        <button
          v-for="tab in scopeTabs"
          :key="tab.key"
          class="orbit-search-tab"
          :class="{ active: state.searchScope.value === tab.key }"
          @click="state.searchScope.value = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- advanced filters -->
      <details class="orbit-search-filters">
        <summary class="orbit-search-filters-summary">高级筛选</summary>
        <div class="orbit-search-filters-body">
          <div class="orbit-search-filter-item">
            <label class="orbit-search-filter-label">模型</label>
            <select v-model="state.searchFilters.value.model" class="orbit-search-filter-select" @change="state.runSearch()">
              <option value="">全部</option>
              <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="orbit-search-filter-item">
            <label class="orbit-search-filter-label">标签</label>
            <select v-model="state.searchFilters.value.tag" class="orbit-search-filter-select" @change="state.runSearch()">
              <option value="">全部</option>
              <option v-for="t in tagOptions" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="orbit-search-filter-item">
            <label class="orbit-search-filter-label">开始时间</label>
            <input
              v-model="state.searchFilters.value.timeStart"
              type="date"
              class="orbit-search-filter-input"
              @change="state.runSearch()"
            />
          </div>
          <div class="orbit-search-filter-item">
            <label class="orbit-search-filter-label">结束时间</label>
            <input
              v-model="state.searchFilters.value.timeEnd"
              type="date"
              class="orbit-search-filter-input"
              @change="state.runSearch()"
            />
          </div>
        </div>
      </details>

      <!-- results -->
      <div class="orbit-search-body orbit-scroll">
        <div v-if="!state.searchQuery.value.trim()" class="orbit-search-empty">
          输入关键词开始搜索…
        </div>
        <div
          v-else-if="state.searchResults.value.length === 0"
          class="orbit-search-empty"
        >
          未找到相关结果
        </div>
        <div v-else class="orbit-search-results">
          <div
            v-for="result in state.searchResults.value"
            :key="result.id"
            class="orbit-search-result"
            @click="state.jumpToSearchResult(result)"
          >
            <div class="orbit-search-result-icon">
              <svg
                v-if="result.matchType === 'title'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div class="orbit-search-result-body">
              <div class="orbit-search-result-title">
                <span class="orbit-search-result-topic">{{ result.topicTitle }}</span>
                <span v-if="result.matchType === 'title'" class="orbit-search-result-tag">标题</span>
                <span v-else-if="result.messageRole" class="orbit-search-result-tag">
                  {{ result.messageRole === 'user' ? '我' : 'AI' }}
                  <span v-if="result.messageTime">&nbsp;·&nbsp;{{ result.messageTime }}</span>
                </span>
              </div>
              <div
                class="orbit-search-result-snippet"
                v-html="
                  result.matchType === 'title'
                    ? highlightText(result.matchContent, state.searchQuery.value)
                    : highlightText(getSnippet(result.matchContent, state.searchQuery.value), state.searchQuery.value)
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.orbit-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 75;
  background: rgba(16, 24, 40, 0.34);
  backdrop-filter: blur(2px);
}

.orbit-search {
  position: fixed;
  z-index: 80;
  top: 10%;
  left: 50%;
  width: min(620px, calc(100vw - 24px));
  max-height: 78vh;
  background: var(--surface);
  border-radius: var(--orbit-radius-md);
  box-shadow: 0 24px 60px rgba(16, 24, 40, 0.18);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// input row
.orbit-search-input-row {
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 48px 0 16px;
  border-bottom: 1px solid var(--line);

  svg {
    position: absolute;
    left: 16px;
    width: 16px;
    height: 16px;
    color: var(--muted);
  }
}
.orbit-search-input {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0 0 0 24px;
  font-size: 14px;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--text);

  &::placeholder {
    color: var(--muted);
  }
}
.orbit-search-kbd {
  position: absolute;
  right: 14px;
  padding: 1px 6px;
  font-size: 10px;
  color: var(--muted);
  background: var(--surface-2);
  border-radius: 4px;
}

// tabs
.orbit-search-tabs {
  display: flex;
  gap: 0;
  padding: 0 12px;
  border-bottom: 1px solid var(--line);
}
.orbit-search-tab {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;

  &:hover {
    color: var(--text);
  }
  &.active {
    color: var(--brand);
    border-bottom-color: var(--brand);
  }
}

// advanced filters
.orbit-search-filters {
  border-bottom: 1px solid var(--line);
}
.orbit-search-filters-summary {
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  user-select: none;

  &:hover {
    color: var(--text);
  }
}
.orbit-search-filters-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px 14px 14px;
}
.orbit-search-filter-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.orbit-search-filter-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.orbit-search-filter-select,
.orbit-search-filter-input {
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
  color: var(--text);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 4px;
  outline: 0;

  &:focus {
    border-color: #8a85e3;
    box-shadow: var(--orbit-focus-ring);
  }
}

// body
.orbit-search-body {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  min-height: 120px;
  max-height: 50vh;
}
.orbit-search-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  font-size: 12px;
  color: var(--muted);
}

// results
.orbit-search-results {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.orbit-search-result {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: var(--surface-2);
  }
}
.orbit-search-result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--brand-soft);
  color: var(--brand);
  border-radius: 5px;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
  }
}
.orbit-search-result-body {
  flex: 1;
  min-width: 0;
}
.orbit-search-result-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}
.orbit-search-result-topic {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orbit-search-result-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface-3);
  border-radius: 3px;
  white-space: nowrap;
}
.orbit-search-result-snippet {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  :deep(mark) {
    background: rgba(138, 133, 227, 0.2);
    color: var(--brand);
    border-radius: 2px;
    padding: 0 1px;
  }
}

// 移动端
@media (max-width: 760px) {
  .orbit-search {
    top: 6%;
    right: 8px;
    left: 8px;
    width: auto;
    transform: none;
    max-height: 85vh;
  }
  .orbit-search-filters-body {
    grid-template-columns: 1fr;
  }
}
</style>
