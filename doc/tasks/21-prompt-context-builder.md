# M21 Prompt 组装与上下文截断

## 模块目标

参考 ai-reader `services/prompt/*`，建立 Prompt 组装与上下文（documents / 历史消息）截断能力，供 chat-service 调用。核心原则（与 ai-reader 一致）：**不写死 AI 身份**，systemPrompt 来自 Assistant/全局；上下文作为"事实材料"注入，可被裁剪到 token 上限。

> 依赖：M20（适配器接口）。documents 上下文依赖 M23；无 documents 时仅做历史截断。

## 涉及文件

- 新增：`src/services/prompt/builder.ts`、`context.ts`、`truncate.ts`
- 改：`src/services/chat-service.ts`（请求体由 builder 组装）
- 改：`src/types/index.ts`（`Settings` 增 `context` 子设置）
- 参考：`ai-reader/services/prompt/{builder,context,truncate}.ts`、`ai-reader/doc/detail.md` §10

## 子任务

- [x] PromptBuilder 组装。
  - 输入：systemPrompt、contextText、history messages、userInput。
  - 输出：`build({assistant, contextText, history, userInput}) → { systemPrompt?, messages[] }`；system 为空则不注入 system role。
  - 完成判定：与 ai-reader §10.3 规则一致；不出现硬编码身份文案。

- [x] 页面/文档上下文格式化。
  - 输入：`DocumentEntity`（M23）或空。
  - 输出：`buildPageContext(doc, settings)` 生成 `<page_context>` 或 Markdown 块；按 `includeUrl/Title/CapturedAt` 开关。
  - 完成判定：开关生效；无 document 时返回空串。

- [x] token 估算截断。
  - 输入：contextText、`model.contextLength`、`settings.context.maxContextTokens`、`maxHistoryMessages`。
  - 输出：`truncateContext(text, budget)` 按 ~4 字符/token 截断，优先保留头部元数据；历史按最近 N 条保留。
  - 完成判定：超长文档不溢出模型窗口；用户当前问题不参与截断。

- [x] chat-service 接入 builder。
  - 输入：当前 Topic 历史、Assistant.prompt、（可选）当前 document。
  - 输出：请求 messages 由 builder 产出，替换现有 `context.filter(...).map(...)` 内联逻辑。
  - 完成判定：对话行为不回归；注入 document 后模型可见其内容。

## 验收

- [x] 无硬编码身份说明；systemPrompt 空时不发 system role。
- [x] 超长上下文被截断且不报 token 超限。
- [x] `npm run type-check` 通过。
