<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'

const app = useAppStore()

const settingTab = ref('provider')

const settingItems = [
  { id: 'appearance', label: '外观', icon: 'i-tabler-palette' },
  { id: 'input', label: '输入', icon: 'i-tabler-keyboard' },
  { id: 'provider', label: 'Provider 与模型', icon: 'i-tabler-plug' },
  { id: 'assistant', label: '助手', icon: 'i-tabler-sparkles' },
  { id: 'context', label: '上下文', icon: 'i-tabler-layers-union' },
  { id: 'sync', label: '同步与存储', icon: 'i-tabler-cloud' },
  { id: 'data', label: '数据管理', icon: 'i-tabler-database' },
]

const genericSettings: Record<string, { key: keyof typeof app.settings; title: string; desc: string }[]> = {
  appearance: [
    { key: 'autoTheme', title: '跟随系统主题', desc: '自动切换浅色和深色模式' },
    { key: 'showMessageDivider', title: '显示消息分隔线', desc: '在连续消息之间显示细分隔线' },
    { key: 'codeShowLineNumbers', title: '代码块显示行号', desc: '为代码内容增加行号' },
  ],
  input: [
    { key: 'enterToSend', title: 'Enter 发送消息', desc: '使用 Shift + Enter 换行' },
    { key: 'autoScrollToBottom', title: '自动滚动到底部', desc: '生成过程中自动跟随最新消息' },
    { key: 'pasteToAttachment', title: '粘贴长文本转附件', desc: '超过阈值的文本自动转换为文件附件' },
  ],
  assistant: [
    { key: 'autoNameTopic', title: '首条消息自动命名话题', desc: '根据首条用户消息生成不超过 30 字的标题' },
    { key: 'showModelParams', title: '显示模型参数', desc: '在检查器中显示当前 Assistant 参数' },
  ],
  context: [
    { key: 'injectTopicTitle', title: '注入话题标题', desc: '将当前话题标题加入上下文' },
    { key: 'injectAttachment', title: '注入附件内容', desc: '将附件文本加入 Prompt' },
    { key: 'sendHistoryMessages', title: '发送历史消息', desc: '根据上下文窗口自动选择历史消息' },
  ],
  data: [
    { key: 'exportStripApiKey', title: '导出时剔除 API Key', desc: '导出的 Cherry JSON 不包含任何密钥' },
    { key: 'rebuildSearchIndex', title: '导入后重建搜索索引', desc: '导入完成后自动重建 MiniSearch 索引' },
  ],
}

function testConnection() {
  ElMessage.success('连接测试成功 · 延迟 238ms')
}

async function confirmClear() {
  try {
    await ElMessageBox.confirm(
      '此操作不可撤销。请先导出 Cherry JSON 备份。',
      '清空本地数据？',
      { type: 'warning', confirmButtonText: '确认清空', cancelButtonText: '取消' }
    )
    ElMessage.info('原型模式：未执行真实删除')
  } catch { /* cancelled */ }
}
</script>

