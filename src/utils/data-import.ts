/**
 * 数据导入工具
 *
 * 解析和校验 Cherry Studio 导出的 data.json 文件，
 * 将真实结构映射到业务视图并写入 IndexedDB。
 */

import type { AppData, Assistant, Message, Provider, Topic } from '@/types';
import type { ParsedCherryData, CherryTopicRecord, CherryMessageBlock } from '@/types/cherry-data';
import { parseDataJSON } from '@/utils/cherry-parser';

// ============================================================================
// 类型
// ============================================================================

/** 导入统计结果 */
export interface ImportStats {
  /** 助手数量（含默认助手） */
  assistantCount: number;
  /** 会话数量 */
  topicCount: number;
  /** 消息数量 */
  messageCount: number;
  /** 消息块数量 */
  messageBlockCount: number;
  /** 供应商数量 */
  providerCount: number;
  /** 兼容保留区字段数量 */
  compatFieldCount: number;
}

// ============================================================================
// 文件导入
// ============================================================================

/**
 * 从浏览器 File 对象读取并解析 data.json，
 * 返回可直接写入 IndexedDB 的 AppData + 统计信息。
 *
 * @param file - 用户选择的文件对象
 * @returns { appData, stats } — appData 为已映射的业务视图数据
 * @throws 文件读取失败或校验失败时抛出 Error
 */
export function importFromFile(file: File): Promise<{ appData: AppData; stats: ImportStats }> {
  return new Promise<{ appData: AppData; stats: ImportStats }>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = parseDataJSON(text);
        const result = buildAppData(parsed);
        resolve(result);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('文件读取后解析失败'));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败，请检查文件是否可读'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

// ============================================================================
// 数据映射
// ============================================================================

/**
 * 将 ParsedCherryData 映射为 AppData 业务视图 + 统计信息。
 *
 * 映射规则：
 * - providers：从 llm.providers 映射
 * - assistants：从 cherry assistants 映射（default 标记 isDefault）
 * - topics：从 assistant.topics + indexedDB.topicRecords 合并去重
 * - messages：从 topic.messages 映射
 * - cherryData：保留完整原始数据
 * - compatZone：保留未映射字段
 *
 * @param parsed - 解析后的 Cherry Studio 数据
 * @returns { appData, stats }
 */
