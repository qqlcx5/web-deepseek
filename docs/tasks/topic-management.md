# 05 - Topic 管理

> 需求来源：§3 F-03  
> 优先级：P0  
> 目标：使用 Conversations 组件实现 Topic 列表/搜索/菜单/置顶/排序

## 任务清单

### 5.1 Conversations 组件集成

- [ ] 安装确认 Element-Plus-X Conversations 组件可用
- [ ] 创建 `src/components/TopicList.vue`，使用 Conversations 组件
- [ ] `items` 绑定 Topic 列表（映射为 Conversations 的数据结构）
- [ ] `active` 双向绑定当前选中 Topic ID
- [ ] `groupable` 按 Assistant 分组

### 5.2 菜单操作

- [ ] 菜单项：重命名、置顶/取消置顶、清空消息、删除
- [ ] 重命名：进入编辑模式，回车确认，Esc 取消
- [ ] 置顶：切换 `pinned`，触发排序
- [ ] 清空消息：确认对话框 → 清空 `topic.messages`
- [ ] 删除：确认对话框 → 删除 Topic

### 5.3 搜索

- [ ] Conversations 搜索框绑定关键词
- [ ] 按 Topic 名称过滤
- [ ] 清空搜索时恢复全部列表

### 5.4 排序

- [ ] `pinned=true` 优先
- [ ] 其余按 `updatedAt` 倒序
- [ ] 排序在 store 的 `sortedTopics` computed 中实现

### 5.5 自动命名

- [ ] 首条用户消息发送后，截取前 30 字符作为 Topic 名称
- [ ] `isNameManuallyEdited=true` 时不覆盖
- [ ] `enableTopicNaming` 设置控制是否启用自动命名

### 5.6 clickAssistantToShowTopic

- [ ] 设置 `clickAssistantToShowTopic=true` 时，点击 Assistant 展开其 Topic 列表
- [ ] 设置为 false 时，Assistant 列表和 Topic 列表同时展示

### 5.7 Store Actions

- [ ] `createTopic(assistantId)`, `selectTopic(id)`, `deleteTopic(id)`
- [ ] `renameTopic(id, name)`, `togglePin(id)`, `clearTopicMessages(id)`
- [ ] `autoNameTopic(topicId, firstMessage)`

## 验收

- Conversations 组件展示 Topic 列表，分组正常
- 菜单操作全部可用
- 搜索过滤正常
- 排序：置顶优先 + 时间倒序
- 自动命名 30 字符截断 + 手动编辑保护
