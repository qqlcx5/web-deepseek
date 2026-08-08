# 07 - chat-api（对话 API 模块）

> 路径: `src/api/chat-api.ts`
> 依赖: `http`, `types`

---

## 任务清单

### 类型定义

- [ ] T07-1 定义 `ChatRequestParams` 接口（messages, model, temperature?, maxTokens?, signal?, providerId?, apiHost?）

### 流式对话

- [ ] T07-2 实现 `chatApi.chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>>`
- [ ] T07-3 调用 `http.post('/chat/completions', { ...payload, stream: true }, { signal, extra: { providerId } })`
- [ ] T07-4 处理 `apiHost` 自定义 baseURL 覆盖
- [ ] T07-5 从 hook-fetch 返回值中提取 ReadableStream（根据 T06-11 确认的返回值形态适配）

### 非流式对话

- [ ] T07-6 实现 `chatApi.chat(params: ChatRequestParams)` — `stream: false`，返回 `{ id, choices, usage }`

### AbortController 集成

- [ ] T07-7 确保 `signal` 正确传递到 hook-fetch 的请求配置中
- [ ] T07-8 验证 abort 后 fetch 请求被中断

### 验证

- [ ] T07-9 mock SSE 服务端测试流式响应解析
- [ ] T07-10 `tsc --noEmit` 类型检查通过
