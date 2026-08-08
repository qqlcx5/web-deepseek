# 06 - http（网络请求模块）

> 路径: `src/utils/http.ts`
> 依赖: `hook-fetch`

---

## 任务清单

### hook-fetch 实例创建

- [ ] T06-1 `import hookFetch from 'hook-fetch'`，创建实例 `http = hookFetch.create({...})`
- [ ] T06-2 配置 `baseURL`：读取 `import.meta.env.VITE_API_BASE_URL`，默认 `'/api'`
- [ ] T06-3 配置 `timeout: 30000`
- [ ] T06-4 配置 `headers: { 'Content-Type': 'application/json' }`
- [ ] T06-5 配置 `withCredentials: false`

### 插件：鉴权

- [ ] T06-6 实现 `authPlugin` — `beforeRequest` 钩子，从 `config.extra?.providerId` 查找对应 apiKey，注入 `Authorization: Bearer {apiKey}`
- [ ] T06-7 apiKey 查找逻辑：优先从内存缓存（appStore.providers），降级 localStorage

### 插件：错误处理

- [ ] T06-8 实现 `errorPlugin` — `onError` 钩子，console.error 统一日志，透传 error

### 插件：SSE 流式解析（如需要）

- [ ] T06-9 实现 `ssePlugin`（如 hook-fetch 的 `transformStreamChunk` 可自动解析 SSE 则跳过）— 在 `transformStreamChunk` 中解析 `data: ` 行

### 导出

- [ ] T06-10 `export { http }` — 供 chat-api 使用

### 验证

- [ ] T06-11 确认 `http.post()` 的返回值形态（Response 还是已解析 data）— 对应 Q-2
- [ ] T06-12 确认 `beforeStream` / `transformStreamChunk` 插件钩子的触发时机和参数 — 对应 Q-1
- [ ] T06-13 `tsc --noEmit` 类型检查通过
