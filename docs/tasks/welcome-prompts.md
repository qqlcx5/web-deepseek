# 14 - 欢迎页与提示

> 需求来源：§3 F-09  
> 优先级：P1  
> 目标：新建 Topic 时显示 Welcome + Prompts 组件

## 任务清单

### 14.1 Welcome 组件集成

- [ ] 创建 `src/components/WelcomePage.vue`，使用 Welcome 组件
- [ ] `title`：根据 Assistant 名称动态生成（如"开始与 ✨ Orbit Assistant 对话"）
- [ ] `description`：Assistant.description 或默认描述
- [ ] `icon`：Assistant emoji 或自定义图标
- [ ] `direction`：ltr
- [ ] `variant`：filled

### 14.2 Prompts 组件集成

- [ ] 使用 Prompts 组件
- [ ] `items` 绑定提示词列表
- [ ] `@item-click` 点击后将内容填入 XSender
- [ ] `wrap` 换行控制

### 14.3 提示词数据源

- [ ] Assistant 配置了 `regularPhrases` 时使用 Assistant 的短语
- [ ] 未配置时使用全局默认提示词列表
- [ ] 默认提示词：翻译、总结、代码review、头脑风暴等

### 14.4 显示条件

- [ ] 仅在 Topic.messages 为空时显示
- [ ] 有消息后隐藏 Welcome + Prompts
- [ ] 新建 Topic 时自动显示

### 14.5 样式

- [ ] Welcome 居中显示
- [ ] Prompts 在 Welcome 下方排列
- [ ] 暗色模式适配

## 验收

- 新建 Topic 时 Welcome + Prompts 正确显示
- 点击 Prompt 项内容填入输入框
- 有消息后自动隐藏
- 提示词优先使用 Assistant 配置
