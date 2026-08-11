# 13 - 设置与界面

> 需求来源：§3 F-08, §2.6 Settings  
> 优先级：P1  
> 目标：设置面板展示全部白名单字段，修改立即生效

## 任务清单

### 13.1 设置面板布局

- [ ] 创建 `src/views/SettingsView.vue`（改造现有）
- [ ] 分区：基础、话题、输入、消息显示、代码、数学、翻译、导出、多模型、布局、自定义
- [ ] 每个分区使用 ElCollapsePanel 或 Tabs

### 13.2 基础设置

- [ ] language：zh-CN / en-US 切换
- [ ] theme：light / dark / auto
- [ ] fontSize：数字输入（12-20）
- [ ] userName：文本输入

### 13.3 话题设置

- [ ] showAssistants, showTopics 开关
- [ ] topicPosition：left / right
- [ ] showTopicTime, pinTopicsToTop 开关
- [ ] assistantIconType 选择
- [ ] clickAssistantToShowTopic 开关
- [ ] enableTopicNaming 开关 + topicNamingPrompt 文本
- [ ] useTopicNamingForMessageTitle 开关

### 13.4 输入设置

- [ ] sendMessageShortcut 选择
- [ ] showInputEstimatedTokens 开关
- [ ] pasteLongTextAsFile 开关 + pasteLongTextThreshold 数字
- [ ] foldDisplayMode 选择 + gridColumns 数字
- [ ] messageNavigation 输入
- [ ] confirmDeleteMessage, confirmRegenerateMessage 开关
- [ ] thoughtAutoCollapse 开关

### 13.5 消息显示设置

- [ ] messageStyle：plain / bubble
- [ ] messageFont：system / serif / mono
- [ ] showMessageDivider, showTokens 开关
- [ ] showModelProviderInMarkdown, showModelNameInMarkdown 开关
- [ ] showMessageOutline, renderInputMessageAsMarkdown 开关

### 13.6 代码设置

- [ ] codeShowLineNumbers, codeWrappable, codeCollapsible 开关
- [ ] codeEditor 子项：enabled, themeLight, themeDark, highlightActiveLine, foldGutter, autocompletion, keymap
- [ ] codePreview：themeLight, themeDark

### 13.7 数学与翻译

- [ ] mathEngine：katex / mathjax
- [ ] mathEnableSingleDollar 开关
- [ ] autoTranslateWithSpace, showTranslateConfirm 开关
- [ ] translateModelPrompt, targetLanguage 输入

### 13.8 导出与多模型

- [ ] exportMenuOptions 各格式开关
- [ ] multiModelMessageStyle 选择
- [ ] enableBackspaceDeleteModel, enableQuickPanelTriggers 开关

### 13.9 布局与自定义

- [ ] narrowMode 开关
- [ ] navbarPosition：left / right
- [ ] userTheme.colorPrimary 颜色选择器
- [ ] customCss 文本域

### 13.10 立即生效

- [ ] theme / fontSize / messageStyle / codeShow* 立即生效（watch settings → 更新 CSS 变量）
- [ ] 修改后触发防抖保存

## 验收

- 设置面板展示全部白名单字段
- 主题/字号/消息样式/代码显示立即生效
- 修改后数据持久化
