<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { Settings } from '@/types'

const app = useAppStore()
const settingTab = ref('basic')

const settingItems = [
  { id: 'basic', label: '基础', icon: 'i-tabler-settings' },
  { id: 'topic', label: '话题', icon: 'i-tabler-message-2' },
  { id: 'input', label: '输入', icon: 'i-tabler-keyboard' },
  { id: 'message', label: '消息显示', icon: 'i-tabler-layout-list' },
  { id: 'code', label: '代码', icon: 'i-tabler-code' },
  { id: 'math', label: '数学', icon: 'i-tabler-math-symbols' },
  { id: 'translate', label: '翻译', icon: 'i-tabler-language' },
  { id: 'export', label: '导出', icon: 'i-tabler-download' },
  { id: 'multimodel', label: '多模型', icon: 'i-tabler-layers' },
  { id: 'layout', label: '布局', icon: 'i-tabler-layout' },
  { id: 'custom', label: '自定义', icon: 'i-tabler-brand-css3' },
  { id: 'provider', label: 'Provider 与模型', icon: 'i-tabler-plug' },
  { id: 'assistant', label: '助手', icon: 'i-tabler-sparkles' },
]

function testConnection() { ElMessage.success('连接测试成功 · 延迟 238ms') }

async function confirmClear() {
  try {
    await ElMessageBox.confirm('此操作不可撤销。请先导出 Cherry JSON 备份。', '清空本地数据？', { type: 'warning', confirmButtonText: '确认清空', cancelButtonText: '取消' })
    ElMessage.info('原型模式：未执行真实删除')
  } catch { /* cancelled */ }
}

type SettingKey = keyof Settings
function set<K extends SettingKey>(key: K, value: Settings[K]) {
  app.updateSettings({ [key]: value } as Partial<Settings>)
}
</script>

