/**
 * Cherry Studio data.json 导出器
 *
 * 从 IndexedDB 读取完整数据，校验引用完整性，
 * 重新序列化为与桌面端兼容的 data.json 格式。
 */

import type { AppData } from '@/types';
import type { CherryData, CherryPersist, CherryLLMData } from '@/types/cherry-data';
import { loadAppData } from '@/utils/db';

// ============================================================================
// 类型
// ============================================================================

/** 导出校验结果 */
export interface ExportValidationResult {
  /** 错误总数 */
  errorCount: number;
  /** 详细错误列表 */
  errors: string[];
  /** 警告总数 */
  warningCount: number;
  /** 详细警告列表 */
  warnings: string[];
}

// ============================================================================
// 引用完整性检查
// ============================================================================

/**
 * 检查 AppData 中各项引用的完整性。
 *
 * @param data - 应用数据
 * @returns 校验结果
 */
export function validateReferences(data: AppData): ExportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const assistantIds = new Set(data.assistants.map((a) => a.id));
  const topicIds = new Set(data.topics.map((t) => t.id));
  const providerIds = new Set(data.providers.map((p) => p.id));
  const modelIds = new Set<string>();
  for (const p of data.providers) {
    for (const m of p.models) {
      modelIds.add(m.id);
    }
  }

  // 检查 topic.assistantId 引用
  for (const t of data.topics) {
    if (!assistantIds.has(t.assistantId)) {
      errors.push(`会话 "${t.name}" (${t.id}) 引用了不存在的助手 ${t.assistantId}`);
    }
  }

  // 检查消息中的 model 引用
  for (const t of data.topics) {
    for (const m of t.messages) {
      if (m.model && !modelIds.has(m.model)) {
        warnings.push(`消息 (${m.id}) 引用了不存在的模型 "${m.model}"，将保留原值`);
      }
    }
  }

  // 检查 provider 中的模型去重
  const allModelIds = new Map<string, string[]>();
  for (const p of data.providers) {
    for (const m of p.models) {
      const existing = allModelIds.get(m.id);
      if (existing) {
        existing.push(p.id);
      } else {
        allModelIds.set(m.id, [p.id]);
      }
    }
  }
  for (const [modelId, providerList] of allModelIds) {
    if (providerList.length > 1) {
      warnings.push(`模型 ID "${modelId}" 在多个供应商中出现：${providerList.join(', ')}`);
    }
  }

  return {
    errorCount: errors.length,
    errors,
    warningCount: warnings.length,
    warnings,
  };
}

// ============================================================================
// 序列化
// ============================================================================

/**
 * 将 AppData 重新序列化为 data.json 格式文本。
 *
 * 如果 appData 中包含 cherryData（原始导入数据），
 * 则基于原始结构原地更新后序列化，以保留桌面端兼容性。
 *
 * @param data - 当前应用数据
 * @returns JSON 字符串
 */
export function buildExportJSON(data: AppData): string {
  // 如果有原始 cherryData，基于它更新
  if (data.cherryData) {
    return buildExportFromRaw(data);
  }

  // 否则从头构建
  return buildExportFromScratch(data);
}

/**
 * 基于原始导入数据构建导出 JSON。
 */
