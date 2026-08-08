<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'
import { MarkdownRenderer } from 'x-markdown-vue'
import 'x-markdown-vue/style'

const store = useChatStore()
const messageScroller = ref<HTMLElement | null>(null)

function handleScroll() {
  if (!messageScroller.value) return
  const el = messageScroller.value
  const dist = el.scrollHeight - el.scrollTop - el.clientHeight
  store.nearBottom = dist < 100
}

function scrollToBottom() {
  nextTick(() => {
    if (!messageScroller.value) return
    messageScroller.value.scrollTop = messageScroller.value.scrollHeight
    store.nearBottom = true
  })
}

// Scroll to bottom when messages change or generating
watch(
  () => store.messages.length,
  () => {
    if (store.nearBottom || store.generating) scrollToBottom()
  },
)

// Watch for content updates during streaming
watch(
  () => store.messages.map(m => m.content).join(''),
  () => {
    if (store.nearBottom) scrollToBottom()
  },
)

nextTick(() => scrollToBottom())

defineExpose({ scrollToBottom })
</script>

<template>
  <section class="chat-area">
    <div ref="messageScroller" class="messages scroll" @scroll="handleScroll">
      <div class="message-list">
        <div v-if="store.messages.length === 0" class="empty-state">
          <div class="empty-icon">
            <Icon icon="tabler:message-dots" width="32" />
          </div>
          <div class="empty-title">开始新对话</div>
          <div class="empty-hint">输入消息或粘贴文件，AI 将为你解答</div>
        </div>

        <div v-else class="date-divider">今天</div>

        <article
          v-for="message in store.messages"
          :key="message.id"
          class="message"
          :class="message.role"
        >
          <!-- Assistant message -->
          <template v-if="message.role === 'assistant'">
            <div class="assistant-avatar">
              <Icon icon="tabler:sparkles" />
            </div>
            <div class="message-content">
              <div class="message-meta">
                <span class="message-author">Assistant</span>
                <span v-if="message.model" class="message-model">{{ message.model }}</span>
                <span class="message-time">{{ message.time }}</span>
              </div>

              <div v-if="message.loading" class="typing">
                <i /><i /><i />
              </div>

              <div v-else class="markdown">
                <MarkdownRenderer :markdown="message.content" />
              </div>

              <!-- Error indicator -->
              <div v-if="message.error" class="message-error">
                <Icon icon="tabler:alert-circle" width="14" />
                {{ message.error }}
              </div>

              <!-- Sources -->
              <div v-if="message.sources?.length" class="sources">
                <div class="sources-title">
                  <Icon icon="tabler:books" width="14" />
                  引用来源
                </div>
                <div class="source-list">
                  <a
                    v-for="(source, idx) in message.sources"
                    :key="source.name"
                    class="source"
                    :href="source.url"
                    target="_blank"
                  >
                    <span class="source-index">{{ idx + 1 }}</span>
                    <span class="source-copy">
                      <span class="source-name">{{ source.name }}</span>
                      <span class="source-domain">{{ source.domain }}</span>
                    </span>
                  </a>
                </div>
              </div>

              <!-- Artifact -->
              <div v-if="message.artifact" class="artifact">
                <span class="artifact-icon">
                  <Icon icon="tabler:file-code-2" width="16" />
                </span>
                <span class="artifact-copy">
                  <span class="artifact-name">{{ message.artifact.name }}</span>
                  <span class="artifact-meta">{{ message.artifact.meta }}</span>
                </span>
                <button class="secondary" @click="store.showToast('已在右侧打开产物预览')">
                  <Icon icon="tabler:layout-sidebar-right-expand" width="13" />
                  打开
                </button>
              </div>

              <!-- Message tools -->
              <div v-if="!message.loading" class="message-tools">
                <button class="message-tool tooltip" data-tip="复制" @click="store.copyMessage(message)">
                  <Icon icon="tabler:copy" />
                </button>
                <button
                  class="message-tool tooltip"
                  data-tip="有帮助"
                  :class="{ active: message.rating === 'up' }"
                  @click="store.rateMessage(message, 'up')"
                >
                  <Icon icon="tabler:thumb-up" />
                </button>
                <button
                  class="message-tool tooltip"
                  data-tip="没有帮助"
                  :class="{ active: message.rating === 'down' }"
                  @click="store.rateMessage(message, 'down')"
                >
                  <Icon icon="tabler:thumb-down" />
                </button>
                <button class="message-tool tooltip" data-tip="重新生成" @click="store.regenerate(message)">
                  <Icon icon="tabler:rotate-clockwise" />
                </button>
                <button class="message-tool tooltip" data-tip="从这里分支" @click="store.branchFrom(message)">
                  <Icon icon="tabler:git-branch" />
                </button>
                <div v-if="(message.branches ?? 0) > 1" class="branch-switcher">
                  <button><Icon icon="tabler:chevron-left" /></button>
                  {{ message.activeBranch }}/{{ message.branches }}
                  <button><Icon icon="tabler:chevron-right" /></button>
                </div>
              </div>
            </div>
          </template>

          <!-- User message -->
          <template v-else>
            <div class="message-content">
              <div class="user-bubble">{{ message.content }}</div>
              <div class="user-time">{{ message.time }}</div>
              <div class="message-tools" style="justify-content:flex-end">
                <button class="message-tool tooltip" data-tip="编辑并重新发送" @click="store.editMessage(message)">
                  <Icon icon="tabler:pencil" />
                </button>
                <button class="message-tool tooltip" data-tip="复制" @click="store.copyMessage(message)">
                  <Icon icon="tabler:copy" />
                </button>
              </div>
            </div>
            <div class="avatar">我</div>
          </template>
        </article>
      </div>
    </div>

    <button v-if="!store.nearBottom && store.messages.length > 0" class="jump-bottom" @click="scrollToBottom">
      <Icon icon="tabler:arrow-down" />
      回到底部
    </button>
  </section>
