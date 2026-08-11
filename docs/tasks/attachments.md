# 15 - 附件管理

> 需求来源：§3 F-11  
> 优先级：P1  
> 目标：Attachments + FilesCard 实现文件上传与管理

## 任务清单

### 15.1 Attachments 组件集成

- [ ] 创建 `src/components/ChatAttachments.vue`，使用 Attachments 组件
- [ ] 拖拽上传支持
- [ ] 点击上传支持
- [ ] `before-upload` 校验：文件大小、类型
- [ ] `http-request` 自定义上传逻辑（本地存储到 IndexedDB 或内存）
- [ ] `@upload-drop` 事件处理
- [ ] `@delete-card` 事件处理

### 15.2 FilesCard 集成

- [ ] 使用 FilesCard 组件展示已上传文件
- [ ] 16 种文件类型图标自动匹配
- [ ] 文件名、描述、状态显示
- [ ] `imgVariant`：square / circle
- [ ] `showDelIcon` 控制删除按钮

### 15.3 文件状态管理

- [ ] 上传中：loading 状态
- [ ] 上传成功：success 状态
- [ ] 上传失败：error 状态 + 错误信息
- [ ] 删除：从列表移除

### 15.4 文件类型支持

- [ ] 图片：jpg, png, gif, webp, svg
- [ ] 文档：pdf, doc, docx, txt, md
- [ ] 代码：js, ts, py, json, xml, html, css
- [ ] 压缩：zip, rar, 7z
- [ ] 其他：默认图标

### 15.5 XSender 集成

- [ ] 在 XSender 的 `#action-list` 插槽中添加附件按钮
- [ ] 点击附件按钮展开 Attachments 区域
- [ ] 附件列表显示在输入框上方

### 15.6 大小限制

- [ ] 默认最大 10MB
- [ ] 超过限制时提示
- [ ] 可在设置中配置

## 验收

- 拖拽/点击上传文件正常
- FilesCard 正确展示文件信息和图标
- 删除附件正常
- 文件大小校验生效
- 附件按钮集成到 XSender
