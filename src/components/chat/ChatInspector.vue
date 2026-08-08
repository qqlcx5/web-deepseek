<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'

const store = useChatStore()
</script>

<template>
  <aside v-if="store.inspectorVisible || store.inspectorOpen" class="inspector" :class="{ open: store.inspectorOpen }">
    <div class="inspector-head">
      <span class="inspector-title">会话信息</span>
      <button class="icon-btn tooltip" data-tip="关闭" @click="store.closeInspector()">
        <Icon icon="tabler:x" />
      </button>
    </div>

    <div class="inspector-scroll scroll">
      <!-- System prompt -->
      <section class="panel-section">
        <div class="panel-heading">
          系统提示词
          <button class="panel-edit" @click="store.modal = 'prompt'">编辑</button>
        </div>
        <div class="prompt-preview">{{ store.promptDraft }}</div>
      </section>

      <!-- Context usage -->
      <section class="panel-section">
        <div class="panel-heading">上下文用量</div>
        <div class="meter-head">
          <span>48,240 tokens</span>
          <span>38%</span>
        </div>
        <div class="meter"><div class="meter-fill" /></div>
        <div class="meter-note">还可继续约 52,000 个中文字符。达到 80% 后将自动压缩较早消息。</div>
      </section>

      <!-- Context files -->
      <section class="panel-section">
        <div class="panel-heading">
          上下文文件
          <button class="panel-edit">添加</button>
        </div>
        <div class="context-item">
          <span class="context-item-icon"><Icon icon="tabler:file-text" /></span>
          <span class="context-item-copy">
            <span class="context-item-name">migration-plan.pdf</span>
            <span class="context-item-meta">24 页 · 已解析</span>
          </span>
          <button class="icon-btn" style="width:24px;height:24px;flex-basis:24px">
            <Icon icon="tabler:more-horizontal" width="13" />
          </button>
        </div>
        <div class="context-item">
          <span class="context-item-icon"><Icon icon="tabler:table-2" /></span>
          <span class="context-item-copy">
            <span class="context-item-name">cost-comparison.csv</span>
            <span class="context-item-meta">86 行 · 已解析</span>
          </span>
          <button class="icon-btn" style="width:24px;height:24px;flex-basis:24px">
            <Icon icon="tabler:more-horizontal" width="13" />
          </button>
        </div>
      </section>

      <!-- Branches -->
      <section class="panel-section">
        <div class="panel-heading">对话分支</div>
        <div class="branch-row">
          <span class="branch-node">1</span>
          <span>
            <span class="branch-name">原始方案</span>
            <span class="branch-meta">6 条消息 · 当前分支</span>
          </span>
        </div>
        <div class="branch-row">
          <span class="branch-node" style="background:#98a2b3">2</span>
          <span>
            <span class="branch-name">MinIO 迁移方案</span>
            <span class="branch-meta">3 条消息 · 12 分钟前</span>
          </span>
        </div>
      </section>

      <!-- Cost -->
      <section class="panel-section">
        <div class="panel-heading">本次会话消耗</div>
        <div class="cost-grid">
          <div class="cost-cell">
            <div class="cost-label">输入 Token</div>
            <div class="cost-value">8,420</div>
          </div>
          <div class="cost-cell">
            <div class="cost-label">输出 Token</div>
            <div class="cost-value">2,186</div>
          </div>
          <div class="cost-cell">
            <div class="cost-label">预计费用</div>
            <div class="cost-value">$0.008</div>
          </div>
          <div class="cost-cell">
            <div class="cost-label">响应时间</div>
            <div class="cost-value">3.8s</div>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.inspector {
  z-index: 20; display: flex; min-width: 0; flex-direction: column;
  overflow: hidden; background: #fbfcfd; border-left: 1px solid var(--line);
}
.inspector-head {
  display: flex; height: var(--header); flex: 0 0 var(--header); align-items: center;
  gap: 7px; padding: 0 12px; background: white; border-bottom: 1px solid var(--line);
}
.inspector-title { min-width: 0; flex: 1; font-size: 12px; font-weight: 700; }
.inspector-scroll { min-height: 0; flex: 1; overflow-y: auto; padding: 12px; }
.panel-section { padding: 3px 0 15px; border-bottom: 1px solid var(--line); }
.panel-section + .panel-section { padding-top: 15px; }
.panel-section:last-child { border-bottom: 0; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; color: #344054; font-size: 11px; font-weight: 700; }
.panel-edit { color: var(--brand); background: transparent; font-size: 10px; border: 0; cursor: pointer; }
.prompt-preview { display: -webkit-box; overflow: hidden; color: var(--muted); font-size: 10px; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
.meter-head { display: flex; justify-content: space-between; color: var(--muted); font-size: 10px; }
.meter { height: 5px; overflow: hidden; margin-top: 7px; background: #eaecf0; border-radius: 3px; }
.meter-fill { height: 100%; width: 38%; background: #5b9e82; border-radius: inherit; }
.meter-note { margin-top: 7px; color: var(--faint); font-size: 9px; line-height: 1.5; }
.context-item { display: flex; align-items: center; gap: 8px; margin-top: 7px; padding: 8px; background: white; border: 1px solid var(--line); border-radius: 6px; }
.context-item-icon { display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; color: var(--muted); background: var(--surface-3); border-radius: 5px; }
.context-item-icon :deep(svg) { width: 14px; }
.context-item-copy { min-width: 0; flex: 1; }
.context-item-name { overflow: hidden; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.context-item-meta { margin-top: 2px; color: var(--faint); font-size: 9px; }
.branch-row { position: relative; display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 8px; padding: 6px 0; }
.branch-node { position: relative; z-index: 2; display: flex; width: 18px; height: 18px; align-items: center; justify-content: center; color: white; background: var(--brand); border-radius: 50%; font-size: 8px; }
.branch-row:not(:last-child)::after { position: absolute; top: 23px; bottom: -5px; left: 8px; width: 1px; background: var(--line-strong); content: ""; }
.branch-name { font-size: 10px; font-weight: 650; }
.branch-meta { margin-top: 2px; color: var(--faint); font-size: 9px; }
.cost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.cost-cell { padding: 9px; background: white; border: 1px solid var(--line); border-radius: 6px; }
.cost-label { color: var(--faint); font-size: 9px; }
.cost-value { margin-top: 4px; font-size: 12px; font-weight: 700; }

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: #667085; background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 1180px) {
  .inspector {
    position: fixed; z-index: 60; top: 0; right: 0; bottom: 0;
    width: min(var(--inspector), calc(100vw - 48px));
    box-shadow: -12px 0 40px rgba(16, 24, 40, 0.14);
    transform: translateX(105%);
    transition: transform 180ms ease;
  }
  .inspector.open { transform: translateX(0); }
}
@media (max-width: 760px) {
  .inspector { width: 100%; }
}
</style>