</template>

<style scoped>
.chat-area { position: relative; min-height: 0; flex: 1; }
.messages { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; }
.message-list { width: min(100%, 820px); margin: 0 auto; padding: 32px 24px 120px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px;
  color: var(--faint);
}
.empty-icon { color: var(--line-strong); }
.empty-title { font-size: 16px; font-weight: 600; color: var(--muted); }
.empty-hint { font-size: 12px; }

.date-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0 28px; color: var(--faint); font-size: 10px; }
.date-divider::before, .date-divider::after { height: 1px; flex: 1; background: var(--line); content: ""; }
.message { display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 11px; margin-bottom: 28px; }
.message.user { grid-template-columns: minmax(0, 1fr) 30px; }
.assistant-avatar { display: flex; width: 30px; height: 30px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border: 1px solid var(--line-strong); border-radius: 7px; }
.assistant-avatar :deep(svg) { width: 15px; }
.message-content { min-width: 0; }
.message.user .message-content { justify-self: end; max-width: min(82%, 660px); }
.message-meta { display: flex; align-items: center; gap: 7px; height: 23px; margin-bottom: 3px; font-size: 11px; }
.message-author { font-weight: 700; }
.message-model, .message-time { color: var(--faint); font-size: 10px; }
.user-bubble { padding: 10px 13px; color: var(--text); background: var(--brand-soft); border: 1px solid var(--line); border-radius: 8px 2px 8px 8px; font-size: 13px; line-height: 1.65; white-space: pre-wrap; }
.user-time { margin-top: 5px; color: var(--faint); font-size: 10px; text-align: right; }
.markdown { color: var(--text-secondary); font-size: 13px; line-height: 1.75; overflow-wrap: anywhere; }
.markdown :deep(p) { margin: 0 0 10px; }
.markdown :deep(h2), .markdown :deep(h3) { margin: 18px 0 8px; color: var(--text); font-size: 14px; }
.markdown :deep(ul), .markdown :deep(ol) { margin: 8px 0; padding-left: 21px; }
.markdown :deep(li) { margin: 4px 0; }
.markdown :deep(table) { width: 100%; margin: 12px 0; border-collapse: collapse; font-size: 12px; }
.markdown :deep(th), .markdown :deep(td) { padding: 8px; border: 1px solid var(--line); text-align: left; }
.markdown :deep(th) { background: var(--surface-3); }
.markdown :deep(blockquote) { margin: 12px 0; padding: 7px 11px; color: var(--muted); background: var(--surface-2); border-left: 3px solid var(--brand); }
.markdown :deep(code:not(pre code)) { padding: 2px 5px; color: var(--brand); background: var(--brand-soft); border-radius: 4px; font-size: 0.9em; }
.markdown :deep(pre) { position: relative; overflow: auto; margin: 12px 0; padding: 35px 13px 13px; color: var(--code-text); background: var(--code-bg); border-radius: 7px; font-size: 12px; line-height: 1.6; }