export function buildAppData(parsed: ParsedCherryData): { appData: AppData; stats: ImportStats } {
  // -------- 1. 供应商 --------
  const providers: Provider[] = parsed.providers.map((cp) => ({
    id: cp.id,
    name: cp.name,
    apiHost: cp.apiHost,
    apiKey: cp.apiKey,
    apiPath: cp.apiPath,
    enabled: cp.enabled !== false,
    models: (cp.models ?? []).map((cm) => ({
      id: cm.id,
      name: cm.name,
      providerId: cp.id,
      description: cm.description,
      maxTokens: cm.maxTokens,
      contextLength: cm.contextLength,
      temperature: undefined,
      topP: undefined,
      enabled: cm.enabled !== false,
    })),
  }));

  // -------- 2. 助手 --------
  const assistants: Assistant[] = parsed.assistants.map((ca, index) => ({
    id: ca.id,
    name: ca.name,
    description: undefined,
    prompt: ca.prompt,
    temperature: ca.settings?.temperature,
    topP: ca.settings?.topP,
    maxTokens: ca.settings?.maxTokens,
    model: undefined,
    avatar: undefined,
    enabled: true,
    isDefault: ca.id === parsed.defaultAssistant.id || index === 0,
    tags: [],
    emoji: ca.emoji,
    createdAt: undefined,
    updatedAt: undefined,
  }));

  // -------- 3. 会话：从 assistant.topics 收集（含 messages）-----
  const topicMap = new Map<string, Topic>();

  for (const ca of parsed.assistants) {
    const topics = ca.topics ?? [];
    for (const ct of topics) {
      if (topicMap.has(ct.id)) continue;

      const messages: Message[] = (ct.messages ?? []).map((cm) => ({
        id: cm.id,
        topicId: ct.id,
        role: cm.role as Message['role'],
        content: cm.content,
        reasoningContent: cm.reasoning_content,
        model: cm.model,
        tokens: undefined,
        blocks: cm.blocks,
        askId: cm.askId,
        createdAt: cm.createdAt,
        status: (cm.status || 'done') as Message['status'],
      }));

      topicMap.set(ct.id, {
        id: ct.id,
        assistantId: ct.assistantId,
        name: ct.name || '未命名会话',
        messages,
        isNameManuallyEdited: ct.isNameManuallyEdited,
        pinned: ct.pinned,
        createdAt: ct.createdAt,
        updatedAt: ct.updatedAt,
      });
    }
  }

  // -------- 4. 合并 indexedDB.topics（仅元数据，不重复）-----
  for (const tr of parsed.topicRecords) {
    if (topicMap.has(tr.id)) continue;

    topicMap.set(tr.id, {
      id: tr.id,
      assistantId: tr.assistantId,
      name: tr.name || '未命名会话',
      messages: [],
      isNameManuallyEdited: tr.isNameManuallyEdited,
      pinned: tr.pinned,
      createdAt: tr.createdAt,
      updatedAt: tr.updatedAt,
    });
  }

  const topics = Array.from(topicMap.values());

  // -------- 排序：置顶在前，按 createdAt 倒序 --------
  topics.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  // -------- 5. 统计 --------
  let totalMessages = 0;
  for (const t of topics) {
    totalMessages += t.messages.length;
  }

  const stats: ImportStats = {
    assistantCount: assistants.length,
    topicCount: topics.length,
    messageCount: totalMessages,
    messageBlockCount: parsed.messageBlocks.length,
    providerCount: providers.length,
    compatFieldCount: Object.keys(parsed.compatZone).length,
  };

  // -------- 6. 构建 AppData --------
  const appData: AppData = {
    version: String(parsed.raw.version),
    providers,
    assistants,
    topics,
    settings: parsed.persist.settings
      ? {
          language: (parsed.persist.settings as any).language || 'zh-CN',
          theme: (parsed.persist.settings as any).theme || 'auto',
          fontSize: (parsed.persist.settings as any).fontSize || 14,
          sendShortcut: (parsed.persist.settings as any).sendShortcut || 'Enter',
          maxContext: (parsed.persist.settings as any).maxContext || 20,
          autoScroll: (parsed.persist.settings as any).autoScroll !== false,
        }
      : undefined,
    cherryData: parsed,
    compatZone: parsed.compatZone,
  };

  return { appData, stats };
}

// ============================================================================
// 数据合并
// ============================================================================

/**
 * 将导入的 AppData 合并到已有数据中。
 *
 * 合并策略：
 * - providers：按 id 去重，新数据覆盖旧数据
 * - assistants：按 id 去重，新数据覆盖旧数据
 * - topics：按 id 去重，保留已有消息并追加新消息
 * - settings：新数据覆盖旧数据
 * - cherryData / compatZone：新数据覆盖旧数据
 *
 * @param existing - 已有数据（可能为 null）
 * @param imported - 导入的数据
 * @returns 合并后的 AppData
 */
export function mergeAppData(
  existing: AppData | null,
  imported: AppData,
): AppData {
  if (!existing) {
    return imported;
  }

  // ---- providers ----
  const providerMap = new Map<string, Provider>();
  for (const p of existing.providers) providerMap.set(p.id, p);
  for (const p of imported.providers) providerMap.set(p.id, p);

  // ---- assistants ----
  const assistantMap = new Map<string, Assistant>();
  for (const a of existing.assistants) assistantMap.set(a.id, a);
  for (const a of imported.assistants) assistantMap.set(a.id, a);

  // ---- topics ----
  const topicMap = new Map<string, Topic>();
  for (const t of existing.topics) {
    topicMap.set(t.id, { ...t, messages: [...t.messages] });
  }
  for (const t of imported.topics) {
    const existingTopic = topicMap.get(t.id);
    if (existingTopic) {
      const existingMsgIds = new Set(existingTopic.messages.map((m) => m.id));
      const newMessages = t.messages.filter((m) => !existingMsgIds.has(m.id));
      existingTopic.messages.push(...newMessages);
    } else {
      topicMap.set(t.id, { ...t, messages: [...t.messages] });
    }
  }

  return {
    version: imported.version,
    providers: Array.from(providerMap.values()),
    assistants: Array.from(assistantMap.values()),
    topics: Array.from(topicMap.values()),
    settings: imported.settings ?? existing.settings,
    cherryData: imported.cherryData ?? existing.cherryData,
    compatZone: imported.compatZone ?? existing.compatZone,
  };
}
