export interface AiModel { id: string; object?: string; owned_by?: string; }
export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}
const apiBase = import.meta.env.VITE_AI_API_BASE || '/ai-api';
const apiKey = import.meta.env.VITE_AI_API_KEY;
function headers() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
}
export async function getAiModels(): Promise<AiModel[]> {
  const response = await fetch(`${apiBase}/v1/models`, { headers: headers() });
  if (!response.ok) throw new Error(`模型查询失败 (${response.status})`);
  const data = await response.json();
  return (data.data || []).filter((item: AiModel) => item.id);
}
export async function* streamAiChat(messages: AiMessage[], model: string, signal: AbortSignal) {
  const response = await fetch(`${apiBase}/v1/chat/completions`, {
    method: 'POST', headers: headers(), signal,
    body: JSON.stringify({ model, messages, stream: true }),
  });
  if (!response.ok) throw new Error((await response.text()) || `对话请求失败 (${response.status})`);
  if (!response.body) throw new Error('上游没有返回流式内容');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const result = await reader.read();
    buffer += decoder.decode(result.value || new Uint8Array(), { stream: !result.done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const value = line.slice(5).trim();
      if (!value || value === '[DONE]') continue;
      const delta = JSON.parse(value).choices?.[0]?.delta;
      if (delta?.reasoning_content || delta?.content) yield delta;
    }
    if (result.done) break;
  }
}
