# M20 多 Provider AI 适配

## 模块目标

参考 ai-reader `services/ai/*`，在现有「仅 OpenAI-compatible」的 chat-api 之上引入统一 Provider 适配层，新增 **Anthropic** 与 **Ollama** 两条路径，加工厂路由与连接测试。web-deepseek 现有 `Provider/Model` 模型（`types/index.ts`）不变，新增 `providerType: 'openai-compatible' | 'anthropic' | 'ollama'` 字段区分。

> 不依赖 documents，可独立于 M23–M26 先行。

## 涉及文件

- 新增：`src/services/ai/shared.ts`、`openai-compatible.ts`、`anthropic.ts`、`ollama.ts`、`factory.ts`、`types.ts`、`test-connection.service.ts`
- 改：`src/services/chat-service.ts`（用 `createProvider` 取适配器替换直接 `chatApi`）
- 改：`src/types/index.ts`（`Provider` 增 `providerType`）
- 参考：`ai-reader/services/ai/{shared,openai-compatible,anthropic,ollama,factory,test-connection.service}.ts`

## 子任务

- [ ] 定义统一适配器接口。
  - 输入：`Model`、`messages`、`signal`。
  - 输出：`AIProvider { chat(); streamChat(input, {onToken,onDone,onError}); testConnection() }`，`StreamCallbacks` 与 `ChatInput` 类型对齐 ai-reader。
  - 完成判定：三条 provider 实现同一接口；chat-service 只依赖接口。

- [ ] 重构 OpenAI-compatible 适配器（沿用现有 hook-fetch/chatApi）。
  - 输入：现有 `chatApi.chatStream`。
  - 输出：`openai-compatible.ts` 包装为 `AIProvider`；`shared.ts` 抽 `normalizeBaseUrl`/`fetchWithTimeout`/`anySignal`。
  - 完成判定：现有 DeepSeek/OpenAI 流式行为不回归。

- [ ] 实现 Anthropic 适配器。
  - 输入：`x-api-key` + `anthropic-version`；Messages API；SSE `content_block_delta`。
  - 输出：`anthropic.ts` 实现 `chat/streamChat/testConnection`；reasoning 走 `thinking` block；正文走 `text` delta。
  - 完成判定：Claude 模型可流式对话；思考内容入 thinking block。

- [ ] 实现 Ollama 适配器。
  - 输入：`/api/chat` NDJSON 流式、`/api/tags` 连通测试。
  - 输出：`ollama.ts` 实现 NDJSON 逐行解析、`testConnection` 用 `/api/tags`。
  - 完成判定：本地 Ollama 可对话与测试连通。

- [ ] 工厂路由 + 测试连接服务。
  - 输入：`provider.providerType`。
  - 输出：`factory.ts` 的 `createProvider(provider)` 按类型返回单例适配器；`test-connection.service.ts` 10s 超时返回 `{ok,latency,error}`。
  - 完成判定：ProviderSettings 里"测试连接"按钮按类型路由；结果写回 `model.lastTestStatus`。

## 数据契约

- `Provider` 新增可选 `providerType`，默认 `'openai-compatible'`，旧数据兼容。
- 适配器错误统一抛 `ApiError`（沿用 `chat-api.ts`），chat-service 状态机不变。

## 验收

- [ ] 三种 provider 均可流式对话（手动）。
- [ ] 测试连接按钮返回成功/失败/延迟。
- [ ] `npm run type-check` 通过。
