---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c8ccf1ed929011f18e22525400f8a581
    ReservedCode1: hvwbp5tKKC1v8241iRwZQIdcjRD7p2p2rDc2SOYNrcm7UhfLwFwH631lqYbvN1gikgFobS8G7N0sbjONcDq089xyQP1B9O5voSl8XjSkgA7JvTMHlwFMSOcSv9ZKVJ4zhxwEya542HfPomj95+PakiuF4w30qHWe5WdV5jrb/avWHnHBoFXhlC69NDQ=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c8ccf1ed929011f18e22525400f8a581
    ReservedCode2: hvwbp5tKKC1v8241iRwZQIdcjRD7p2p2rDc2SOYNrcm7UhfLwFwH631lqYbvN1gikgFobS8G7N0sbjONcDq089xyQP1B9O5voSl8XjSkgA7JvTMHlwFMSOcSv9ZKVJ4zhxwEya542HfPomj95+PakiuF4w30qHWe5WdV5jrb/avWHnHBoFXhlC69NDQ=
---

# 设置 — 最小可执行任务清单

> 对应详细设计 §9  
> 目标：通用设置、快捷键配置、数据管理、关于页

## Pinia Store

- [ ] 创建 `useSettingsStore`，定义 SettingsState 类型和初始状态
- [ ] 实现 `loadSettings()`：GET 获取用户设置 → `request.get`
- [ ] 实现 `updateSettings(patch)`：乐观更新 + PUT 持久化 → `request.put`
- [ ] 实现 `updateShortcut(action, keys)`：PUT 更新快捷键 → `request.put`
- [ ] 实现 `resetShortcuts()`：PUT 重置为默认快捷键 → `request.put`
- [ ] 实现 `clearCache()`：POST 清理服务端缓存 → `request.post`
- [ ] 实现 `exportAllData()`：GET 下载全部数据 → `request.get` blob
- [ ] 实现 `deleteAccount()`：DELETE 删除账户（ElMessageBox 二次确认）

## 组件

### SettingsPage 路由骨架
- [ ] 实现 SettingsSidebar：设置导航项列表（通用 / 模型 / 快捷键 / 数据 / 关于）
- [ ] 实现 SettingsContent：根据路由 section 参数切换内容区

### GeneralSettings — [ElForm + ElSelect + ElRadioGroup + ElSwitch]
- [ ] 实现 LanguageSelect：下拉选择 zh-CN / en-US / auto → ElSelect
- [ ] 实现 ThemeRadioGroup：亮色 / 暗色 / 跟随系统（立即生效）→ ElRadioGroup
- [ ] 实现 FontSizeSelect：小 / 中 / 大 → ElSelect
- [ ] 实现 SendOnEnterToggle：开关控制 Enter 发送行为 → ElSwitch
- [ ] 实现 AutoGenerateTitleToggle：自动生成对话标题开关 → ElSwitch
- [ ] 实现 StreamResponseToggle：默认流式响应开关 → ElSwitch
- [ ] 实现 SaveHistoryToggle：是否保存对话历史 → ElSwitch

### ShortcutSettings — [ElForm]
- [ ] 实现 ShortcutList：渲染 7 个预定义快捷键配置项
- [ ] 实现 ShortcutItem：动作标签 + 当前快捷键显示 → ElInput
- [ ] 实现 EditShortcutButton → KeyCaptureDialog：监听按键组合 → 显示 → 确认保存
- [ ] 实现"重置为默认"按钮 → resetShortcuts

### DataSettings — [ElButton + ElMessageBox]
- [ ] 实现缓存大小展示 + "清理缓存"按钮（ElButton 带 loading）
- [ ] 实现"导出全部数据"按钮（ElButton）→ 触发下载
- [ ] 实现"删除账户"按钮：红色危险按钮（ElButton type="danger"）→ ElMessageBox 二次确认

### AboutSettings
- [ ] 实现版本号展示
- [ ] 实现更新日志链接（外链）
- [ ] 实现反馈入口（外链或表单）

### ProviderSettingsPage（复用模型控制模块）
- [ ] 引入 ProviderSettingsPage 组件（来自 model-control），设置页中直接挂载

## API 层 — [hook-fetch: request]

- [ ] 封装 `GET /api/user/settings` → `request.get`
- [ ] 封装 `PUT /api/user/settings` → `request.put`（乐观更新）
- [ ] 封装 `GET /api/user/shortcuts` → `request.get`
- [ ] 封装 `PUT /api/user/shortcuts` → `request.put`
- [ ] 封装 `POST /api/user/clear-cache` → `request.post`
- [ ] 封装 `DELETE /api/user/account` → `request.delete`（二次确认）
- [ ] 封装 `GET /api/app/version` → `request.get`

## 依赖接口

- 依赖 `useModelStore` 的 ProviderSettingsPage（模型设置作为设置子页复用）
- 向响应式体验模块暴露：theme、fontSize（全局 UI 响应）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 表单控件 | Element Plus: `ElForm` / `ElSelect` / `ElRadioGroup` / `ElSwitch` / `ElInput` | 通用设置 + 快捷键配置 |
| 按钮 | Element Plus: `ElButton` | 操作触发 |
| 确认弹窗 | Element Plus: `ElMessageBox` | 删除账户二次确认 |
| API 请求 | hook-fetch: `request` | `request.get/post/put/delete(url, params)` |
| 状态管理 | Pinia `defineStore` | 设置加载 + 乐观更新 |
*（内容由AI生成，仅供参考）*
