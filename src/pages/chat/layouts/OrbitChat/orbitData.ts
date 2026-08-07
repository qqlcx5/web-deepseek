/*
 * Orbit AI 类型定义（仅接口，不含 mock 数据）
 * 数据源改为 useAppStore，不再从这里导入 mock 数组
 */

// ============================================================================
// 消息
// ============================================================================

export interface OrbitMessageSource {
  index: number;
  title: string;
  snippet: string;
  url: string;
}

export interface OrbitMessageArtifact {
  title: string;
  size: string;
  type: string;
}

export interface OrbitMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoningContent?: string;
  model?: string;
  time?: string;
  loading?: boolean;
  rating?: 'up' | 'down' | null;
  branches?: number;
  activeBranch?: number;
  status?: string;
  sources?: OrbitMessageSource[];
  artifact?: OrbitMessageArtifact;
}

// ============================================================================
// 模型
// ============================================================================

export interface OrbitModelMeta {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  color?: string;
  providerId?: string;
}

// ============================================================================
// 侧栏会话
// ============================================================================

export interface OrbitChatMeta {
  id: string;
  title: string;
  preview?: string;
  group?: string;
  pinned?: boolean;
  favorite?: boolean;
  tags?: string[];
  archived?: boolean;
  icon?: string;
  color?: string;
}

// ============================================================================
// 命令面板
// ============================================================================

export interface OrbitCommandItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  shortcut?: string;
}

// ============================================================================
// 提示词预设
// ============================================================================

export interface OrbitPromptPreset {
  id: string;
  title: string;
  body: string;
}

// ============================================================================
// 搜索
// ============================================================================

export interface OrbitSearchResult {
  id: string;
  topicId: string;
  topicTitle: string;
  matchType: 'title' | 'message';
  matchContent: string;
  matchIndex: number;
  messageId?: string;
  messageRole?: string;
  messageTime?: string;
}

// ============================================================================
// 分支
// ============================================================================

export interface OrbitBranch {
  index: number;
  title: string;
  count: number;
  meta: string;
  active?: boolean;
  muted?: boolean;
}

// ============================================================================
// 附件
// ============================================================================

export interface OrbitAttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  progress: number; // 0-100
  loading: boolean;
}

export interface OrbitAttachmentPreview {
  open: boolean;
  files: OrbitAttachmentFile[];
  index: number;
}
