/**
 * Token 估算工具
 * 使用近似公式估算文本 Token 数（简化版，不依赖 tiktoken WASM）
 *
 * 规则：英文约 0.25 token/字符，中文约 0.5 token/字符
 */

const ENGLISH_CHAR_REGEX = /[a-zA-Z0-9\s]/g
const CHINESE_CHAR_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/g

/**
 * 估算文本的 Token 数量
 * @param text 输入文本
 * @returns 估算 Token 数（向上取整）
 */
export function estimateTokens(text: string): number {
  if (!text) return 0

  const chineseChars = (text.match(CHINESE_CHAR_REGEX) || []).length
  const otherChars = text.length - chineseChars

  // 中文约 0.5 token/字，其余约 0.25 token/字
  const tokens = chineseChars * 0.5 + otherChars * 0.25
  return Math.ceil(tokens)
}

/**
 * 估算多轮消息的总 Token 数
 */
export function estimateMessagesTokens(messages: Array<{ content: string }>): number {
  return messages.reduce((sum, msg) => sum + estimateTokens(msg.content), 0)
}
