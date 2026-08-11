# M13 Conversations 侧边栏

## 模块目标

把 `ChatSidebar.vue` 的手写话题列表改为 `vue-element-plus-x` 的 `Conversations` 组件：分组（置顶 / 最近）、菜单（重命名 / 置顶 / 清空消息 / 删除）、搜索、新建话题、当前话题高亮，并按置顶优先 + `updatedAt` 倒序排序。

## 涉及文件

- 改：`src/components/chat/ChatSidebar.vue`（template 列表部分改 Conversations）
- 读：`src/stores/chat.ts`（`chats` / `activeChatId` / `selectAssistant` / `openConversation` / `newConversation` / `deleteChat` / 置顶 / 重命名）
- 读：`src/stores/app.ts`（`settings.pinTopicsToTop` / `showTopics` / `showTopicTime`）
- 参考：`wiki/Conversations.md`

## 子任务

- [x] 把话题列表映射为 `Conversations` items。
  - 输入：`store.chats`（含 `key` / `label` / `pinned` / `group` / `disabled`）。
  - 输出：`computed` 把 topic 列表转为 `Conversations` items；`active` 绑定 `store.activeChatId`；`@click` 调 `store.openConversation(id)`。
  - 完成判定：点击切换当前话题并高亮；数据来源单一（store），不在组件内缓存。

- [x] 实现分组与排序。
  - 输入：`settings.pinTopicsToTop`、`topic.pinned`、`topic.updatedAt`。
  - 输出：置顶项 group=「置顶」、其余 group=「最近」，组内按 `updatedAt` 倒序；关闭置顶聚合时全部按时间倒序。
  - 完成判定：置顶永远在最前；手动改名/收发消息后排序符合预期。

- [x] 实现右键/三点菜单。
  - 输入：`store.renameTopic` / `pinTopic` / `clearMessages` / `deleteChat`、`settings.confirmDeleteMessage`。
  - 输出：`Conversations` 菜单项：重命名（进入内联编辑）、置顶/取消置顶、清空消息（确认）、删除（确认）。
  - 完成判定：所有操作生效；删除/清空前有确认；删除当前话题后自动切换到相邻话题。

- [x] 搜索与新建入口。
  - 输入：`uiStore.modal='command'`（全局搜索）、`store.newConversation`。
  - 输出：顶部搜索按钮打开命令面板；新建按钮在当前 Assistant 下建空话题。
  - 完成判定：搜索可过滤话题；新建话题立即激活并清空消息区。

- [x] 助手切换栏保留。
  - 输入：`store.assistantTabs` / `store.selectAssistant`。
  - 输出：助手 tab 列表保留在侧边栏顶部，切换 Assistant 后话题列表刷新。
  - 完成判定：切换助手后列表只显示该助手的话题；无话题的助手显示空态。

## 验收

- [x] 话题列表使用 `Conversations` 渲染，无手写 `v-for` topic 列表。
- [x] 分组、排序、置顶、重命名、删除全部可用。
- [x] 桌面固定侧栏 + 移动端抽屉均可操作。
- [x] `npm run type-check` 通过。（验证日期：2026-08-11）