function buildExportFromRaw(data: AppData): string {
  const raw = data.cherryData as CherryData;

  // 重建 persist
  const persist: CherryPersist = {
    assistants: {
      defaultAssistant: raw.persist?.assistants?.defaultAssistant ?? {
        id: 'default',
        name: data.assistants[0]?.name ?? '默认助手',
        prompt: data.assistants[0]?.prompt ?? '',
        type: 'assistant',
        settings: { temperature: 0.7, enableTemperature: true, contextCount: 10, enableMaxTokens: false, maxTokens: 4096, streamOutput: true, topP: 0.9, enableTopP: false },
      },
      assistants: data.assistants.slice(1).map((a) => ({
        id: a.id,
        name: a.name,
        emoji: (a as any).emoji,
        prompt: a.prompt,
        topics: [],
        messages: [],
        type: 'assistant',
        settings: (a as any).settings ?? {
          temperature: 0.7, enableTemperature: true,
          contextCount: 10, enableMaxTokens: false,
          maxTokens: 4096, streamOutput: true,
          topP: 0.9, enableTopP: false,
        },
      })),
    },
    llm: {
      defaultModel: undefined,
      providers: data.providers.map((p) => ({
        id: p.id,
        name: p.name,
        apiHost: p.apiHost,
        apiKey: p.apiKey,
        apiPath: (p as any).apiPath,
        enabled: p.enabled,
        models: p.models.map((m) => ({
          id: m.id,
          name: m.name,
          enabled: m.enabled,
        })),
      })),
    },
    settings: (data.settings ?? {}) as any,
  };

  // 序列化 persist 中的 JSON 字符串字段
  const persistForExport: Record<string, unknown> = {};
  for (const key of Object.keys(persist)) {
    const val = (persist as Record<string, unknown>)[key];
    // assistants / llm / settings 需要 JSON.stringify
    if (key === 'assistants' || key === 'llm' || key === 'settings') {
      persistForExport[key] = JSON.stringify(val);
    } else {
      persistForExport[key] = val;
    }
  }

  // 合并兼容保留区
  if (data.compatZone) {
    for (const [key, val] of Object.entries(data.compatZone)) {
      if (key.startsWith('persist.')) {
        persistForExport[key.slice('persist.'.length)] = val;
      }
    }
  }

  const out: Record<string, unknown> = {
    time: raw.time ?? Date.now(),
    version: raw.version ?? 5,
    localStorage: {
      'persist:cherry-studio': JSON.stringify(persistForExport),
    },
    indexedDB: {
      topics: raw.indexedDB?.topics ?? [],
      message_blocks: raw.indexedDB?.message_blocks ?? [],
    },
  };

  // 保留 localStorage 中其他键
  if (data.compatZone) {
    for (const [key, val] of Object.entries(data.compatZone)) {
      if (key.startsWith('localStorage.')) {
        const lsKey = key.slice('localStorage.'.length);
        (out.localStorage as Record<string, unknown>)[lsKey] = val;
      }
    }
  }

  return JSON.stringify(out);
}

/**
 * 从业务视图从头构建导出 JSON（无原始数据时）。
 */
function buildExportFromScratch(data: AppData): string {
  const persist: Record<string, unknown> = {
    assistants: JSON.stringify({
      defaultAssistant: {
        id: data.assistants[0]?.id ?? 'default',
        name: data.assistants[0]?.name ?? '默认助手',
        prompt: data.assistants[0]?.prompt ?? '',
        type: 'assistant',
        settings: { temperature: 0.7, enableTemperature: true, contextCount: 10, enableMaxTokens: false, maxTokens: 4096, streamOutput: true, topP: 0.9, enableTopP: false },
      },
      assistants: data.assistants.slice(1).map((a) => ({
        id: a.id,
        name: a.name,
        prompt: a.prompt,
        type: 'assistant',
        settings: { temperature: 0.7, enableTemperature: true, contextCount: 10, enableMaxTokens: false, maxTokens: 4096, streamOutput: true, topP: 0.9, enableTopP: false },
      })),
    }),
    llm: JSON.stringify({
      providers: data.providers.map((p) => ({
        id: p.id,
        name: p.name,
        apiHost: p.apiHost,
        apiKey: p.apiKey,
        enabled: p.enabled,
        models: p.models.map((m) => ({ id: m.id, name: m.name, enabled: m.enabled })),
      })),
    }),
    settings: JSON.stringify(data.settings ?? {}),
  };

  const out = {
    time: Date.now(),
    version: 5,
    localStorage: {
      'persist:cherry-studio': JSON.stringify(persist),
    },
    indexedDB: {
      topics: data.topics.map((t) => ({
        id: t.id,
        assistantId: t.assistantId,
        createdAt: t.createdAt ?? new Date().toISOString(),
        updatedAt: t.updatedAt ?? new Date().toISOString(),
        name: t.name,
        isNameManuallyEdited: (t as any).isNameManuallyEdited ?? false,
        messages: t.messages.map((m) => m.id),
      })),
      message_blocks: data.topics.flatMap((t) =>
        t.messages.map((m) => ({
          id: `block-${m.id}`,
          messageId: m.id,
          type: 'text',
          createdAt: m.createdAt,
          status: m.status,
          content: m.content,
        })),
      ),
    },
  };

  return JSON.stringify(out);
}
