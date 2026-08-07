---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c9f144a9929011f1bafa525400287e28
    ReservedCode1: bvvFfpwSiN1zwrTDEgD1cmqvXdRMh/tGwGnjw0LmtOo7aqY2AoJuBimi72KopGSkIPYOFa+s7JaFoHyOJZao9pbYG8X06Qw1dNFMmRNDpWn8GjSQz43F2evrHKSOj5CfVD2aJjbFnv7K5W53ZPyM9tjQwd3rm8mLb38QtGVuztEbmtA/j6a6WX8ZehI=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c9f144a9929011f1bafa525400287e28
    ReservedCode2: bvvFfpwSiN1zwrTDEgD1cmqvXdRMh/tGwGnjw0LmtOo7aqY2AoJuBimi72KopGSkIPYOFa+s7JaFoHyOJZao9pbYG8X06Qw1dNFMmRNDpWn8GjSQz43F2evrHKSOj5CfVD2aJjbFnv7K5W53ZPyM9tjQwd3rm8mLb38QtGVuztEbmtA/j6a6WX8ZehI=
---

# 系统状态 — 最小可执行任务清单

> 对应详细设计 §11  
> 目标：Toast 通知、确认对话框、错误边界、加载骨架、空状态、网络检测

## Pinia Store

- [x] 创建 `useSystemStore`，定义 SystemState 类型和初始状态
- [x] 实现 `showToast(toast)`：生成唯一 ID → 插入 toasts 数组 → 自动移除（默认 3s）→ 调用 ElMessage/ElNotification
- [x] 实现 `dismissToast(id)`：手动关闭 ElMessage/ElNotification 实例
- [x] 实现 `showConfirm(dialog)`：弹出确认对话框，返回 Promise<boolean> → 基于 ElMessageBox
- [x] 实现 `closeConfirm()`：关闭 ElMessageBox 对话框
- [x] 实现 `setGlobalError(error)`：设置全局错误状态
- [x] 实现 `clearGlobalError()`：清除全局错误

## 组件

### ToastContainer — [Element Plus: ElMessage / ElNotification]
- [x] 实现 ToastContainer：固定定位右上角（移动端顶部居中），z-index 最高层 → 封装 ElNotification
- [x] 实现 Toast 项：图标（成功绿勾 / 错误红叉 / 警告黄三角 / 信息蓝圈）+ 标题 + 描述 + 关闭按钮 → ElNotification 内置支持
- [x] 实现可选 ActionButton（如撤销按钮）→ ElNotification.onClick 回调
- [x] 实现入场/出场动画：从右侧滑入 + 渐隐退出 → ElNotification 内置
- [x] 实现堆叠展示：多条 Toast 垂直排列，最多显示 5 条

### ConfirmDialog — [Element Plus: ElMessageBox]
- [x] 实现 ConfirmDialogOverlay：半透明遮罩 + 居中卡片 → ElMessageBox 内置
- [x] 实现 ConfirmDialog 内容：图标（默认 info / danger 警告）+ 标题 + 描述文案 → ElMessageBox.confirm/prompt/alert
- [x] 实现按钮组：取消按钮（次要样式）+ 确认按钮（主要样式，danger 变体红色）→ ElMessageBox 内置
- [x] 实现键盘操作：Enter 确认 / Esc 取消 → ElMessageBox 内置支持
- [x] 实现遮罩点击取消（可选配置）→ ElMessageBox.closeOnClickModal

### ErrorBoundary — [自定义组件]
- [x] 实现 ErrorBoundary：捕获子组件渲染错误（onErrorCaptured + `<slot v-else />`）
- [x] 实现 ErrorFallback UI：错误图标 + 错误信息 + 详情展开 + "重试"按钮 + "刷新页面"按钮
- [x] 实现错误上报：捕获到错误时调用上报接口（可选）

### NetworkStatusBar — [自定义组件]
- [x] 实现网络状态监听：online/offline 事件 + navigator.onLine
- [x] 实现离线提示条：顶部黄色/红色横幅"网络连接已断开"
- [x] 实现恢复在线提示：绿色横幅"网络已恢复"（3s 自动消失）
- [x] 实现慢速网络检测：Navigator.connection.effectiveType（可选）

### Loading 骨架屏 — [Element Plus: ElSkeleton]
- [x] 实现 ConversationListSkeleton：侧边栏对话列表骨架（8 条占位行）→ ElSkeleton + ElSkeletonItem
- [x] 实现 MessageListSkeleton：消息区域骨架（用户消息 + AI 消息交替占位）→ ElSkeleton
- [x] 实现 SettingsSkeleton：设置页骨架（导航 + 表单区）→ ElSkeleton
- [x] 实现骨架屏动画：shimmer 脉冲效果 → ElSkeleton animated 属性

### 空状态 — [Element Plus: ElEmpty]
- [x] 实现 NoConversationsEmpty：无对话时展示插画 + "开始新对话"引导文案 + 快捷按钮 → 基于 ElEmpty 拓展
- [x] 实现 NoSearchResultsEmpty：搜索无结果展示插画 + "换个关键词试试"文案 → ElEmpty
- [x] 实现 NoAttachmentsEmpty：无附件展示插画 + 引导文案 → ElEmpty

## 更新提示 — [ElNotification]

- [x] 实现 Service Worker update 检测：监听 `updatefound` 事件
- [x] 实现更新提示 Toast："新版本可用，点击刷新" + 刷新按钮 → ElNotification

## 依赖接口

- 所有模块均可通过 `useSystemStore` 调用 showToast / showConfirm
- 无外部模块依赖（纯通用基础设施）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| Toast 通知 | Element Plus: `ElMessage` / `ElNotification` | 轻量提示用 ElMessage，复杂通知用 ElNotification |
| 确认对话框 | Element Plus: `ElMessageBox` | `confirm`/`prompt`/`alert` 三合一 |
| 骨架屏 | Element Plus: `ElSkeleton` / `ElSkeletonItem` | `animated` 属性自带 shimmer 脉冲 |
| 空状态 | Element Plus: `ElEmpty` | 可自定义 `image` / `description` 插槽 |
| 错误边界 | 自定义 Vue 组件 | `onErrorCaptured` + `slot` 条件渲染 |
| 网络状态栏 | 自定义 Vue 组件 | navigator.onLine + online/offline 事件 |
| 状态管理 | Pinia `defineStore` | 选项式 API（state / getters / actions） |
*（内容由AI生成，仅供参考）*
