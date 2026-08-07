<!--
  Orbit 消息渲染（assistant + user）
  - assistant: avatar + markdown + sources + artifact + tools
  - user: avatar + bubble + time + tools
-->
<script setup lang="ts">
import type { OrbitMessage } from './orbitData';
import type { OrbitState } from './useOrbitState';
import { Bubble } from 'vue-element-plus-x';

defineProps<{
  message: OrbitMessage;
  state: OrbitState;
}>();

function handleRenderMarkdown(text: string) {
  // 极简 markdown 渲染：标题、列表、代码块、行内代码、粗体、链接
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let html = escape(text);
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre data-lang="${lang || ''}"><span class="orbit-code-label">${lang || 'CODE'}</span><code>${code}</code></pre>`;
  });
  html = html.replace(/`([^`\n]+)`/g, '<code class="orbit-inline-code">$1</code>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/(^|\n)- (.*)/g, '$1<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = html
    .split(/\n\n+/)
    .map((p) => (p.startsWith('<') ? p : `<p>${p}</p>`))
    .join('\n');
  return html;
}
</script>

<template>
  <article
    class="orbit-message"
    :class="{ 'orbit-message-user': message.role === 'user' }"
  >
    <!-- assistant -->
    <template v-if="message.role === 'assistant'">
      <div class="orbit-avatar orbit-avatar-assistant">AI</div>
      <div class="orbit-message-body">
        <!-- typing/loading -->
        <div v-if="message.loading && !message.content" class="orbit-typing">
          <span /><span /><span />
        </div>

        <!-- markdown -->
        <div
          v-else-if="message.content"
          class="orbit-markdown"
          v-html="handleRenderMarkdown(message.content)"
        />

        <!-- sources -->
        <div v-if="message.sources?.length" class="orbit-sources">
          <div class="orbit-sources-label">引用来源</div>
          <div class="orbit-source-list">
            <a
              v-for="source in message.sources"
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
        <div v-if="message.artifact" class="orbit-artifact">
          <div class="orbit-artifact-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h5" />
            </svg>
          </div>
          <div class="orbit-artifact-info">
            <div class="orbit-artifact-title">{{ message.artifact.title }}</div>
            <div class="orbit-artifact-meta">
              {{ message.artifact.size }} · {{ message.artifact.type }}
            </div>
          </div>
          <button class="secondary">打开</button>
        </div>

        <!-- tools -->
        <div class="orbit-message-tools">
          <button class="orbit-message-tool tooltip" data-tip="复制" @click="state.copyMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
          </button>
          <button
            class="orbit-message-tool tooltip"
            :class="{ active: message.rating === 'up' }"
            data-tip="有帮助"
            @click="state.rateMessage(message, 'up')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M7 11v9H4v-9zM7 11l5-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.4l-1.5 6A2 2 0 0 1 19.5 20H7" />
            </svg>
          </button>
          <button
            class="orbit-message-tool tooltip"
            :class="{ active: message.rating === 'down' }"
            data-tip="没帮助"
            @click="state.rateMessage(message, 'down')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 13V4h3v9zM17 13l-5 7a2 2 0 0 1-2-2v-4H5a2 2 0 0 1-2-2.4l1.5-6A2 2 0 0 1 4.5 4H17" />
            </svg>
          </button>
          <button
            class="orbit-message-tool tooltip"
            data-tip="重新生成"
            @click="state.regenerate(message)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
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
          <div v-if="(message.branches || 1) > 1" class="orbit-branch-switcher">
            <button class="orbit-branch-btn">‹</button>
            <span>{{ message.activeBranch }} / {{ message.branches }}</span>
            <button class="orbit-branch-btn">›</button>
          </div>
        </div>
      </div>
    </template>

    <!-- user -->
    <template v-else>
      <div class="orbit-message-body orbit-message-body-user">
        <Bubble
          placement="end"
          :content="message.content"
          :avatar-size="'32'"
          variant="filled"
          shape="corner"
          no-style
        />
        <div class="orbit-message-tools orbit-message-tools-user">
          <button class="orbit-message-tool tooltip" data-tip="编辑" @click="state.editMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
          <button class="orbit-message-tool tooltip" data-tip="复制" @click="state.copyMessage(message)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
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
  span:nth-child(2) {
    animation-delay: 140ms;
  }
  span:nth-child(3) {
    animation-delay: 280ms;
  }
}
@keyframes orbit-typing {
  0%,
  65%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  32% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

// —— Markdown ——
.orbit-markdown {
  font-size: 13px;
  line-height: 1.75;
  color: #344054;

  :deep(p) {
    margin: 0 0 10px;
  }
  :deep(h3) {
    margin: 14px 0 8px;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  :deep(ul) {
    padding-left: 22px;
    margin: 0 0 10px;
  }
  :deep(li) {
    margin-bottom: 4px;
  }
  :deep(strong) {
    color: var(--text);
  }
  :deep(a) {
    color: var(--brand);
    text-decoration: underline;
  }
  :deep(.orbit-inline-code) {
    padding: 1px 5px;
    font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    color: #4740b5;
    background: #f2f1ff;
    border-radius: 3px;
  }
  :deep(pre) {
    position: relative;
    margin: 10px 0;
    padding: 35px 13px 13px;
    overflow: auto;
    font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    color: var(--orbit-code-color);
    background: var(--orbit-code-bg);
    border-radius: 7px;
  }
  :deep(pre .orbit-code-label) {
    position: absolute;
    top: 8px;
    right: 12px;
    padding: 1px 6px;
    font-family: var(--orbit-font);
    font-size: 9px;
    font-weight: 600;
    color: var(--orbit-code-color);
    letter-spacing: 0.06em;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    text-transform: uppercase;
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

  &:hover {
    border-color: var(--orbit-source-hover);
  }
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

  svg {
    width: 16px;
    height: 16px;
    color: #16875d;
  }
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
.orbit-message:hover .orbit-message-tools {
  opacity: 1;
}
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

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover,
  &.active {
    color: var(--brand);
    background: var(--brand-soft);
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

  &:hover {
    background: var(--surface-3);
  }
}

// —— User 气泡覆盖 Element-Plus-X Bubble ——
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

// —— 响应式 ——
@media (max-width: 760px) {
  .orbit-message-tools {
    opacity: 1;
  }
  .orbit-source-list {
    grid-template-columns: 1fr;
  }
  .orbit-avatar-user {
    display: none;
  }
  .orbit-message-user {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>