/**
 * 应用全局 Store（Pinia）
 *
 * 管理 Cherry Studio Web 的核心数据状态，
 * 所有变更自动持久化到 IndexedDB。
 *
 * 双层数据模型：
 * - 业务视图：providers / assistants / topics / messages（扁平化，UI 使用）
 * - 原始数据：cherryData + compatZone（导入时保留，导出时还原）
 */

import { defineStore } from 'pinia';
import type { AppData, Assistant, Message, Provider, Settings, Topic } from '@/types';
import { saveAppData, loadAppData, clearAppData } from '@/utils/db';
import { importFromFile, mergeAppData } from '@/utils/data-import';
import { buildExportJSON, validateReferences, type ExportValidationResult } from '@/utils/cherry-export';

// ============================================================================
// 默认值
// ============================================================================

/** 默认设置 */
const DEFAULT_SETTINGS: Settings = {
  language: 'zh-CN',
  theme: 'auto',
  fontSize: 14,
  sendShortcut: 'Enter',
  maxContext: 20,
  autoScroll: true,
};

/** 空白 AppData */
function createEmptyAppData(): AppData {
  return {
    version: '1.0.0',
    providers: [],
    assistants: [],
    topics: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

// ============================================================================
// 导入统计（用于 UI 展示）
// ============================================================================

export interface ImportStats {
  assistantCount: number;
  topicCount: number;
  messageCount: number;
  messageBlockCount: number;
  providerCount: number;
  compatFieldCount: number;
}

// ============================================================================
// Store 定义
// ============================================================================

export const useAppStore = defineStore('app', {
  // --------------------------------------------------------------------------
  // 状态
  // --------------------------------------------------------------------------

  state: () => ({
    /** 应用数据（null 表示尚未初始化） */
    appData: null as AppData | null,
    /** 是否已导入过数据 */
    isImported: false,
    /** 是否正在加载 */
    loading: false,
    /** 最近一次导入统计 */
    lastImportStats: null as ImportStats | null,
  }),

  // --------------------------------------------------------------------------
  // 计算属性
  // --------------------------------------------------------------------------

  getters: {
    /**
     * 扁平化会话列表：从 assistants 内的 topics + 顶层 topics 合并去重。
     * 优先使用顶层 topics（已含完整 messages）。
     */
    flatTopics(): Topic[] {
      return this.appData?.topics ?? [];
    },
  },

  // --------------------------------------------------------------------------
  // 动作
  // --------------------------------------------------------------------------

  actions: {
    // ==================== 初始化 ====================

    /**
     * 初始化：从 IndexedDB 加载已有数据。
     * 如果数据库为空，使用空白 AppData。
     */
    async init(): Promise<void> {
      this.loading = true;
      try {
        const stored = await loadAppData();
        if (stored) {
          this.appData = stored;
          this.isImported = true;
        } else {
          this.appData = createEmptyAppData();
          this.isImported = false;
        }
      } catch (err) {
        console.error('初始化数据失败：', err);
        this.appData = createEmptyAppData();
        this.isImported = false;
      } finally {
        this.loading = false;
      }
    },

    // ==================== 导入 / 导出 / 清除 ====================

    /**
     * 导入 data.json 文件，解析后合并到 IndexedDB。
     * 返回导入统计信息。
     */
    async importData(file: File): Promise<ImportStats> {
      this.loading = true;
      try {
        const { appData: imported, stats } = await importFromFile(file);
        const merged = mergeAppData(this.appData, imported);
        this.appData = merged;
        this.isImported = true;
        this.lastImportStats = stats;
        await this._save();
        return stats;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 导出：构建 data.json 格式文本。
     *
     * @returns JSON 字符串
     */
    exportData(): string {
      this._ensureAppData();
      return buildExportJSON(this.appData!);
    },

    /**
     * 触发浏览器下载导出文件。
     */
    downloadExport(): void {
      const json = this.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cherry-studio-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * 清除所有数据，恢复为空白状态。
     */
    async clearData(): Promise<void> {
      this.appData = createEmptyAppData();
      this.isImported = false;
      this.lastImportStats = null;
      await clearAppData();
    },

    // ==================== 助手管理 ====================

    /** 添加助手 */
    addAssistant(assistant: Assistant): void {
      this._ensureAppData();
      this.appData!.assistants.push(assistant);
      this._save();
    },

    /** 更新助手 */
    updateAssistant(id: string, data: Partial<Assistant>): void {
      this._ensureAppData();
      const index = this.appData!.assistants.findIndex((a) => a.id === id);
      if (index !== -1) {
        this.appData!.assistants[index] = {
          ...this.appData!.assistants[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        this._save();
      }
    },

    /** 删除助手及其关联的会话 */
    deleteAssistant(id: string): void {
      this._ensureAppData();
      const data = this.appData!;
      data.assistants = data.assistants.filter((a) => a.id !== id);
      data.topics = data.topics.filter((t) => t.assistantId !== id);
      this._save();
    },

    // ==================== 会话管理 ====================

    /** 添加会话 */
    addTopic(assistantId: string, topic: Topic): void {
      this._ensureAppData();
      topic.assistantId = assistantId;
      this.appData!.topics.push(topic);
      this._save();
    },

    /** 更新会话 */
    updateTopic(id: string, data: Partial<Topic>): void {
      this._ensureAppData();
      const index = this.appData!.topics.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.appData!.topics[index] = {
          ...this.appData!.topics[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        this._save();
      }
    },

    /** 删除会话 */
    deleteTopic(id: string): void {
      this._ensureAppData();
      this.appData!.topics = this.appData!.topics.filter((t) => t.id !== id);
      this._save();
    },

    /** 置顶/取消置顶 */
    pinTopic(id: string, pinned: boolean): void {
      this.updateTopic(id, { pinned });
    },

    /** 收藏/取消收藏 */
    favoriteTopic(id: string, favorite: boolean): void {
      this.updateTopic(id, { favorite });
    },

    /** 归档 */
    archiveTopic(id: string): void {
      this.updateTopic(id, { archived: true });
    },

    /** 取消归档 */
    unarchiveTopic(id: string): void {
      this.updateTopic(id, { archived: false });
    },

    /** 更新会话标签 */
    updateTopicTags(id: string, tags: string[]): void {
      this.updateTopic(id, { tags });
    },

    // ==================== 消息管理 ====================

    /** 向指定会话添加消息 */
    addMessage(topicId: string, message: Message): void {
      this._ensureAppData();
      const topic = this.appData!.topics.find((t) => t.id === topicId);
      if (topic) {
        topic.messages.push(message);
        this._save();
      }
    },

    /** 更新指定会话中的某条消息 */
    updateMessage(
      topicId: string,
      messageId: string,
      data: Partial<Message>,
    ): void {
      this._ensureAppData();
      const topic = this.appData!.topics.find((t) => t.id === topicId);
      if (topic) {
        const index = topic.messages.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          topic.messages[index] = { ...topic.messages[index], ...data };
          this._save();
        }
      }
    },

    /** 删除指定会话中的某条消息 */
    deleteMessage(topicId: string, messageId: string): void {
      this._ensureAppData();
      const topic = this.appData!.topics.find((t) => t.id === topicId);
      if (topic) {
        const index = topic.messages.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          topic.messages.splice(index, 1);
          this._save();
        }
      }
    },

    // ==================== 供应商 / 设置 ====================

    /** 更新供应商（按 id 匹配，不存在则追加） */
    updateProvider(provider: Provider): void {
      this._ensureAppData();
      const index = this.appData!.providers.findIndex((p) => p.id === provider.id);
      if (index !== -1) {
        this.appData!.providers[index] = provider;
      } else {
        this.appData!.providers.push(provider);
      }
      this._save();
    },

    /** 更新设置（部分更新） */
    updateSettings(settings: Partial<Settings>): void {
      this._ensureAppData();
      if (!this.appData!.settings) {
        this.appData!.settings = { ...DEFAULT_SETTINGS };
      }
      this.appData!.settings = { ...this.appData!.settings, ...settings };
      this._save();
    },

    // ==================== 查询 ====================

    /**
     * 获取指定会话的所有消息。
     */
    getMessages(topicId: string): Message[] {
      const topic = this.appData?.topics.find((t) => t.id === topicId);
      return topic ? [...topic.messages] : [];
    },

    // ==================== 私有方法 ====================

    /** 保存当前状态到 IndexedDB */
    async _save(): Promise<void> {
      if (this.appData) {
        try {
          await saveAppData(this.appData);
        } catch (err) {
          console.error('保存数据到 IndexedDB 失败：', err);
        }
      }
    },

    /** 确保 appData 不为 null */
    _ensureAppData(): void {
      if (!this.appData) {
        this.appData = createEmptyAppData();
      }
    },
  },

  // --------------------------------------------------------------------------
  // 持久化配置（pinia-plugin-persistedstate）
  // --------------------------------------------------------------------------

  persist: {
    key: 'cherry-studio-web-app',
    storage: localStorage,
    pick: ['isImported'],
  },
});