<template>
  <main class="settings-main">
    <header class="settings-header"><h1 class="text-lg font-semibold">设置</h1></header>
    <section class="settings-body scrollbar">
      <div class="settings-container">
        <nav class="settings-nav">
          <div class="nav-group-label">偏好设置</div>
          <button v-for="item in settingItems" :key="item.id" :class="['nav-item', { active: settingTab === item.id }]" @click="settingTab = item.id">
            <i :class="item.icon" class="text-sm" />{{ item.label }}
          </button>
        </nav>

        <div class="settings-content">
          <div class="mobile-select"><el-select v-model="settingTab" size="default"><el-option v-for="item in settingItems" :key="item.id" :label="item.label" :value="item.id" /></el-select></div>

          <!-- 1. 基础 -->
          <template v-if="settingTab === 'basic'">
            <div class="section-title"><h2>基础</h2><p>语言、主题和用户名。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">语言</div><div class="setting-desc">界面显示语言</div></div>
                <el-select :model-value="app.settings.language" @change="(v: string) => set('language', v as Settings['language'])" size="default">
                  <el-option label="简体中文" value="zh-CN" /><el-option label="English" value="en-US" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">主题模式</div><div class="setting-desc">浅色、深色或跟随系统</div></div>
                <el-select :model-value="app.settings.theme" @change="(v: string) => set('theme', v as Settings['theme'])" size="default">
                  <el-option label="浅色" value="light" /><el-option label="深色" value="dark" /><el-option label="跟随系统" value="auto" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">字号</div><div class="setting-desc">全局基础字号</div></div>
                <el-input-number :model-value="app.settings.fontSize" :min="12" :max="20" @change="(v: number) => set('fontSize', v)" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">用户名</div><div class="setting-desc">显示在聊天界面中</div></div>
                <el-input :model-value="app.settings.userName" @update:model-value="(v: string) => set('userName', v)" placeholder="输入用户名" size="default" style="width: 200px" />
              </div>
            </div>
          </template>

          <!-- 2. 话题 -->
          <template v-else-if="settingTab === 'topic'">
            <div class="section-title"><h2>话题</h2><p>话题列表显示与命名行为。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">显示助手列表</div><div class="setting-desc">在侧边栏显示助手</div></div>
                <el-switch :model-value="app.settings.showAssistants" @change="(v: boolean) => set('showAssistants', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示话题列表</div><div class="setting-desc">在侧边栏显示话题</div></div>
                <el-switch :model-value="app.settings.showTopics" @change="(v: boolean) => set('showTopics', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">话题位置</div><div class="setting-desc">话题列表显示在哪一侧</div></div>
                <el-select :model-value="app.settings.topicPosition" @change="(v: string) => set('topicPosition', v as Settings['topicPosition'])" size="default">
                  <el-option label="左侧" value="left" /><el-option label="右侧" value="right" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示话题时间</div><div class="setting-desc">话题列表中显示创建时间</div></div>
                <el-switch :model-value="app.settings.showTopicTime" @change="(v: boolean) => set('showTopicTime', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">置顶话题</div><div class="setting-desc">置顶的话题排在顶部</div></div>
                <el-switch :model-value="app.settings.pinTopicsToTop" @change="(v: boolean) => set('pinTopicsToTop', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">助手图标类型</div><div class="setting-desc">助手头像的图标样式</div></div>
                <el-select :model-value="app.settings.assistantIconType" @change="(v: string) => set('assistantIconType', v)" size="default">
                  <el-option label="Emoji" value="emoji" /><el-option label="模型图标" value="model" /><el-option label="字母" value="letter" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">点击助手显示话题</div><div class="setting-desc">点击助手时自动展开其话题</div></div>
                <el-switch :model-value="app.settings.clickAssistantToShowTopic" @change="(v: boolean) => set('clickAssistantToShowTopic', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">启用话题自动命名</div><div class="setting-desc">使用 AI 自动为话题生成名称</div></div>
                <el-switch :model-value="app.settings.enableTopicNaming" @change="(v: boolean) => set('enableTopicNaming', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">话题命名提示词</div><div class="setting-desc">自动命名时使用的 Prompt</div></div>
                <el-input :model-value="app.settings.topicNamingPrompt" @update:model-value="(v: string) => set('topicNamingPrompt', v)" type="textarea" :rows="2" placeholder="话题命名提示词" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">用话题命名作为消息标题</div><div class="setting-desc">消息列表标题使用话题名称</div></div>
                <el-switch :model-value="app.settings.useTopicNamingForMessageTitle" @change="(v: boolean) => set('useTopicNamingForMessageTitle', v)" />
              </div>
            </div>
          </template>

          <!-- 3. 输入 -->
          <template v-else-if="settingTab === 'input'">
            <div class="section-title"><h2>输入</h2><p>发送快捷键和输入行为。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">发送快捷键</div><div class="setting-desc">选择发送消息的快捷键</div></div>
                <el-select :model-value="app.settings.sendMessageShortcut" @change="(v: string) => set('sendMessageShortcut', v as Settings['sendMessageShortcut'])" size="default">
                  <el-option label="Enter" value="Enter" /><el-option label="Ctrl+Enter" value="Ctrl+Enter" /><el-option label="Shift+Enter" value="Shift+Enter" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示 Token 估算</div><div class="setting-desc">在输入框显示估算 Token 数</div></div>
                <el-switch :model-value="app.settings.showInputEstimatedTokens" @change="(v: boolean) => set('showInputEstimatedTokens', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">长文本粘贴转附件</div><div class="setting-desc">超过阈值的文本自动转为文件</div></div>
                <el-switch :model-value="app.settings.pasteLongTextAsFile" @change="(v: boolean) => set('pasteLongTextAsFile', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">长文本阈值</div><div class="setting-desc">超过此字符数的粘贴文本转为文件</div></div>
                <el-input-number :model-value="app.settings.pasteLongTextThreshold" :min="100" :step="100" @change="(v: number) => set('pasteLongTextThreshold', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">折叠显示模式</div><div class="setting-desc">消息折叠的展示方式</div></div>
                <el-select :model-value="app.settings.foldDisplayMode" @change="(v: string) => set('foldDisplayMode', v as Settings['foldDisplayMode'])" size="default">
                  <el-option label="展开" value="expanded" /><el-option label="紧凑" value="compact" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">网格列数</div><div class="setting-desc">多模型网格布局的列数</div></div>
                <el-input-number :model-value="app.settings.gridColumns" :min="1" :max="6" @change="(v: number) => set('gridColumns', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">消息导航</div><div class="setting-desc">消息导航的显示方式</div></div>
                <el-input :model-value="app.settings.messageNavigation" @update:model-value="(v: string) => set('messageNavigation', v)" placeholder="如 buttons" size="default" style="width: 200px" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">删除消息确认</div><div class="setting-desc">删除消息时弹出确认框</div></div>
                <el-switch :model-value="app.settings.confirmDeleteMessage" @change="(v: boolean) => set('confirmDeleteMessage', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">重新生成确认</div><div class="setting-desc">重新生成消息时弹出确认框</div></div>
                <el-switch :model-value="app.settings.confirmRegenerateMessage" @change="(v: boolean) => set('confirmRegenerateMessage', v)" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">思考内容自动折叠</div><div class="setting-desc">流式结束后自动折叠思考过程</div></div>
                <el-switch :model-value="app.settings.thoughtAutoCollapse" @change="(v: boolean) => set('thoughtAutoCollapse', v)" />
              </div>
            </div>
          </template>

          <!-- 4. 消息显示 -->
          <template v-else-if="settingTab === 'message'">
            <div class="section-title"><h2>消息显示</h2><p>消息样式、字体和显示选项。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">消息样式</div><div class="setting-desc">无背景或气泡</div></div>
                <el-select :model-value="app.settings.messageStyle" @change="(v: string) => set('messageStyle', v as Settings['messageStyle'])" size="default">
                  <el-option label="简洁" value="plain" /><el-option label="气泡" value="bubble" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">消息字体</div><div class="setting-desc">消息正文的字体族</div></div>
                <el-select :model-value="app.settings.messageFont" @change="(v: string) => set('messageFont', v as Settings['messageFont'])" size="default">
                  <el-option label="系统默认" value="system" /><el-option label="衬线" value="serif" /><el-option label="等宽" value="mono" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示消息分隔线</div><div class="setting-desc">在连续消息之间显示细分隔线</div></div>
                <el-switch :model-value="app.settings.showMessageDivider" @change="(v: boolean) => set('showMessageDivider', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示 Token 数</div><div class="setting-desc">在消息底部显示 Token 消耗</div></div>
                <el-switch :model-value="app.settings.showTokens" @change="(v: boolean) => set('showTokens', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Markdown 中显示模型提供者</div><div class="setting-desc">在代码块信息栏显示 Provider 名称</div></div>
                <el-switch :model-value="app.settings.showModelProviderInMarkdown" @change="(v: boolean) => set('showModelProviderInMarkdown', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Markdown 中显示模型名</div><div class="setting-desc">在代码块信息栏显示模型名称</div></div>
                <el-switch :model-value="app.settings.showModelNameInMarkdown" @change="(v: boolean) => set('showModelNameInMarkdown', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示消息大纲</div><div class="setting-desc">侧边显示消息结构大纲</div></div>
                <el-switch :model-value="app.settings.showMessageOutline" @change="(v: boolean) => set('showMessageOutline', v)" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">输入消息渲染为 Markdown</div><div class="setting-desc">用户输入的消息也按 Markdown 渲染</div></div>
                <el-switch :model-value="app.settings.renderInputMessageAsMarkdown" @change="(v: boolean) => set('renderInputMessageAsMarkdown', v)" />
              </div>
            </div>
          </template>

          <!-- 5. 代码 -->
          <template v-else-if="settingTab === 'code'">
            <div class="section-title"><h2>代码</h2><p>代码块显示与编辑器配置。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">显示行号</div><div class="setting-desc">代码块中显示行号</div></div>
                <el-switch :model-value="app.settings.codeShowLineNumbers" @change="(v: boolean) => set('codeShowLineNumbers', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">允许换行</div><div class="setting-desc">长行代码自动换行</div></div>
                <el-switch :model-value="app.settings.codeWrappable" @change="(v: boolean) => set('codeWrappable', v)" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">允许折叠</div><div class="setting-desc">代码块支持折叠/展开</div></div>
                <el-switch :model-value="app.settings.codeCollapsible" @change="(v: boolean) => set('codeCollapsible', v)" />
              </div>
            </div>
            <div class="card">
              <div class="card-header"><div><div class="card-title">代码编辑器</div><div class="card-sub">CodeMirror 编辑器选项</div></div></div>
              <div class="setting-row">
                <div><div class="setting-label">启用编辑器</div><div class="setting-desc">允许在消息中直接编辑代码</div></div>
                <el-switch :model-value="app.settings.codeEditor.enabled" @change="(v: boolean) => app.updateSettings({ codeEditor: { ...app.settings.codeEditor, enabled: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">浅色主题</div><div class="setting-desc">浅色模式下的 CodeMirror 主题</div></div>
                <el-input :model-value="app.settings.codeEditor.themeLight" @update:model-value="(v: string) => app.updateSettings({ codeEditor: { ...app.settings.codeEditor, themeLight: v } })" size="default" style="width: 200px" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">深色主题</div><div class="setting-desc">深色模式下的 CodeMirror 主题</div></div>
                <el-input :model-value="app.settings.codeEditor.themeDark" @update:model-value="(v: string) => app.updateSettings({ codeEditor: { ...app.settings.codeEditor, themeDark: v } })" size="default" style="width: 200px" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">高亮当前行</div><div class="setting-desc">高亮光标所在行</div></div>
                <el-switch :model-value="app.settings.codeEditor.highlightActiveLine" @change="(v: boolean) => app.updateSettings({ codeEditor: { ...app.settings.codeEditor, highlightActiveLine: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示折叠标记</div><div class="setting-desc">在行号栏显示折叠图标</div></div>
                <el-switch :model-value="app.settings.codeEditor.foldGutter" @change="(v: boolean) => app.updateSettings({ codeEditor: { ...app.settings.codeEditor, foldGutter: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">自动补全</div><div class="setting-desc">编辑器启用代码自动补全</div></div>
                <el-switch :model-value="app.settings.codeEditor.autocompletion" @change="(v: boolean) => app.updateSettings({ codeEditor: { ...app.settings.codeEditor, autocompletion: v } })" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">快捷键映射</div><div class="setting-desc">启用 CodeMirror 快捷键</div></div>
                <el-switch :model-value="app.settings.codeEditor.keymap" @change="(v: boolean) => app.updateSettings({ codeEditor: { ...app.settings.codeEditor, keymap: v } })" />
              </div>
            </div>
            <div class="card">
              <div class="card-header"><div><div class="card-title">代码预览</div><div class="card-sub">代码块预览主题</div></div></div>
              <div class="setting-row">
                <div><div class="setting-label">浅色预览主题</div><div class="setting-desc">浅色模式下的预览主题</div></div>
                <el-input :model-value="app.settings.codePreview.themeLight" @update:model-value="(v: string) => app.updateSettings({ codePreview: { ...app.settings.codePreview, themeLight: v } })" size="default" style="width: 200px" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">深色预览主题</div><div class="setting-desc">深色模式下的预览主题</div></div>
                <el-input :model-value="app.settings.codePreview.themeDark" @update:model-value="(v: string) => app.updateSettings({ codePreview: { ...app.settings.codePreview, themeDark: v } })" size="default" style="width: 200px" />
              </div>
            </div>
          </template>

          <!-- 6. 数学 -->
          <template v-else-if="settingTab === 'math'">
            <div class="section-title"><h2>数学</h2><p>数学公式渲染引擎。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">渲染引擎</div><div class="setting-desc">选择数学公式渲染引擎</div></div>
                <el-select :model-value="app.settings.mathEngine" @change="(v: string) => set('mathEngine', v as Settings['mathEngine'])" size="default">
                  <el-option label="KaTeX" value="katex" /><el-option label="MathJax" value="mathjax" />
                </el-select>
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">支持单 $ 语法</div><div class="setting-desc">允许用 $...$ 包裹行内公式</div></div>
                <el-switch :model-value="app.settings.mathEnableSingleDollar" @change="(v: boolean) => set('mathEnableSingleDollar', v)" />
              </div>
            </div>
          </template>

          <!-- 7. 翻译 -->
          <template v-else-if="settingTab === 'translate'">
            <div class="section-title"><h2>翻译</h2><p>自动翻译与翻译确认。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">空格触发翻译</div><div class="setting-desc">连续三次空格自动翻译</div></div>
                <el-switch :model-value="app.settings.autoTranslateWithSpace" @change="(v: boolean) => set('autoTranslateWithSpace', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">显示翻译确认</div><div class="setting-desc">翻译前弹出确认框</div></div>
                <el-switch :model-value="app.settings.showTranslateConfirm" @change="(v: boolean) => set('showTranslateConfirm', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">翻译 Prompt</div><div class="setting-desc">翻译时使用的系统提示词</div></div>
                <el-input :model-value="app.settings.translateModelPrompt" @update:model-value="(v: string) => set('translateModelPrompt', v)" type="textarea" :rows="3" placeholder="翻译提示词" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">目标语言</div><div class="setting-desc">翻译的目标语言</div></div>
                <el-select :model-value="app.settings.targetLanguage" @change="(v: string) => set('targetLanguage', v)" size="default" style="width: 200px">
                  <el-option label="简体中文" value="zh-CN" /><el-option label="English" value="en-US" /><el-option label="日本語" value="ja-JP" /><el-option label="Français" value="fr-FR" />
                </el-select>
              </div>
            </div>
          </template>

          <!-- 8. 导出 -->
          <template v-else-if="settingTab === 'export'">
            <div class="section-title"><h2>导出</h2><p>配置导出菜单中显示的选项。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">图片</div><div class="setting-desc">导出为图片</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.image" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, image: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Markdown</div><div class="setting-desc">导出为 Markdown</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.markdown" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, markdown: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Markdown (含推理)</div><div class="setting-desc">导出含推理过程的 Markdown</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.markdown_reason" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, markdown_reason: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Notion</div><div class="setting-desc">导出到 Notion</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.notion" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, notion: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">语雀</div><div class="setting-desc">导出到语雀</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.yuque" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, yuque: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Joplin</div><div class="setting-desc">导出到 Joplin</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.joplin" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, joplin: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Obsidian</div><div class="setting-desc">导出到 Obsidian</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.obsidian" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, obsidian: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">思源</div><div class="setting-desc">导出到思源笔记</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.siyuan" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, siyuan: v } })" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">Word (docx)</div><div class="setting-desc">导出为 Word 文档</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.docx" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, docx: v } })" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">纯文本</div><div class="setting-desc">导出为纯文本</div></div>
                <el-switch :model-value="app.settings.exportMenuOptions.plain_text" @change="(v: boolean) => app.updateSettings({ exportMenuOptions: { ...app.settings.exportMenuOptions, plain_text: v } })" />
              </div>
            </div>
          </template>

          <!-- 9. 多模型 -->
          <template v-else-if="settingTab === 'multimodel'">
            <div class="section-title"><h2>多模型</h2><p>多模型并行回复的布局与交互。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">多模型消息样式</div><div class="setting-desc">多模型回复的展示方式</div></div>
                <el-select :model-value="app.settings.multiModelMessageStyle" @change="(v: string) => set('multiModelMessageStyle', v)" size="default">
                  <el-option label="折叠" value="fold" /><el-option label="横向" value="horizontal" /><el-option label="网格" value="grid" />
                </el-select>
              </div>
              <div class="setting-row">
                <div><div class="setting-label">退格删除模型</div><div class="setting-desc">在输入框按退格键删除已选模型</div></div>
                <el-switch :model-value="app.settings.enableBackspaceDeleteModel" @change="(v: boolean) => set('enableBackspaceDeleteModel', v)" />
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">快捷面板触发</div><div class="setting-desc">启用快捷模型选择面板</div></div>
                <el-switch :model-value="app.settings.enableQuickPanelTriggers" @change="(v: boolean) => set('enableQuickPanelTriggers', v)" />
              </div>
            </div>
          </template>

          <!-- 10. 布局 -->
          <template v-else-if="settingTab === 'layout'">
            <div class="section-title"><h2>布局</h2><p>界面布局和导航栏位置。</p></div>
            <div class="card">
              <div class="setting-row">
                <div><div class="setting-label">窄屏模式</div><div class="setting-desc">窗口较窄时自动切换为紧凑布局</div></div>
                <el-switch :model-value="app.settings.narrowMode" @change="(v: boolean) => set('narrowMode', v)" />
              </div>
              <div class="setting-row">
                <div><div class="setting-label">导航栏位置</div><div class="setting-desc">主导航栏显示在哪一侧</div></div>
                <el-select :model-value="app.settings.navbarPosition" @change="(v: string) => set('navbarPosition', v as Settings['navbarPosition'])" size="default">
                  <el-option label="左侧" value="left" /><el-option label="右侧" value="right" />
                </el-select>
              </div>
              <div class="setting-row no-border">
                <div><div class="setting-label">主题色</div><div class="setting-desc">应用主色调</div></div>
                <el-color-picker :model-value="app.settings.userTheme.colorPrimary" @update:model-value="(v: string) => app.updateSettings({ userTheme: { ...app.settings.userTheme, colorPrimary: v } })" />
              </div>
            </div>
          </template>

          <!-- 11. 自定义 -->
          <template v-else-if="settingTab === 'custom'">
            <div class="section-title"><h2>自定义</h2><p>自定义 CSS 样式。</p></div>
            <div class="card">
              <div class="card-header"><div><div class="card-title">自定义 CSS</div><div class="card-sub">注入全局 CSS 覆盖默认样式</div></div></div>
              <el-input :model-value="app.settings.customCss" @update:model-value="(v: string) => set('customCss', v)" type="textarea" :rows="12" placeholder="/* 在此输入自定义 CSS */" />
            </div>
          </template>

          <!-- Provider -->
          <template v-else-if="settingTab === 'provider'">
            <div class="section-title"><h2>Provider 与模型</h2><p>管理 API 连接和可用模型。</p></div>
            <div v-for="p in app.providers" :key="p.id" class="card">
              <div class="card-header">
                <div><div class="card-title">{{ p.name }}</div><div class="card-sub">{{ p.type }} · {{ p.apiHost }}</div></div>
                <span :class="p.enabled ? 'badge-success' : 'badge-muted'"><span v-if="p.enabled" class="status-dot" />{{ p.enabled ? '已就绪' : '未启用' }}</span>
              </div>
              <div class="form-grid">
                <label class="form-label">API Base URL<el-input :model-value="p.apiHost" size="default" /></label>
                <label class="form-label">API Key<el-input :model-value="p.apiKey ? 'sk-••••••••' : ''" type="password" size="default" /></label>
              </div>
              <div class="card-footer"><el-button @click="testConnection">测试连接</el-button></div>
            </div>
            <div class="card">
              <div class="card-header"><div><div class="card-title">已启用模型</div><div class="card-sub">模型参数归属于 Assistant</div></div><el-button type="primary" size="small">添加模型</el-button></div>
              <div class="model-list">
                <div v-for="m in app.providers[0]?.models" :key="m.id" class="model-row">
                  <div><div class="model-name">{{ m.name }}</div><div class="model-sub">{{ m.group }}</div></div>
                  <span :class="m.enabled ? 'badge-success' : 'badge-muted'">{{ m.enabled ? '启用' : '未启用' }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 助手 -->
          <template v-else-if="settingTab === 'assistant'">
            <div class="section-title"><h2>助手</h2><p>管理 AI 助手。</p></div>
            <div class="card">
              <div v-for="a in app.assistants" :key="a.id" class="model-row">
                <div><div class="model-name">{{ a.emoji }} {{ a.name }}</div><div class="model-sub">{{ a.model?.name ?? '未设置模型' }}</div></div>
                <span :class="a.enabled ? 'badge-success' : 'badge-muted'">{{ a.isDefault ? '默认 · ' : '' }}{{ a.enabled ? '启用' : '未启用' }}</span>
              </div>
              <div class="card-footer"><el-button type="primary">添加助手</el-button></div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.settings-main { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
.settings-header { display: flex; align-items: center; height: 60px; shrink: 0; border-bottom: 1px solid #e5e7eb; padding: 0 24px; background: #fff; }
.settings-body { flex: 1; overflow-y: auto; padding: 32px 20px; }
.settings-container { max-width: 980px; margin: 0 auto; display: grid; gap: 24px; @media (min-width: 768px) { grid-template-columns: 210px 1fr; } }
.settings-nav { display: none; @media (min-width: 768px) { display: block; } .nav-group-label { padding: 0 12px; margin-bottom: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #667085; } }
.nav-item { display: flex; align-items: center; gap: 12px; width: 100%; border-radius: 12px; padding: 10px 12px; text-align: left; font-size: 14px; color: #667085; &:hover { background: #fff; } &.active { background: #efefff; font-weight: 500; color: #5b56d6; } }
.mobile-select { display: block; @media (min-width: 768px) { display: none; } }
.settings-content { display: flex; flex-direction: column; gap: 20px; }
.section-title { h2 { font-size: 20px; font-weight: 600; margin: 0; } p { margin-top: 4px; font-size: 14px; color: #667085; } }
.card { border-radius: 16px; border: 1px solid #e5e7eb; background: #fff; padding: 20px; box-shadow: 0 1px 3px rgba(16,24,40,0.06); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-weight: 500; }
.card-sub { margin-top: 4px; font-size: 12px; color: #667085; }
.card-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.badge-success { display: flex; align-items: center; gap: 6px; border-radius: 999px; background: #ecfdf5; padding: 4px 10px; font-size: 12px; color: #047857; }
.badge-muted { border-radius: 999px; background: #f3f4f6; padding: 4px 10px; font-size: 12px; color: #667085; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block; }
.form-grid { display: grid; gap: 12px; @media (min-width: 640px) { grid-template-columns: 1fr 1fr; } }
.form-label { font-size: 12px; color: #667085; .el-input { margin-top: 6px; } }
.model-list { display: flex; flex-direction: column; }
.model-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-top: 1px solid #e5e7eb; &:first-child { border-top: 0; } }
.model-name { font-size: 14px; font-weight: 500; }
.model-sub { font-size: 12px; color: #667085; }
.sync-options { display: grid; gap: 12px; margin-bottom: 20px; @media (min-width: 640px) { grid-template-columns: 1fr 1fr; } }
.sync-option { border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px; text-align: left; &:hover { border-color: #5b56d6; } &.active { border: 2px solid #5b56d6; background: #efefff; .sync-name { color: #5b56d6; } } }
.sync-name { font-weight: 500; }
.sync-desc { margin-top: 4px; font-size: 12px; color: #667085; }
.danger-zone { border-color: #fecaca; background: #fef2f2; .danger-desc { margin-top: 4px; font-size: 12px; line-height: 1.5; color: #b91c1c; } }
.setting-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #e5e7eb; &.no-border { border-bottom: 0; } }
.setting-label { font-size: 14px; font-weight: 500; }
.setting-desc { margin-top: 4px; font-size: 12px; color: #667085; }
</style>
