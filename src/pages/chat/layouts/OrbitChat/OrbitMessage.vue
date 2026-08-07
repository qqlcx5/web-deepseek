<!--
  Orbit 消息渲染（Element-Plus-X BubbleList + x-markdown-vue）
  - assistant: avatar + MarkdownRenderer + sources + artifact + footer 工具栏
  - user: Bubble + time + footer 工具栏
  功能：重新生成 / 编辑 / 继续 / 点赞点踩 / 删除 / 分支 / 代码复制 / 折叠 / 错误重试
-->
<script setup lang="ts">
import type { OrbitMessage } from './orbitData';
import type { OrbitState } from './useOrbitState';
import { Bubble } from 'vue-element-plus-x';
import { MarkdownRenderer } from 'x-markdown-vue';
import { computed, nextTick, watch } from 'vue';

const props = defineProps<{
  message: OrbitMessage;
  state: OrbitState;
  isLastAssistant: boolean;
}>();

const { message, state, isLastAssistant } = props;

/** 判断是否折叠：assistant 消息超过 800 字符 */
const COLLAPSE_THRESHOLD = 800;
const PREVIEW_LENGTH = 500;

const collapsed = computed(() => {
  if (message.role !== 'assistant') return false;
  if (message.content.length <= COLLAPSE_THRESHOLD) return false;
  return (state.isCollapsed as Map<string, boolean>).get(message.id) !== false;
});

const displayContent = computed(() => {
  if (message.role !== 'assistant') return message.content;
  if (!collapsed.value) return message.content;
  return message.content.slice(0, PREVIEW_LENGTH) + '…';
});

function toggleCollapse() {
  const map = state.isCollapsed as Map<string, boolean>;
  map.set(message.id, !collapsed.value);
}

