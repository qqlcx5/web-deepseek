# 10 - 请求层（HookFetch + useSend + useXStream）

> 需求来源：§3 F-04 请求层  
> 优先级：P0  
> 目标：封装 HTTP 客户端、流式请求、SSE 处理

## 任务清单

### 10.1 HookFetch 封装

- [ ] 创建 `src/utils/http.ts`，使用 HookFetch
- [ ] `hookFetch.create()` 创建实例，baseURL 来自环境变量
- [ ] authPlugin：注入 `Authorization: Bearer ${apiKey}`
- [ ] errorPlugin：统一错误处理（401/403/429/500）
- [ ] 请求/响应拦截器日志

### 10.2 Chat API 封装

- [ ] 创建 `src/api/chat.ts`
- [ ] `chatApi.chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>>`
- [ ] ChatRequestParams：messages, model, temperature, maxTokens, topP, stream, tools 等
- [ ] 根据 Provider.type 构造不同的请求体（OpenAI 格式 / Anthropic 格式 / Gemini 格式）

### 10.3 useSend 集成

- [ ] 创建 `src/composables/useChatSend.ts`
- [ ] 使用 XRequest.send() 发起请求
- [ ] `.abort()` 中止请求
- [ ] `transformer` 转换响应数据
- [ ] 回调：onMessage, onError, onAbort, onFinish

### 10.4 useXStream 集成

- [ ] 在 useChatSend 中使用 useXStream
- [ ] `startStream({ readableStream })` 启动流处理
- [ ] `cancel()` 中止流
- [ ] `data` 响应式数据更新
- [ ] `isLoading` 状态

### 10.5 SSE 数据解析

- [ ] 解析 SSE `data:` 行
- [ ] 提取 `content` 增量 → main_text block
- [ ] 提取 `reasoning_content` 增量 → thinking block
- [ ] 提取 `usage` → 用户消息 usage 字段
- [ ] 提取 `metrics` → 助手消息 metrics 字段
- [ ] 处理 `[DONE]` 结束标记

### 10.6 Provider 类型适配

- [ ] `openai` 类型：标准 OpenAI Chat Completions API
- [ ] `gemini` 类型：Google Generative Language API
- [ ] `anthropic` 类型：Anthropic Messages API
- [ ] `azure-openai` 类型：Azure OpenAI API
- [ ] `mistral` 类型：Mistral API
- [ ] `vertexai` 类型：Vertex AI API

### 10.7 apiOptions 兼容处理

- [ ] `isNotSupportArrayContent=true`：content 使用字符串而非数组
- [ ] `isNotSupportDeveloperRole=true`：developer 角色消息转为 user
- [ ] `isNotSupportStreamOptions=true`：不发送 stream_options 参数

### 10.8 错误处理

- [ ] 网络错误：写入 error block，message.status='error'
- [ ] API 错误（4xx/5xx）：解析错误响应体写入 error block
- [ ] 超时：写入 error block，状态转为 error
- [ ] abort：不写入 error，状态转为 stopped

## 验收

- HookFetch 请求/响应拦截正常
- SSE 流式数据正确解析为 blocks
- abort 后已收到内容保留
- 6 种 Provider 类型请求体构造正确
- apiOptions 兼容标志生效