<template>
  <main class="settings-main">
    <header class="settings-header">
      <h1 class="text-lg font-semibold">设置</h1>
    </header>

    <section class="settings-body scrollbar">
      <div class="settings-container">
        <!-- 导航 -->
        <nav class="settings-nav">
          <div class="nav-group-label">偏好设置</div>
          <button
            v-for="item in settingItems"
            :key="item.id"
            :class="['nav-item', { active: settingTab === item.id }]"
            @click="settingTab = item.id"
          >
            <i :class="item.icon" class="text-sm" />
            {{ item.label }}
          </button>
        </nav>

        <!-- 内容 -->
        <div class="settings-content">
          <!-- 移动端下拉 -->
          <div class="mobile-select">
            <el-select v-model="settingTab" size="default">
              <el-option v-for="item in settingItems" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>

          <!-- Provider -->
          <template v-if="settingTab === 'provider'">
            <div class="section-title">
              <h2>Provider 与模型</h2>
              <p>管理 API 连接和可用模型。</p>
            </div>
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">OpenAI</div>
                  <div class="card-sub">openai-compatible · api.openai.com</div>
                </div>
                <span class="badge-success">
                  <span class="status-dot" />已就绪
                </span>
              </div>
              <div class="form-grid">
                <label class="form-label">API Base URL
                  <el-input model-value="https://api.openai.com/v1" size="default" />
                </label>
                <label class="form-label">API Key
                  <el-input model-value="sk-••••••••••••••••" type="password" size="default" />
                </label>
              </div>
              <div class="card-footer">
                <el-button @click="testConnection">测试连接</el-button>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">已启用模型</div>
                  <div class="card-sub">模型参数归属于 Assistant</div>
                </div>
                <el-button type="primary" size="small">添加模型</el-button>
              </div>
              <div class="model-list">
                <div class="model-row">
                  <div>
                    <div class="model-name">GPT-4o</div>
                    <div class="model-sub">OpenAI · 128K context</div>
                  </div>
                  <span class="badge-success">启用</span>
                </div>
                <div class="model-row">
                  <div>
                    <div class="model-name">GPT-4o-mini</div>
                    <div class="model-sub">OpenAI · 128K context</div>
                  </div>
                  <span class="badge-muted">未启用</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 同步 -->
          <template v-else-if="settingTab === 'sync'">
            <div class="section-title">
              <h2>同步与存储</h2>
              <p>备份即 Cherry Studio 可导入的 JSON 格式。</p>
            </div>
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">同步方式</div>
                  <div class="card-sub">当前使用本地 IndexedDB</div>
                </div>
                <span class="badge-muted">未配置远端</span>
              </div>
              <div class="sync-options">
                <button class="sync-option active">
                  <div class="sync-name">本地存储</div>
                  <div class="sync-desc">浏览器 IndexedDB</div>
                </button>
                <button class="sync-option">
                  <div class="sync-name">S3 / WebDAV</div>
                  <div class="sync-desc">配置远端备份</div>
                </button>
              </div>
              <div class="card-footer">
                <el-button type="primary">全量上传</el-button>
                <el-button>全量下载</el-button>
                <el-button>导出 Cherry JSON</el-button>
              </div>
            </div>
            <div class="card danger-zone">
              <div class="card-title text-red-800">危险区域</div>
              <p class="danger-desc">清空本地数据不可撤销。建议先导出备份。</p>
              <el-button type="danger" plain @click="confirmClear">清空本地数据</el-button>
            </div>
          </template>

          <!-- 通用设置 -->
          <template v-else>
            <div class="section-title">
              <h2>{{ settingItems.find(x => x.id === settingTab)?.label }}</h2>
              <p>设置会即时保存在本地。</p>
            </div>
            <div class="card">
              <div
                v-for="(row, idx) in genericSettings[settingTab] ?? []"
                :key="row.key"
                :class="['setting-row', { 'no-border': idx === (genericSettings[settingTab]?.length ?? 0) - 1 }]"
              >
                <div>
                  <div class="setting-label">{{ row.title }}</div>
                  <div class="setting-desc">{{ row.desc }}</div>
                </div>
                <el-switch v-model="app.settings[row.key]" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.settings-main {
  margin-left: 344px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;

  @media (max-width: 759px) { margin-left: 0; }
}

.settings-header {
  display: flex;
  align-items: center;
  height: 60px;
  shrink: 0;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  background: #fff;
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px 20px;
}

.settings-container {
  max-width: 980px;
  margin: 0 auto;
  display: grid;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: 210px 1fr;
  }
}

.settings-nav {
  display: none;

  @media (min-width: 768px) {
    display: block;
  }

  .nav-group-label {
    padding: 0 12px;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #667085;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  font-size: 14px;
  color: #667085;

  &:hover { background: #fff; }
  &.active {
    background: #efefff;
    font-weight: 500;
    color: #5b56d6;
  }
}

.mobile-select {
  display: block;

  @media (min-width: 768px) { display: none; }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
  p {
    margin-top: 4px;
    font-size: 14px;
    color: #667085;
  }
}

.card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(16,24,40,0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-weight: 500;
}

.card-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #667085;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.badge-success {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: #ecfdf5;
  padding: 4px 10px;
  font-size: 12px;
  color: #047857;
}

.badge-muted {
  border-radius: 999px;
  background: #f3f4f6;
  padding: 4px 10px;
  font-size: 12px;
  color: #667085;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
}

.form-grid {
  display: grid;
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
}

.form-label {
  font-size: 12px;
  color: #667085;

  .el-input { margin-top: 6px; }
}

.model-list {
  display: flex;
  flex-direction: column;
}

.model-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;

  &:first-child { border-top: 0; }
}

.model-name {
  font-size: 14px;
  font-weight: 500;
}

.model-sub {
  font-size: 12px;
  color: #667085;
}

.sync-options {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
}

.sync-option {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  text-align: left;

  &:hover { border-color: #5b56d6; }
  &.active {
    border: 2px solid #5b56d6;
    background: #efefff;

    .sync-name { color: #5b56d6; }
  }
}

.sync-name {
  font-weight: 500;
}

.sync-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #667085;
}

.danger-zone {
  border-color: #fecaca;
  background: #fef2f2;

  .danger-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: #b91c1c;
  }
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;

  &.no-border { border-bottom: 0; }
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
}

.setting-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #667085;
}
</style>
