<!--
  Orbita AI Inspector：系统提示词 + 用量 + 上下文文件 + 分支 + 消耗
-->
<script setup lang="ts">
import type { OrbitState } from './useOrbitState';

defineProps<{ state: OrbitState }>();
</script>

<template>
  <aside class="orbit-inspector" :class="{ 'orbit-inspector-open': state.inspectorOpen.value }">
    <div class="orbit-inspector-head">
      <div class="orbit-inspector-title">会话详情</div>
      <button class="icon-btn" data-tip="关闭" @click="state.inspectorOpen.value = false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="orbit-inspector-body orbit-scroll">
      <!-- 系统提示词 -->
      <section class="orbit-inspector-section">
        <div class="orbit-section-title">
          <span>系统提示词</span>
          <button class="orbit-section-edit" @click="state.modal.value = 'prompt'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            编辑
          </button>
        </div>
        <div class="orbit-prompt-preview">{{ state.inspectorPrompt.value }}</div>
      </section>

      <!-- 上下文用量 -->
      <section class="orbit-inspector-section">
        <div class="orbit-section-title">
          <span>上下文用量</span>
          <span class="orbit-section-meta">{{ state.usage.value.total.toLocaleString() }} tokens</span>
        </div>
        <div class="orbit-meter">
          <div
            class="orbit-meter-fill"
            :style="{ width: `${state.usage.value.ratio * 100}%` }"
          />
        </div>
        <div class="orbit-meter-note">
          已使用 {{ Math.round(state.usage.value.ratio * 100) }}%，{{ state.usage.value.remainChars }}
        </div>
      </section>

      <!-- 上下文文件 -->
      <section class="orbit-inspector-section">
        <div class="orbit-section-title">
          <span>上下文文件</span>
          <button class="orbit-section-add">+</button>
        </div>
        <div class="orbit-context-list">
          <div v-for="file in state.contextFiles.value" :key="file.name" class="orbit-context-item">
            <div class="orbit-context-item-icon">
              <svg v-if="file.icon === 'file'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
              </svg>
            </div>
            <div class="orbit-context-item-info">
              <div class="orbit-context-item-name">{{ file.name }}</div>
              <div class="orbit-context-item-meta">{{ file.meta }}</div>
            </div>
            <button class="orbit-context-item-more">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 对话分支 -->
      <section class="orbit-inspector-section">
        <div class="orbit-section-title">
          <span>对话分支</span>
        </div>
        <div class="orbit-branch-list">
          <div
            v-for="(branch, idx) in state.branches.value"
            :key="branch.index"
            class="orbit-branch-row"
            :class="{ muted: branch.muted, active: branch.active }"
          >
            <div class="orbit-branch-node">
              <span>{{ branch.index }}</span>
            </div>
            <div class="orbit-branch-info">
              <div class="orbit-branch-title">{{ branch.title }}</div>
              <div class="orbit-branch-meta">
                {{ branch.count }} 条 · {{ branch.meta }}
              </div>
            </div>
            <span
              v-if="idx < state.branches.value.length - 1"
              class="orbit-branch-line"
            />
          </div>
        </div>
      </section>

      <!-- 本次会话消耗 -->
      <section class="orbit-inspector-section">
        <div class="orbit-section-title">
          <span>本次会话消耗</span>
        </div>
        <div class="orbit-cost-grid">
          <div class="orbit-cost-cell">
            <div class="orbit-cost-label">输入</div>
            <div class="orbit-cost-value">{{ state.costGrid.value.input }}</div>
          </div>
          <div class="orbit-cost-cell">
            <div class="orbit-cost-label">输出</div>
            <div class="orbit-cost-value">{{ state.costGrid.value.output }}</div>
          </div>
          <div class="orbit-cost-cell">
            <div class="orbit-cost-label">费用</div>
            <div class="orbit-cost-value">{{ state.costGrid.value.cost }}</div>
          </div>
          <div class="orbit-cost-cell">
            <div class="orbit-cost-label">耗时</div>
            <div class="orbit-cost-value">{{ state.costGrid.value.duration }}</div>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.orbit-inspector {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: var(--inspector);
  height: 100%;
  background: var(--sidebar-bg);
  border-left: 1px solid var(--line);
  transition: transform 0.3s;
}

.orbit-inspector-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header);
  padding: 0 14px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.orbit-inspector-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.orbit-inspector-body {
  flex: 1;
  padding: 16px 14px;
  overflow-y: auto;
}

.orbit-inspector-section {
  margin-bottom: 22px;
}
.orbit-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.orbit-section-edit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--brand);
  text-transform: none;

  svg {
    width: 12px;
    height: 12px;
  }
}
.orbit-section-meta {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  text-transform: none;
}
.orbit-section-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 14px;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 4px;
}

// 系统提示词
.orbit-prompt-preview {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
}

// 用量
.orbit-meter {
  height: 5px;
  background: var(--orbit-meter-bg);
  border-radius: 3px;
}
.orbit-meter-fill {
  height: 100%;
  background: var(--orbit-meter-fill);
  border-radius: 3px;
  transition: width 0.3s;
}
.orbit-meter-note {
  margin-top: 6px;
  font-size: 10px;
  color: var(--faint);
}

// 上下文文件
.orbit-context-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.orbit-context-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
}
.orbit-context-item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--surface-3);
  border-radius: 5px;

  svg {
    width: 14px;
    height: 14px;
    color: var(--muted);
  }
}
.orbit-context-item-info {
  flex: 1;
  min-width: 0;
}
.orbit-context-item-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orbit-context-item-meta {
  font-size: 10px;
  color: var(--faint);
}
.orbit-context-item-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--faint);
  border-radius: 4px;

  &:hover {
    background: var(--surface-3);
  }
  svg {
    width: 14px;
    height: 14px;
  }
}

// 分支
.orbit-branch-list {
  display: flex;
  flex-direction: column;
}
.orbit-branch-row {
  position: relative;
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  padding: 6px 0;

  &.muted {
    opacity: 0.55;
  }
}
.orbit-branch-node {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  background: var(--brand);
  border-radius: 50%;
  position: relative;
  z-index: 1;

  .muted & {
    background: var(--faint);
  }
}
.orbit-branch-info {
  min-width: 0;
}
.orbit-branch-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.orbit-branch-meta {
  font-size: 10px;
  color: var(--faint);
}
.orbit-branch-line {
  position: absolute;
  top: 28px;
  left: 8px;
  width: 1px;
  height: calc(100% - 22px);
  background: var(--line-strong);
}

// 消耗
.orbit-cost-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.orbit-cost-cell {
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
}
.orbit-cost-label {
  font-size: 10px;
  color: var(--muted);
}
.orbit-cost-value {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}

// 抽屉化
@media (max-width: 1180px) {
  .orbit-inspector {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 60;
    transform: translateX(105%);
    box-shadow: -12px 0 40px rgba(16, 24, 40, 0.08);

    &.orbit-inspector-open {
      transform: translateX(0);
    }
  }
}

@media (max-width: 760px) {
  .orbit-inspector {
    width: min(304px, calc(100vw - 48px));
  }
}
</style>
