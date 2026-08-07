---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_ca807880929011f1bafa525400287e28
    ReservedCode1: PTBKVtLrctxeuROhUrz2YEZoQHS+v2LRrTypAC2Ut1mAjhTRvI/dOp/eiqZs7ZerPZgy3wRL9R89vKoacI9OG8nhaazaSdDs5zXlJjvyNuW9Y32l057JaxW2/q9fJAKP92bbDeNiUp7cjUMYry3tg0A+RYgGKAo7FuIYu5IMs+3nhsYPRIJelvfKXfY=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_ca807880929011f1bafa525400287e28
    ReservedCode2: PTBKVtLrctxeuROhUrz2YEZoQHS+v2LRrTypAC2Ut1mAjhTRvI/dOp/eiqZs7ZerPZgy3wRL9R89vKoacI9OG8nhaazaSdDs5zXlJjvyNuW9Y32l057JaxW2/q9fJAKP92bbDeNiUp7cjUMYry3tg0A+RYgGKAo7FuIYu5IMs+3nhsYPRIJelvfKXfY=
---

# 管理端原型 — 最小可执行任务清单

> 对应详细设计 §12  
> 目标：管理端仪表盘、用户管理、用量统计、模型管理、系统配置、审计日志

## Pinia Store

- [ ] 创建 `useAdminStore`，定义 AdminState 类型和初始状态
- [ ] 实现 `fetchUsers(page, filters?)`：分页加载用户列表 → `request.get`
- [ ] 实现 `updateUserRole(userId, role)`：修改用户角色 → `request.put`
- [ ] 实现 `toggleUserStatus(userId)`：禁用/启用用户 → `request.put`
- [ ] 实现 `fetchUsageStats(period, dateRange?)`：加载用量统计数据 → `request.get`
- [ ] 实现 `fetchSystemConfig()`：加载系统配置 → `request.get`
- [ ] 实现 `updateSystemConfig(patch)`：PUT 更新系统配置 → `request.put`
- [ ] 实现 `toggleModel(modelId, enabled)`：全局模型开关 → `request.put`
- [ ] 实现 `updateDefaultParams(modelId, params)`：模型默认参数 → `request.put`
- [ ] 实现 `fetchAuditLogs(filters?)`：加载审计日志 → `request.get`

## 组件

### AdminPage 路由骨架
- [ ] 实现 AdminSidebar：仪表盘 / 用户 / 用量 / 模型 / 设置 / 审计日志 导航项
- [ ] 实现 AdminContent：根据路由 section 参数切换内容区

### DashboardOverview — [ElCard + ElStatistic]
- [ ] 实现 4 个 StatCards：用户总数 / 今日 API 调用 / Token 总消耗 / 活跃用户数 → ElCard + ElStatistic
- [ ] 实现最近 7 天用量趋势迷你折线图

### UserManagement — [ElTable + ElSelect + ElButton]
- [ ] 实现 UserSearchBar：邮箱/名称搜索（ElInput）+ 角色筛选（ElSelect）+ 状态筛选（ElSelect）
- [ ] 实现 UserTable：表头（用户信息、角色、状态、用量、操作）→ ElTable
- [ ] 实现 UserRow：头像占位 + 名称/邮箱 + RoleBadge + StatusBadge
- [ ] 实现 StatsPopover：悬停显示该用户对话数/消息数/Token 用量
- [ ] 实现 ActionsMenu：禁用/启用 + 修改角色下拉 → ElSelect + ElButton
- [ ] 实现分页组件 → ElPagination

### UsageAnalytics — [ElCard + ElSelect]
- [ ] 实现 DateRangePicker：快速选择（今天/7天/30天/自定义）→ ElSelect
- [ ] 实现 SummaryCards：API 总调用 / Token 总量 / 预估费用 → ElCard + ElStatistic
- [ ] 实现 UsageChart（折线图）：按日期展示 API 调用和 Token 消耗趋势
- [ ] 实现 ProviderBreakdownChart（饼图）：按模型提供商分布
- [ ] 实现 UserUsageTable（排行表）：按用户 Token 消耗降序排列 → ElTable

### ModelManagement — [ElTable + ElSwitch + ElForm]
- [ ] 实现 ModelToggleList：所有模型的开关列表 → ElTable
- [ ] 实现 ModelToggle 行：模型名称 + Provider 名称 + EnabledSwitch → ElSwitch
- [ ] 实现 DefaultParamsForm：展开编辑默认 Temperature/TopP/MaxTokens → ElForm + ElSlider + ElInputNumber

### SystemConfigPage — [ElForm + ElInput + ElSwitch + ElSelect]
- [ ] 实现 RegistrationOpenToggle：开放注册开关 → ElSwitch
- [ ] 实现 MaxFileSizeInput：文件上传大小上限（MB）→ ElInputNumber
- [ ] 实现 RateLimitInputs：每分钟/每天速率限制 → ElInputNumber
- [ ] 实现 DefaultMaxContextTokensInput：默认上下文 token 上限 → ElInputNumber
- [ ] 实现 AllowedModelsMultiSelect：全局启用的模型 ID 多选 → ElSelect multiple
- [ ] 实现 MaintenanceModeToggle：维护模式开关 → ElSwitch
- [ ] 实现保存按钮（ElButton）+ 操作反馈 → ElMessage

### AuditLogPage — [ElTable + ElSelect + ElInput]
- [ ] 实现 LogFilterBar：时间范围 + 操作类型下拉（ElSelect）+ 用户搜索（ElInput）
- [ ] 实现 LogTable：时间戳 + 管理员 + 操作 + 目标 + 详情展开 → ElTable
- [ ] 实现分页或无限滚动 → ElPagination

## API 层 — [hook-fetch: request]

- [ ] 封装 `GET /api/admin/users` → `request.get`（分页）
- [ ] 封装 `PUT /api/admin/users/:id/role` → `request.put`
- [ ] 封装 `PUT /api/admin/users/:id/status` → `request.put`
- [ ] 封装 `GET /api/admin/usage` → `request.get`
- [ ] 封装 `GET /api/admin/usage/export` → `request.get` blob
- [ ] 封装 `GET /api/admin/models` → `request.get`
- [ ] 封装 `PUT /api/admin/models/:id` → `request.put`
- [ ] 封装 `GET /api/admin/config` → `request.get`
- [ ] 封装 `PUT /api/admin/config` → `request.put`
- [ ] 封装 `GET /api/admin/audit-logs` → `request.get`

## 依赖接口

- 依赖 `adminGuard`（路由守卫）：非管理员禁止访问
- 独立模块，不依赖其他业务模块

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 统计卡片 | Element Plus: `ElCard` / `ElStatistic` | Dashboard 概览 |
| 数据表格 | Element Plus: `ElTable` / `ElPagination` | 用户/日志/用量列表 |
| 表单控件 | Element Plus: `ElForm` / `ElInput` / `ElInputNumber` / `ElSelect` / `ElSwitch` / `ElSlider` | 筛选 + 配置表单 |
| 反馈提示 | Element Plus: `ElMessage` | 操作成功/失败 Toast |
| API 请求 | hook-fetch: `request` | `request.get/post/put/delete(url, params)` |
| 状态管理 | Pinia `defineStore` | 管理端多模块状态 |
*（内容由AI生成，仅供参考）*
