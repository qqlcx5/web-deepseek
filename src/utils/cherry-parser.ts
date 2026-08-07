/**
 * Cherry Studio data.json 多级 JSON 解析器
 *
 * 处理 Cherry Studio 导出文件的特殊结构：
 * - 第一层：顶层 JSON 解析 → CherryData
 * - 第二层：localStorage["persist:cherry-studio"] 是 JSON 字符串，需 JSON.parse
 * - 第三层：persist.assistants / persist.llm / persist.settings 如果是字符串，需 JSON.parse
 */

import type {
  CherryData,
  CherryPersist,
  CherryAssistantsData,
  CherryLLMData,
  ParsedCherryData,
} from '@/types/cherry-data';

// ============================================================================
// 内部工具
// ============================================================================

/**
 * 安全 JSON.parse——若值已是对象则直接返回，字符串则尝试解析。
 *
 * @param value - 可能是字符串或已解析的对象
 * @param label - 错误提示标签（如 'assistants'）
 * @returns 解析后的对象
 */
function safeParse<T = unknown>(value: unknown, label: string): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      throw new Error(`JSON 解析失败：${label} 字段不是合法的 JSON 字符串`);
    }
  }
  if (typeof value === 'object' && value !== null) {
    return value as T;
  }
  throw new Error(`数据格式错误：${label} 字段类型不正确（期望 JSON 字符串或对象）`);
}

// ============================================================================
// 公开 API
// ============================================================================

/**
 * 解析 Cherry Studio 导出的 data.json 文本，返回完整的结构化数据。
 *
 * 解析流程：
 * 1. 第一层 JSON.parse → 顶层 CherryData
 * 2. 第二层 JSON.parse → localStorage["persist:cherry-studio"]
 * 3. 第三层 JSON.parse → persist.assistants / persist.llm（如果是字符串）
 * 4. 构建助手列表、扁平化模型列表、兼容保留区
 *
 * @param jsonText - data.json 的原始文本内容
 * @returns ParsedCherryData（含所有提取字段 + 兼容保留区）
 * @throws 任一阶段解析失败时抛出中文错误信息
 */
export function parseDataJSON(jsonText: string): ParsedCherryData {
  // ---------- 第一层：顶层 JSON ----------
  let raw: CherryData;
  try {
    const top = JSON.parse(jsonText);
    if (typeof top !== 'object' || top === null || Array.isArray(top)) {
      throw new Error('数据格式错误：顶层结构必须是对象');
    }
    raw = top as CherryData;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('数据格式错误')) throw err;
    throw new Error('JSON 解析失败：文件内容不是合法的 JSON 格式');
  }

  // 校验必需字段
  if (typeof raw.time !== 'number') {
    throw new Error('数据格式错误：缺少 time 字段或类型不正确');
  }
  if (typeof raw.version !== 'number') {
    throw new Error('数据格式错误：缺少 version 字段或类型不正确');
  }
  if (!raw.localStorage || typeof raw.localStorage !== 'object') {
    throw new Error('数据格式错误：缺少 localStorage 字段');
  }

  const persistKey = 'persist:cherry-studio';
  const persistRaw = (raw.localStorage as Record<string, unknown>)[persistKey];
  if (!persistRaw) {
    throw new Error(`数据格式错误：localStorage 中缺少 "${persistKey}" 键`);
  }

  // ---------- 第二层：persist JSON 字符串 ----------
  const persistBase = safeParse<Record<string, unknown>>(persistRaw, persistKey);

  // ---------- 第三层：assistants / llm / settings ----------
  const assistantsRaw = persistBase.assistants;
  if (!assistantsRaw) {
    throw new Error('数据格式错误：persist 中缺少 assistants 字段');
  }
  const assistantsData = safeParse<CherryAssistantsData>(assistantsRaw, 'assistants');

  const llmRaw = persistBase.llm;
  const llmData: CherryLLMData = llmRaw
    ? safeParse<CherryLLMData>(llmRaw, 'llm')
    : { providers: [] };

  // settings 可能为字符串也可能直接是对象
  let settingsParsed: Record<string, unknown> = {};
  if (persistBase.settings) {
    settingsParsed = safeParse<Record<string, unknown>>(persistBase.settings, 'settings');
  }

  // ---------- 构建 persist 完整结构 ----------
  const persist: CherryPersist = {
    assistants: assistantsData,
    llm: llmData,
    settings: settingsParsed,
    defaultAssistant: assistantsData.defaultAssistant,
    unifiedListOrder: persistBase.unifiedListOrder as string[] | undefined,
    tagsOrder: persistBase.tagsOrder as string[] | undefined,
    collapsedTags: persistBase.collapsedTags as string[] | undefined,
  };

  // ---------- 构建助手列表（含 default） ----------
  const assistants = [assistantsData.defaultAssistant, ...assistantsData.assistants];

  // ---------- 构建供应商列表 ----------
  const providers = llmData.providers ?? [];

  // ---------- IndexedDB 数据 ----------
  const topicRecords = raw.indexedDB?.topics ?? [];
  const messageBlocks = raw.indexedDB?.message_blocks ?? [];

  // ---------- 兼容保留区 ----------
  const compatZone: Record<string, unknown> = {};

  // 保留 persist 中未显式映射的字段
  const mappedPersistKeys = new Set([
    'assistants',
    'llm',
    'settings',
    'unifiedListOrder',
    'tagsOrder',
    'collapsedTags',
    'defaultAssistant',
  ]);
  for (const key of Object.keys(persistBase)) {
    if (!mappedPersistKeys.has(key)) {
      compatZone[`persist.${key}`] = persistBase[key];
    }
  }

  // 保留顶层 localStorage 中除 persist:cherry-studio 外的键
  const lsKeys = Object.keys(raw.localStorage);
  for (const key of lsKeys) {
    if (key !== persistKey) {
      compatZone[`localStorage.${key}`] = (raw.localStorage as Record<string, unknown>)[key];
    }
  }

  return {
    raw,
    persist,
    assistants,
    defaultAssistant: assistantsData.defaultAssistant,
    providers,
    topicRecords,
    messageBlocks,
    compatZone,
  };
}