.message-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 10px;
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 8%, transparent);
  border-radius: 6px;
  font-size: 11px;
}

.typing { display: flex; height: 30px; align-items: center; gap: 4px; }
.typing i { width: 5px; height: 5px; background: var(--brand); border-radius: 50%; animation: typing 1.1s infinite; }
.typing i:nth-child(2) { animation-delay: 140ms; }
.typing i:nth-child(3) { animation-delay: 280ms; }
@keyframes typing { 0%,65%,100% { opacity: 0.35; transform: translateY(0); } 32% { opacity: 1; transform: translateY(-3px); } }

.message-tools { display: flex; min-height: 30px; align-items: center; gap: 2px; margin-top: 6px; opacity: 0; transition: opacity 140ms; }
.message:hover .message-tools, .message-tools:focus-within { opacity: 1; }
.message-tool { display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; color: var(--faint); background: transparent; border-radius: 5px; border: 0; cursor: pointer; }
.message-tool:hover, .message-tool.active { color: var(--brand); background: var(--brand-soft); }
.message-tool :deep(svg) { width: 14px; }
.branch-switcher { display: flex; align-items: center; gap: 3px; margin-left: 4px; color: var(--faint); font-size: 10px; }
.branch-switcher button { display: flex; width: 24px; height: 24px; align-items: center; justify-content: center; color: inherit; background: transparent; border-radius: 4px; border: 0; cursor: pointer; }
.branch-switcher :deep(svg) { width: 12px; }

.sources { margin-top: 14px; }
.sources-title { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 11px; font-weight: 650; }
.source-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 7px; }
.source { display: flex; min-width: 0; align-items: center; gap: 8px; padding: 8px; color: var(--text-secondary); background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px; text-decoration: none; }
.source:hover { border-color: var(--brand); }
.source-index { display: flex; width: 21px; height: 21px; flex: 0 0 21px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border-radius: 4px; font-size: 10px; font-weight: 700; }
.source-copy { min-width: 0; }
.source-name { display: block; overflow: hidden; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.source-domain { display: block; overflow: hidden; margin-top: 2px; color: var(--faint); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

.artifact { display: flex; align-items: center; gap: 10px; margin-top: 13px; padding: 10px; background: color-mix(in srgb, var(--success) 5%, var(--surface)); border: 1px solid color-mix(in srgb, var(--success) 20%, var(--line)); border-radius: 7px; }
.artifact-icon { display: flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; color: var(--success); background: var(--surface); border: 1px solid var(--line); border-radius: 6px; }
.artifact-copy { min-width: 0; flex: 1; }
.artifact-name { overflow: hidden; font-size: 11px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.artifact-meta { margin-top: 3px; color: var(--faint); font-size: 9px; }

.jump-bottom {
  position: absolute; z-index: 5; bottom: 10px; left: 50%;
  display: flex; height: 32px; align-items: center; gap: 6px; padding: 0 10px;
  color: var(--text-secondary); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 16px;
  box-shadow: var(--shadow-md); font-size: 11px;
  transform: translateX(-50%); cursor: pointer;
}
.jump-bottom :deep(svg) { width: 13px; }

.avatar { display: flex; width: 30px; height: 30px; flex: 0 0 30px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border-radius: 50%; font-size: 11px; font-weight: 750; }

.secondary {
  display: inline-flex; min-height: 34px; align-items: center; justify-content: center;
  gap: 7px; padding: 0 11px; color: var(--text-secondary); background: var(--surface);
  border: 1px solid var(--line-strong); border-radius: 6px;
  font-size: 12px; font-weight: 600; cursor: pointer;
}
.secondary:hover { background: var(--surface-2); }

@media (max-width: 760px) {
  .message-list { padding: 22px 13px 125px; }
  .message { grid-template-columns: 26px minmax(0, 1fr); gap: 8px; margin-bottom: 23px; }
  .message.user { grid-template-columns: minmax(0, 1fr); }
  .message.user > .avatar { display: none; }
  .assistant-avatar { width: 26px; height: 26px; }
  .message.user .message-content { max-width: 90%; }
  .message-tools { opacity: 1; }
  .source-list { grid-template-columns: 1fr; }
}
@media (max-width: 390px) {
  .message-list { padding-right: 10px; padding-left: 10px; }
}
</style>
