# 08 - 思考过程展示

> 需求来源：§3 F-04 thinking block  
> 优先级：P0  
> 目标：Thinking 组件 + ThoughtChain 组件展示 AI 思考过程

## 任务清单

### 8.1 Thinking 组件集成

- [ ] 创建 `src/components/ThinkingBlock.vue`，使用 Thinking 组件
- [ ] `status` 绑定 thinking block 的状态：start → thinking → end / error
- [ ] `content` 绑定思考内容文本
- [ ] `autoCollapse` 绑定 `settings.thoughtAutoCollapse`

### 8.2 状态映射

- [ ] block.status='streaming' → Thinking status='thinking'
- [ ] block.status='success' → Thinking status='end'
- [ ] block.status='error' → Thinking status='error'
- [ ] 流开始时 status='start'

### 8.3 ThoughtChain 集成

- [ ] 创建 `src/components/ThinkingChain.vue`，使用 ThoughtChain 组件
- [ ] `thinkingItems` 绑定多步骤思考数组
- [ ] 每个步骤 status：success / loading / error
- [ ] 按时间轴展示思考步骤

### 8.4 thinking_millsec 记录

- [ ] 流开始时记录起始时间
- [ ] 流结束时计算 `thinking_millsec = end - start`
- [ ] 写入 thinking block 的 `thinking_millsec` 字段

### 8.5 折叠控制

- [ ] `thoughtAutoCollapse=true`：思考结束后自动折叠
- [ ] `thoughtAutoCollapse=false`：思考结束后保持展开
- [ ] 用户可手动点击展开/折叠

### 8.6 样式定制

- [ ] 暗色模式下 Thinking 组件样式适配
- [ ] 思考内容使用等宽字体或区分样式
- [ ] 折叠时显示摘要（如"思考了 N 秒"）

## 验收

- Thinking 组件状态随 block status 变化（start→thinking→end）
- ThoughtChain 多步骤时间轴正常
- thinking_millsec 正确记录
- 折叠/展开行为受设置控制