// 代码块注入复制按钮
function injectCodeCopyButtons() {
  nextTick(() => {
    const container = document.querySelector(`[data-msg-id="${message.id}"]`);
    if (!container) return;
    container.querySelectorAll('.orbit-markdown pre').forEach((pre) => {
      if (pre.querySelector('.orbit-code-copy')) return;
      const btn = document.createElement('button');
      btn.className = 'orbit-code-copy';
      btn.title = '复制代码';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`;
      btn.onclick = () => {
        const code = pre.querySelector('code')?.textContent || '';
        navigator.clipboard?.writeText(code).then(() => {
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1500);
        });
      };
      pre.appendChild(btn);
    });
  });
}

// 内容变化时重新注入
watch(() => message.content, () => {
  if (message.role === 'assistant') injectCodeCopyButtons();
});
</script>

<template>
  <article
    class="orbit-message"
    :class="{ 'orbit-message-user': message.role === 'user' }"
    :data-msg-id="message.id"
  >
    <!-- assistant -->
    <template v-if="message.role === 'assistant'">
      <div class="orbit-avatar orbit-avatar-assistant">AI</div>
      <div class="orbit-message-body">
        <!-- typing/loading -->
        <div v-if="message.status === 'streaming' && !message.content" class="orbit-typing">
          <span /><span /><span />
        </div>

        <!-- markdown via x-markdown-vue -->
        <div v-else-if="displayContent" class="orbit-markdown">
          <MarkdownRenderer
            :markdown="displayContent"
            :enable-animate="true"
          />
        </div>

        <!-- 折叠展开按钮 -->
        <button
          v-if="message.content.length > COLLAPSE_THRESHOLD"
          class="orbit-collapse-toggle"
          @click="toggleCollapse"
        >
          {{ collapsed ? '展开全部' : '收起' }}
        </button>

        <!-- 流式进行中标记 -->
        <span
          v-if="message.status === 'streaming' && message.content"
          class="orbit-streaming-cursor"
        />

        <!-- 错误状态 -->
        <div v-if="message.status === 'error'" class="orbit-error">
          <span class="orbit-error-icon">!</span>
          <span>请求失败</span>
          <button class="orbit-error-retry" @click="state.regenerateMessage()">重试</button>
        </div>

        <!-- sources -->
        <div v-if="(message as any).sources?.length" class="orbit-sources">
          <div class="orbit-sources-label">引用来源</div>
          <div class="orbit-source-list">
            <a
              v-for="source in (message as any).sources"
              :key="source.index"
              :href="source.url"
              class="orbit-source"
              target="_blank"
            >
              <span class="orbit-source-index">{{ source.index }}</span>
              <div>
                <div class="orbit-source-title">{{ source.title }}</div>
                <div class="orbit-source-snippet">{{ source.snippet }}</div>
              </div>
            </a>
          </div>
        </div>

        <!-- artifact -->
        <div v-if="(message as any).artifact" class="orbit-artifact">
          <div class="orbit-artifact-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h5" />
            </svg>
          </div>
          <div class="orbit-artifact-info">
            <div class="orbit-artifact-title">{{ (message as any).artifact.title }}</div>
            <div class="orbit-artifact-meta">
              {{ (message as any).artifact.size }} · {{ (message as any).artifact.type }}
            </div>
          </div>
          <button class="secondary">打开</button>
        </div>

        <!-- footer 工具栏 -->
        <div class="orbit-message-tools">
          <button class="orbit-message-tool tooltip" data-tip="复制" @click="state.copyMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
          </button>
          <button
            class="orbit-message-tool tooltip"
            :class="{ active: (message as any).rating === 'up' }"
            data-tip="有帮助"
            @click="state.rateMessage(message, 'up')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M7 11v9H4v-9zM7 11l5-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.4l-1.5 6A2 2 0 0 1 19.5 20H7" />
            </svg>
          </button>
          <button
            class="orbit-message-tool tooltip"
            :class="{ active: (message as any).rating === 'down' }"
            data-tip="没帮助"
            @click="state.rateMessage(message, 'down')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 13V4h3v9zM17 13l-5 7a2 2 0 0 1-2-2v-4H5a2 2 0 0 1-2-2.4l1.5-6A2 2 0 0 1 4.5 4H17" />
            </svg>
          </button>
          <button
            v-if="isLastAssistant"
            class="orbit-message-tool tooltip"
            data-tip="重新生成"
            @click="state.regenerateMessage()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          <button class="orbit-message-tool tooltip" data-tip="继续" @click="state.continueFrom(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button class="orbit-message-tool tooltip" data-tip="从这里分支" @click="state.branchFrom(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="6" cy="6" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
              <path d="M6 8v8M8 18h8" />
            </svg>
          </button>
          <button class="orbit-message-tool tooltip orbit-tool-danger" data-tip="删除" @click="state.deleteMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </button>
          <div v-if="(message as any).branches > 1" class="orbit-branch-switcher">
            <button class="orbit-branch-btn">&lt;</button>
            <span>{{ (message as any).activeBranch }} / {{ (message as any).branches }}</span>
            <button class="orbit-branch-btn">&gt;</button>
          </div>
        </div>
      </div>
    </template>

    <!-- user -->
    <template v-else>
      <div class="orbit-message-body orbit-message-body-user">
        <!-- 编辑模式 -->
        <template v-if="state.editingMessageId === message.id">
          <textarea
            v-model="state.editDraft"
            class="orbit-edit-textarea"
            rows="3"
          />
          <div class="orbit-edit-actions">
            <button class="orbit-edit-btn orbit-edit-confirm" @click="state.confirmEditMessage()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              确认
            </button>
            <button class="orbit-edit-btn orbit-edit-cancel" @click="state.cancelEditMessage()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              取消
            </button>
          </div>
        </template>
        <!-- 正常模式 -->
        <template v-else>
          <Bubble
            placement="end"
            :content="message.content"
            variant="filled"
            shape="corner"
          />
          <!-- 附件缩略图 -->
          <div v-if="(message as any).attachments?.length" class="orbit-msg-attachments">
            <div
              v-for="att in (message as any).attachments"
              :key="att.id"
              class="orbit-msg-attachment"
            >
              <img v-if="att.dataUrl" :src="att.dataUrl" :alt="att.name" />
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
          </div>
        </template>
        <div class="orbit-message-tools orbit-message-tools-user">
          <button class="orbit-message-tool tooltip" data-tip="复制" @click="state.copyMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
          </button>
          <button class="orbit-message-tool tooltip" data-tip="编辑" @click="state.startEditMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="M15 5l4 4" />
            </svg>
          </button>
          <button class="orbit-message-tool tooltip orbit-tool-danger" data-tip="删除" @click="state.deleteMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </button>
        </div>
        <div class="orbit-user-time">{{ message.time }}</div>
      </div>
      <div class="orbit-avatar orbit-avatar-user">我</div>
    </template>
  </article>
</template>

<style scoped lang="scss">
.orbit-message {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 11px;
  margin-bottom: 28px;
}
.orbit-message-user {
  grid-template-columns: minmax(0, 1fr) 30px;
}
.orbit-message-body {
  min-width: 0;
}
.orbit-message-body-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

// —— Avatar ——
.orbit-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 7px;
}
.orbit-avatar-assistant {
  color: var(--orbit-avatar-color);
  background: var(--orbit-assistant-bg);
  border: 1px solid #c8c5fa;
}
.orbit-avatar-user {
  background: var(--orbit-avatar-bg);
  color: var(--orbit-avatar-color);
}

// —— Typing ——
.orbit-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;

  span {
    width: 5px;
    height: 5px;
    background: #8580dd;
    border-radius: 50%;
    animation: orbit-typing 1.2s infinite;
  }
  span:nth-child(2) { animation-delay: 140ms; }
  span:nth-child(3) { animation-delay: 280ms; }
}
@keyframes orbit-typing {
  0%, 65%, 100% { opacity: 0.35; transform: translateY(0); }
  32% { opacity: 1; transform: translateY(-3px); }
}

// 流式光标
.orbit-streaming-cursor {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: var(--brand);
  margin-left: 2px;
  animation: orbit-blink 0.8s infinite;
  vertical-align: text-bottom;
}
@keyframes orbit-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

// —— 折叠 ——
.orbit-collapse-toggle {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--brand);
  cursor: pointer;
  background: none;
  border: none;
  padding: 2px 0;
  &:hover {
    text-decoration: underline;
  }
}

// —— 错误 ——
.orbit-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-top: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 12px;
  color: #dc2626;
}
.orbit-error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  font-weight: 700;
  font-size: 10px;
  flex-shrink: 0;
}
.orbit-error-retry {
  margin-left: auto;
  padding: 3px 10px;
  font-size: 11px;
  color: #dc2626;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #fef2f2;
  }
}

// —— Markdown (x-markdown-vue) ——
.orbit-markdown {
  font-size: 13px;
  line-height: 1.75;
  color: #344054;

  :deep(pre) {
    position: relative;
  }
  // 代码块复制按钮
  :deep(.orbit-code-copy) {
    position: absolute;
    top: 6px;
    right: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 5px;
    color: #d4d4d8;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.22);
      color: #fff;
    }
    &.copied {
      color: #4ade80;
      border-color: #4ade80;
    }
  }
  :deep(pre:hover .orbit-code-copy) {
    opacity: 1;
  }
}

// —— Sources ——
.orbit-sources {
  margin-top: 14px;
}
.orbit-sources-label {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.orbit-source-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.orbit-source {
  display: flex;
  gap: 8px;
  padding: 9px 10px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
  transition: border-color 0.15s;
  &:hover { border-color: var(--orbit-source-hover); }
}
.orbit-source-index {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  font-size: 10px;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 4px;
}
.orbit-source-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.orbit-source-snippet {
  margin-top: 2px;
  font-size: 10px;
  color: var(--faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// —— Artifact ——
.orbit-artifact {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-top: 14px;
  background: #f7fbfa;
  border: 1px solid #cae7dd;
  border-radius: 7px;
}
.orbit-artifact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--surface);
  border-radius: var(--orbit-radius-base);
  svg { width: 16px; height: 16px; color: #16875d; }
}
.orbit-artifact-info {
  flex: 1;
  min-width: 0;
}
.orbit-artifact-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.orbit-artifact-meta {
  font-size: 10px;
  color: var(--muted);
}

// —— Tools ——
.orbit-message-tools {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.15s;
}
.orbit-message:hover .orbit-message-tools { opacity: 1; }
.orbit-message-tools-user {
  justify-content: flex-end;
}
.orbit-message-tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--muted);
  background: transparent;
  border-radius: 5px;
  transition: all 0.15s;
  svg { width: 14px; height: 14px; }
  &:hover, &.active {
    color: var(--brand);
    background: var(--brand-soft);
  }
}
.orbit-tool-danger {
  &:hover {
    color: #dc2626 !important;
    background: #fef2f2 !important;
  }
}
.orbit-branch-switcher {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
  font-size: 11px;
  color: var(--muted);
}
.orbit-branch-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--muted);
  background: var(--surface-2);
  border-radius: 4px;
  &:hover { background: var(--surface-3); }
}

// —— 编辑模式 ——
.orbit-edit-textarea {
  width: 100%;
  max-width: 520px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
  background: var(--surface);
  border: 1.5px solid var(--brand);
  border-radius: 8px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  &:focus {
    box-shadow: 0 0 0 3px var(--brand-soft);
  }
}
.orbit-edit-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  justify-content: flex-end;
}
.orbit-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  transition: background 0.12s;
}
.orbit-edit-confirm {
  color: #fff;
  background: var(--brand);
  &:hover { opacity: 0.88; }
}
.orbit-edit-cancel {
  color: var(--muted);
  background: var(--surface-2);
  &:hover { background: var(--surface-3); }
}

// —— User bubble ——
.orbit-message-body-user :deep(.el-bubble) {
  max-width: 82%;
  padding: 0 !important;
  background: transparent;
}
.orbit-message-body-user :deep(.el-bubble-content) {
  background: var(--orbit-user-bubble-bg);
  border: 1px solid var(--orbit-user-bubble-border);
  color: var(--orbit-user-bubble-color);
  padding: 10px 13px;
  border-radius: 8px 2px 8px 8px;
  white-space: pre-wrap;
  font-size: 13px;
  box-shadow: none;
}
.orbit-message-body-user :deep(.el-bubble-avatar-placeholder) {
  display: none;
}
.orbit-user-time {
  margin-top: 4px;
  font-size: 10px;
  color: var(--faint);
  text-align: right;
}

// 响应式
@media (max-width: 760px) {
  .orbit-message-tools { opacity: 1; }
  .orbit-source-list { grid-template-columns: 1fr; }
  .orbit-avatar-user { display: none; }
  .orbit-message-user { grid-template-columns: minmax(0, 1fr); }
}

// 消息中的附件缩略图
.orbit-msg-attachments {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.orbit-msg-attachment {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  svg {
    width: 18px;
    height: 18px;
    color: var(--muted);
  }
}
</style>
