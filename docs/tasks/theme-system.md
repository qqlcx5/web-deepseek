# 16 - 主题系统（ConfigProvider）

> 需求来源：§3 F-08 ConfigProvider  
> 优先级：P1  
> 目标：ConfigProvider 全局主题 + themeOverrides + namespace

## 任务清单

### 16.1 ConfigProvider 集成

- [ ] 在 `App.vue` 根节点包裹 ConfigProvider 组件
- [ ] `theme`：绑定 `settings.theme`（light / dark / auto）
- [ ] `themeOverrides`：绑定 `settings.userTheme` → `{ colorPrimary }` → `--elx-color-primary`
- [ ] `namespace`：'elx'
- [ ] `applyTo`：'root'

### 16.2 主题切换

- [ ] `theme='light'`：浅色模式
- [ ] `theme='dark'`：深色模式
- [ ] `theme='auto'`：跟随系统 prefers-color-scheme
- [ ] 切换时无闪烁

### 16.3 自定义主题色

- [ ] `userTheme.colorPrimary` 颜色选择器
- [ ] 选择后立即更新 `--elx-color-primary` CSS 变量
- [ ] 影响所有 Element-Plus-X 组件

### 16.4 暗色模式适配

- [ ] 所有自定义组件支持暗色模式（使用 CSS 变量）
- [ ] XMarkdown `is-dark` 绑定
- [ ] BubbleList / Bubble / Conversations 暗色适配
- [ ] 代码块暗色主题（codeEditor.themeDark / codePreview.themeDark）

### 16.5 自定义 CSS

- [ ] `settings.customCss` 注入到页面 `<style>` 标签
- [ ] 修改后实时更新

### 16.6 字号

- [ ] `settings.fontSize` 映射到根元素 `font-size` CSS 变量
- [ ] 全局 rem 单位跟随

## 验收

- light/dark/auto 主题切换无闪烁
- themeOverrides 自定义主色生效
- 所有组件暗色模式正常
- 自定义 CSS 注入生效
- 字号调整全局生效
