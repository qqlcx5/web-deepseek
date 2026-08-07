/*
 * Orbit AI 状态管理 (composable)
 * 接入 useAppStore 真实数据层 + stream-chat SSE 流式对话
 */

import type { OrbitAttachmentFile, OrbitAttachmentPreview, OrbitBranch, OrbitChatMeta, OrbitCommandItem, OrbitMessage, OrbitModelMeta, OrbitPromptPreset, OrbitSearchResult } from './orbitData';
import type { ChatMessage, Provider, Topic } from '@/types';
import { useAppStore } from '@/stores/modules/app';
import { streamChat } from '@/utils/stream-chat';

// ============================================================================
// Toast 类型
// ============================================================================

export interface OrbitToast {
  id: number;
  text: string;
  undo?: () => void;
}

// ============================================================================
// 内置命令
// ============================================================================

const BUILTIN_COMMANDS: OrbitCommandItem[] = [
  { id: 'cmd-new', title: '新建对话', description: '开始一段全新的对话', icon: 'plus', action: 'new', shortcut: '⌘N' },
  { id: 'cmd-model', title: '切换模型', description: '选择不同的 AI 模型', icon: 'sparkles', action: 'model' },
  { id: 'cmd-prompt', title: '编辑提示词', description: '自定义系统提示词', icon: 'edit', action: 'prompt' },
  { id: 'cmd-focus', title: '专注模式', description: '隐藏侧栏与详情面板', icon: 'eye', action: 'focus', shortcut: '⇧⌘F' },
  { id: 'cmd-offline', title: '切换离线模式', description: '离线使用本地数据', icon: 'calendar', action: 'offline' },
];

const BUILTIN_PRESETS: OrbitPromptPreset[] = [
  { id: 'p-default', title: '通用助手', body: '你是一个有用的 AI 助手，请以清晰、简洁的方式回答问题。' },
  { id: 'p-coder', title: '编程专家', body: '你是一位经验丰富的软件工程师。回答问题时请提供可运行的代码示例和详细解释。' },
  { id: 'p-writer', title: '写作助手', body: '你是一位专业的写作助手，擅长撰写文章、报告和创意内容。请根据用户需求提供高质量的写作建议和内容。' },
  { id: 'p-analyst', title: '数据分析师', body: '你是一位数据分析专家，擅长解读数据、发现洞察并提供数据驱动的建议。' },
];

// ============================================================================
// Composable
// ============================================================================

export function useOrbitState() {
  const store = useAppStore();

  // —— 布局 ——
  const sidebarOpen = ref(false);
  const inspectorOpen = ref(false);
  const inspectorVisible = ref(true);
  const focusMode = ref(false);
  const online = ref(navigator?.onLine ?? true);

  // —— 弹窗 ——
  const modal = ref<'' | 'command' | 'model' | 'prompt' | 'settings'>('');

  // —— Toast ——
  const toast = ref<OrbitToast | null>(null);
  const undoAction = ref<null | (() => void)>(null);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  // —— 当前选中对话 ——
  const activeChatId = ref<string>('');

  // —— 当前选中模型 ——
  const selectedModelId = ref<string>('');

  // —— 命令面板 ——
  const commandQuery = ref('');

  // —— 草稿与附件 ——
  const draft = ref('');
  const attachments = ref<OrbitAttachmentFile[]>([]);
  const attachmentPreview = ref<OrbitAttachmentPreview>({ open: false, files: [], index: 0 });
  const replyingTo = ref<string>('');

  // —— 编辑状态 ——
  const editingMessageId = ref<string | null>(null);
  const editDraft = ref<string>('');

  // —— 折叠状态 ——
  const isCollapsed = ref<Map<string, boolean>>(new Map());

  // —— 对话管理 ——
  const selectedChatIds = ref<Set<string>>(new Set());
  const batchMode = ref(false);
  const sortBy = ref<'updated' | 'created' | 'title'>('updated');
  const showArchived = ref(false);

  // —— 生成状态 ——
  const generating = ref(false);
  const nearBottom = ref(true);
  let abortController: AbortController | null = null;
  let streamGen: AsyncGenerator<any, void, unknown> | null = null;

  // —— 提示词草稿 ——
  const promptDraft = ref('');

  // —— 搜索 ——
  const searchOpen = ref(false);
  const searchQuery = ref('');
  const searchScope = ref<'all' | 'title' | 'messages'>('all');
  const searchResults = ref<OrbitSearchResult[]>([]);
  const searchFilters = ref({
    model: '',
    tag: '',
    timeStart: '',
    timeEnd: '',
  });
  const scrollTargetId = ref('');

  // —— 模型参数（全局默认值） ——
  const temperature = ref(0.7);
  const maxTokens = ref(4096);
  const topP = ref(1.0);

  // —— 设置本地状态 ——
  const settingsDarkMode = ref(false);
  const settingsLanguage = ref('zh-CN');

  // ============================================================================
  // 计算属性：从 store 派生
  // ============================================================================

  /** 会话列表 */
  const chats = computed<OrbitChatMeta[]>(() => {
    let list = (store.flatTopics ?? []).map((t) => {
      const lastMsg = t.messages?.[t.messages.length - 1];
      return {
        id: t.id,
        title: t.name || '未命名对话',
        preview: lastMsg?.content?.slice(0, 60) || '暂无消息',
        group: '',
        pinned: (t as any).pinned ?? false,
        favorite: (t as any).favorite ?? false,
        tags: (t as any).tags ?? [],
        archived: (t as any).archived ?? false,
        icon: (t as any).icon ?? '',
        color: (t as any).color ?? '',
        updatedAt: (t as any).updatedAt || t.createdAt || '',
        createdAt: t.createdAt || '',
      } as OrbitChatMeta & { updatedAt?: string };
    });

    // 默认过滤已归档
    if (!showArchived.value) {
      list = list.filter(c => !c.archived);
    }

    // 排序：置顶优先 → sortBy
    list.sort((a: any, b: any) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortBy.value === 'title') {
        return (a.title || '').localeCompare(b.title || '', 'zh');
      }
      const aTime = sortBy.value === 'created' ? (a.createdAt || '') : (a.updatedAt || a.createdAt || '');
      const bTime = sortBy.value === 'created' ? (b.createdAt || '') : (b.updatedAt || b.createdAt || '');
      if (aTime > bTime) return -1;
      if (aTime < bTime) return 1;
      return 0;
    });

    return list;
  });

  /** 当前会话 */
  const currentChat = computed(() => chats.value.find(c => c.id === activeChatId.value) || chats.value[0] || null);

  /** 当前消息列表 */
  const messages = computed<OrbitMessage[]>(() => {
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    if (!topic?.messages)
      return [];
    return topic.messages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      reasoningContent: (m as any).reasoningContent,
      model: (m as any).model,
      rating: (m as any).rating as 'up' | 'down' | null | undefined,
      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : undefined,
      status: m.status,
    }));
  });

  /** 所有模型 */
  const models = computed<OrbitModelMeta[]>(() => {
    const result: OrbitModelMeta[] = [];
    const providers = store.appData?.providers ?? [];
    for (const p of providers) {
      for (const m of p.models ?? []) {
        result.push({
          id: m.id,
          name: m.name || m.model || m.id,
          description: p.name,
          tags: [p.type || 'api'],
          color: `var(--brand)`,
          providerId: p.id,
        });
      }
    }
    // 兜底：如果没有任何模型
    if (result.length === 0) {
      result.push({
        id: 'default-model',
        name: '默认模型',
        description: '未配置模型',
        tags: ['local'],
        color: 'var(--muted)',
      });
    }
    return result;
  });

  /** 当前选中模型 */
  const selectedModel = computed<OrbitModelMeta>(() => {
    // 1. 当前 topic 关联的 assistant → modelId
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    const assistantId = topic?.assistantId;
    if (assistantId) {
      const assistant = store.appData?.assistants?.find(a => a.id === assistantId);
      if (assistant?.modelId) {
        const m = models.value.find(mm => mm.id === assistant.modelId);
        if (m)
          return m;
      }
    }
    // 2. 用户手动选择的
    if (selectedModelId.value) {
      const m = models.value.find(mm => mm.id === selectedModelId.value);
      if (m)
        return m;
    }
    return models.value[0];
  });

  /** 系统提示词 */
  const inspectorPrompt = computed(() => {
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    const assistantId = topic?.assistantId;
    if (assistantId) {
      const assistant = store.appData?.assistants?.find(a => a.id === assistantId);
      if (assistant?.prompt)
        return assistant.prompt;
    }
    return BUILTIN_PRESETS[0].body;
  });

  /** 提示词预设 */
  const promptPresets = computed(() => BUILTIN_PRESETS);

  /** 是否可发送 */
  const canSend = computed(() => !generating.value && (!!draft.value.trim() || attachments.value.length > 0));

  /** 过滤命令 */
  const filteredCommands = computed(() =>
    !commandQuery.value
      ? BUILTIN_COMMANDS
      : BUILTIN_COMMANDS.filter(c => c.title.includes(commandQuery.value) || c.description.includes(commandQuery.value)),
  );

  /** 过滤对话 */
  const filteredCommandChats = computed(() => {
    const q = commandQuery.value;
    if (!q)
      return chats.value.slice(0, 4);
    return chats.value.filter(c => c.title.includes(q) || (c.preview ?? '').includes(q)).slice(0, 4);
  });

  /** Conversations 组件所需格式 */
  const conversationItems = computed(() =>
    chats.value.map(c => ({
      key: c.id,
      label: c.title,
      description: c.preview || '',
      pinned: c.pinned,
      favorite: c.favorite,
      tags: c.tags,
      icon: c.icon,
      color: c.color,
    })),
  );

  /** 紧凑模式（从 store.settings 读取） */
  const compactMode = computed(() => !!store.appData?.settings?.compactMode);

  /** 默认模型 ID */
  const defaultModelId = computed(() => store.appData?.settings?.defaultModelId || '');

  // ============================================================================
  // 方法
  // ============================================================================

  // —— Toast ——
  function showToast(text: string, undo?: () => void) {
    toast.value = { id: Date.now(), text, undo };
    undoAction.value = undo || null;
    if (toastTimer)
      clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.value = null;
      undoAction.value = null;
    }, 3200);
  }

  function undo() {
    const action = undoAction.value;
    toast.value = null;
    undoAction.value = null;
    if (toastTimer)
      clearTimeout(toastTimer);
    if (action)
      action();
  }

  // —— 对话管理 ——
  function pinChat(id: string) {
    const chat = chats.value.find(c => c.id === id);
    store.pinTopic(id, !chat?.pinned);
    showToast(chat?.pinned ? '已取消置顶' : '已置顶');
  }

  function favoriteChat(id: string) {
    const chat = chats.value.find(c => c.id === id);
    store.favoriteTopic(id, !chat?.favorite);
    showToast(chat?.favorite ? '已取消收藏' : '已收藏');
  }

  function archiveChat(id: string) {
    store.archiveTopic(id);
    showToast('已归档');
    if (activeChatId.value === id) {
      activeChatId.value = '';
    }
  }

  function unarchiveChat(id: string) {
    store.unarchiveTopic(id);
    showToast('已取消归档');
  }

  function editChatTags(id: string, tags: string[]) {
    store.updateTopicTags(id, tags);
  }

  function toggleBatchMode() {
    batchMode.value = !batchMode.value;
    if (!batchMode.value) {
      selectedChatIds.value = new Set();
    }
  }

  function toggleSelectChat(id: string) {
    const next = new Set(selectedChatIds.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectedChatIds.value = next;
  }

  function batchDeleteChats() {
    const ids = Array.from(selectedChatIds.value);
    if (ids.length === 0) return;
    ids.forEach(id => store.deleteTopic(id));
    showToast(`已删除 ${ids.length} 个对话`);
    if (selectedChatIds.value.has(activeChatId.value)) {
      activeChatId.value = '';
    }
    selectedChatIds.value = new Set();
    batchMode.value = false;
  }

  function deleteChatTopic(id: string) {
    store.deleteTopic(id);
    showToast('已删除对话');
    if (activeChatId.value === id) {
      activeChatId.value = '';
    }
  }

  function setSortBy(sort: 'updated' | 'created' | 'title') {
    sortBy.value = sort;
  }

  function toggleShowArchived() {
    showArchived.value = !showArchived.value;
  }

  // —— 命令面板 ——
  function openCommand() {
    modal.value = 'command';
    commandQuery.value = '';
  }

  function runCommand(command: OrbitCommandItem) {
    modal.value = '';
    commandQuery.value = '';
    switch (command.action) {
      case 'new':
        newConversation();
        break;
      case 'model':
        modal.value = 'model';
        break;
      case 'prompt':
        promptDraft.value = inspectorPrompt.value;
        modal.value = 'prompt';
        break;
      case 'focus':
        toggleFocusMode();
        break;
      case 'offline':
        online.value = !online.value;
        showToast(online.value ? '已恢复在线状态' : '已切换到离线模式');
        break;
    }
  }

  // —— 搜索 ——
  function openSearch() {
    searchOpen.value = true;
    searchQuery.value = '';
    searchResults.value = [];
  }

  function closeSearch() {
    searchOpen.value = false;
    searchQuery.value = '';
    searchResults.value = [];
  }

  function runSearch() {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) {
      searchResults.value = [];
      return;
    }

    const results: OrbitSearchResult[] = [];
    const topics = store.appData?.topics ?? [];
    const filter = searchFilters.value;
    const scope = searchScope.value;

    for (const topic of topics) {
      // 高级筛选：按标签
      if (filter.tag) {
        const tags = (topic as any).tags ?? [];
        if (!tags.some((t: string) => t.includes(filter.tag))) continue;
      }

      // 高级筛选：按时间
      if (filter.timeStart || filter.timeEnd) {
        const t = (topic as any).updatedAt || topic.createdAt || '';
        if (filter.timeStart && t < filter.timeStart) continue;
        if (filter.timeEnd && t > filter.timeEnd) continue;
      }

      const topicTitle = topic.name || '未命名对话';
      const topicId = topic.id;

      // 搜索标题
      if (scope === 'all' || scope === 'title') {
        if (topicTitle.toLowerCase().includes(q)) {
          results.push({
            id: `title-${topicId}`,
            topicId,
            topicTitle,
            matchType: 'title',
            matchContent: topicTitle,
            matchIndex: 0,
          });
        }
      }

      // 搜索消息
      if (scope === 'all' || scope === 'messages') {
        const msgs = topic.messages ?? [];
        const filteredMsgs = filter.model
          ? msgs.filter(m => (m as any).model?.toLowerCase().includes(filter.model.toLowerCase()))
          : msgs;

        for (let i = 0; i < filteredMsgs.length; i++) {
          const m = filteredMsgs[i];
          const content = m.content || '';
          if (content.toLowerCase().includes(q)) {
            results.push({
              id: `msg-${m.id}`,
              topicId,
              topicTitle,
              matchType: 'message',
              matchContent: content,
              matchIndex: i,
              messageId: m.id,
              messageRole: m.role,
              messageTime: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : undefined,
            });
          }
        }
      }
    }

    searchResults.value = results;
  }

  function jumpToSearchResult(result: OrbitSearchResult) {
    closeSearch();
    activeChatId.value = result.topicId;
    sidebarOpen.value = false;
    if (result.messageId) {
      scrollTargetId.value = result.messageId;
    }
  }

  // —— 对话 ——
  async function newConversation() {
    const topicId = crypto.randomUUID?.() || `topic-${Date.now()}`;
    const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#2f54eb', '#a0d911'];
    const topic: Topic = {
      id: topicId,
      name: '新对话',
      messages: [],
      assistantId: '',
      createdAt: new Date().toISOString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    } as Topic;
    store.addTopic('', topic);
    await nextTick();
    activeChatId.value = topicId;
    sidebarOpen.value = false;
    showToast('已创建新对话');
  }

  function openConversation(id: string) {
    activeChatId.value = id;
    sidebarOpen.value = false;
    modal.value = '';
  }

  // —— 模型 ——
  function selectModel(model: OrbitModelMeta) {
    selectedModelId.value = model.id;
    modal.value = '';
    showToast(`已切换到 ${model.name}`);
  }

  // —— 布局 ——
  function toggleFocusMode() {
    focusMode.value = !focusMode.value;
    if (focusMode.value) {
      inspectorVisible.value = false;
      inspectorOpen.value = false;
    }
    else if (typeof window !== 'undefined' && window.innerWidth > 1180) {
      inspectorVisible.value = true;
    }
  }

  function toggleInspector() {
    inspectorOpen.value = !inspectorOpen.value;
  }

  function closeDrawers() {
    sidebarOpen.value = false;
    inspectorOpen.value = false;
  }

  // —— 附件 ——
  function addFiles(files: File[] | FileList) {
    const arr = Array.from(files).slice(0, 6 - attachments.value.length);
    arr.forEach((f) => {
      const entry: OrbitAttachmentFile = {
        id: crypto.randomUUID?.() || `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        progress: 0,
        loading: true,
      };
      attachments.value.push(entry);

      // 图片文件读取为 dataURL 并显示进度
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            entry.progress = Math.round((e.loaded / e.total) * 100);
          }
        };
        reader.onload = () => {
          entry.dataUrl = reader.result as string;
          entry.progress = 100;
          entry.loading = false;
        };
        reader.onerror = () => {
          entry.loading = false;
        };
        reader.readAsDataURL(f);
      } else {
        entry.progress = 100;
        entry.loading = false;
      }
    });
    showToast(`已添加 ${arr.length} 个附件`);
  }

  function removeAttachment(id: string) {
    const removed = attachments.value.find(a => a.id === id);
    attachments.value = attachments.value.filter(a => a.id !== id);
    if (removed) {
      showToast(`已移除 ${removed.name}`, () => {
        attachments.value.push(removed);
      });
    }
  }

  // —— 附件预览 ——
  function previewAttachment(id: string) {
    const idx = attachments.value.findIndex(a => a.id === id);
    if (idx === -1) return;
    attachmentPreview.value = {
      open: true,
      files: attachments.value.filter(a => a.dataUrl),
      index: attachments.value.filter(a => a.dataUrl).findIndex(a => a.id === id),
    };
    if (attachmentPreview.value.index < 0) attachmentPreview.value.index = 0;
  }

  function closePreview() {
    attachmentPreview.value = { open: false, files: [], index: 0 };
  }

  function nextPreview() {
    const p = attachmentPreview.value;
    if (p.files.length === 0) return;
    p.index = (p.index + 1) % p.files.length;
  }

  function prevPreview() {
    const p = attachmentPreview.value;
    if (p.files.length === 0) return;
    p.index = (p.index - 1 + p.files.length) % p.files.length;
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // —— 内部：流式请求辅助 ——
  async function _sendStreamRequest(topicId: string, assistantMsgId: string, apiMessages: ChatMessage[]) {
    // 查找 provider
    const model = selectedModel.value;
    const providerId = model.providerId;
    const allProviders: Provider[] = store.appData?.providers ?? [];
    let provider: Provider | undefined;
    if (providerId) {
      provider = allProviders.find(p => p.id === providerId);
    }
    if (!provider) {
      provider = allProviders[0];
    }
    if (!provider) {
      store.updateMessage(topicId, assistantMsgId, {
        content: '无法连接到 AI 服务：未配置模型提供商。请在设置中添加一个 Provider。',
        status: 'error',
      });
      generating.value = false;
      showToast('发送失败：未配置 Provider');
      return;
    }

    // 流式调用
    abortController = new AbortController();
    let fullContent = '';

    try {
      const gen = streamChat({
        provider,
        model: model.id,
        messages: apiMessages,
        temperature: temperature.value,
        topP: topP.value,
        maxTokens: maxTokens.value,
        signal: abortController.signal,
      });
      streamGen = gen;

      for await (const delta of gen) {
        if (delta.content) {
          fullContent += delta.content;
          store.updateMessage(topicId, assistantMsgId, {
            content: fullContent,
            status: 'streaming',
          });
        }
      }

      store.updateMessage(topicId, assistantMsgId, {
        content: fullContent,
        status: 'done',
      });
    }
    catch (err: any) {
      if (err?.name === 'AbortError' || abortController?.signal.aborted) {
        store.updateMessage(topicId, assistantMsgId, {
          content: fullContent || '已停止生成。',
          status: 'done',
        });
      }
      else {
        store.updateMessage(topicId, assistantMsgId, {
          content: fullContent || `请求失败：${err?.message || '未知错误'}`,
          status: 'error',
        });
        showToast('请求失败，请检查网络或 API 配置');
      }
    }
    finally {
      generating.value = false;
      nearBottom.value = true;
      abortController = null;
      streamGen = null;
    }
  }

  // —— 发送消息（流式 SSE） ——
  async function sendMessage() {
    if (!canSend.value)
      return;

    const text = draft.value.trim();
    const currentAttachments = [...attachments.value];
    draft.value = '';
    attachments.value = [];
    replyingTo.value = '';

    // 1. 确保有活跃对话
    if (!activeChatId.value) {
      await newConversation();
      // 验证 topic 已成功创建
      const created = store.appData?.topics?.find(t => t.id === activeChatId.value);
      if (!created) {
        showToast('创建对话失败，请重试');
        return;
      }
    }
    const topicId = activeChatId.value;
    if (!topicId)
      return;

    // 2. 写入 user 消息到 store
    const userMsg = {
      id: crypto.randomUUID?.() || `msg-${Date.now()}`,
      role: 'user' as const,
      content: text,
      createdAt: Date.now(),
      status: 'done' as const,
      attachments: currentAttachments.length > 0 ? currentAttachments.map(a => ({
        id: a.id,
        name: a.name,
        size: a.size,
        type: a.type,
        dataUrl: a.dataUrl,
      })) : undefined,
    };
    store.addMessage(topicId, userMsg);

    // 2b. 新对话首条消息 → 自动标题
    const topicAfterAdd = store.appData?.topics?.find(t => t.id === topicId);
    if (topicAfterAdd && topicAfterAdd.name === '新对话') {
      store.updateTopic(topicId, { name: text.slice(0, 30) });
    }

    // 3. 写入 assistant 占位消息
    const assistantMsgId = crypto.randomUUID?.() || `msg-${Date.now() + 1}`;
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: '',
      createdAt: Date.now() + 1,
      status: 'streaming' as const,
    };
    store.addMessage(topicId, assistantMsg);

    generating.value = true;
    nearBottom.value = true;

    // 4. 构建 API 请求用的 messages 数组
    const topic = store.appData?.topics?.find(t => t.id === topicId);
    const allMessages = topic?.messages ?? [];
    const apiMessages: ChatMessage[] = allMessages
      .filter(m => m.id !== assistantMsgId || m.content)
      .map((m) => {
        // 截断过长的消息
        let content = m.content || '';
        if (content.length > 8000)
          content = content.slice(0, 8000);
        return { role: m.role as 'user' | 'assistant' | 'system', content };
      });

    // 5. 注入系统提示词（作为第一条 system 消息）
    const systemPrompt = inspectorPrompt.value;
    if (systemPrompt) {
      apiMessages.unshift({ role: 'system', content: systemPrompt });
    }

    // 6. 发起流式请求
    await _sendStreamRequest(topicId, assistantMsgId, apiMessages);
  }

  function stopGeneration() {
    if (abortController) {
      abortController.abort();
    }
    generating.value = false;
    showToast('已停止生成');
  }

  // —— 消息操作 ——
  function copyMessage(message: OrbitMessage) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(message.content).then(
        () => showToast('已复制到剪贴板'),
        () => showToast('复制失败，请检查浏览器权限'),
      );
    }
  }

  // 1. 重新生成
  async function regenerateMessage() {
    if (generating.value || !activeChatId.value)
      return;
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    if (!topic?.messages?.length)
      return;

    // 找最后一条 user 消息
    let lastUserIdx = -1;
    for (let i = topic.messages.length - 1; i >= 0; i--) {
      if (topic.messages[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1)
      return;

    // 删掉最后一条 assistant 消息
    const lastMsg = topic.messages[topic.messages.length - 1];
    if (lastMsg.role === 'assistant' && topic.messages.length - 1 > lastUserIdx) {
      store.deleteMessage(activeChatId.value, lastMsg.id);
    }

    // 构建 API 消息
    const updatedTopic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    const allMessages = updatedTopic?.messages ?? [];
    const apiMessages: ChatMessage[] = allMessages
      .filter(m => m.content)
      .map(m => {
        let content = m.content || '';
        if (content.length > 8000)
          content = content.slice(0, 8000);
        return { role: m.role as 'user' | 'assistant' | 'system', content };
      });

    const systemPrompt = inspectorPrompt.value;
    if (systemPrompt)
      apiMessages.unshift({ role: 'system', content: systemPrompt });

    // 添加 assistant 占位
    const assistantMsgId = crypto.randomUUID?.() || `msg-${Date.now()}`;
    store.addMessage(activeChatId.value, {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: '',
      createdAt: Date.now(),
      status: 'streaming' as const,
    });

    generating.value = true;
    nearBottom.value = true;
    await _sendStreamRequest(activeChatId.value, assistantMsgId, apiMessages);
  }

  // 2. 编辑用户消息
  function startEditMessage(msg: OrbitMessage) {
    editingMessageId.value = msg.id;
    editDraft.value = msg.content;
  }

  function confirmEditMessage() {
    if (!editingMessageId.value || !activeChatId.value)
      return;
    store.updateMessage(activeChatId.value, editingMessageId.value, {
      content: editDraft.value,
    });
    editingMessageId.value = null;
    editDraft.value = '';
  }

  function cancelEditMessage() {
    editingMessageId.value = null;
    editDraft.value = '';
  }

  // 3. 从此处继续对话
  function continueFrom(msg: OrbitMessage) {
    const topicId = crypto.randomUUID?.() || `topic-${Date.now()}`;
    const topic: Topic = {
      id: topicId,
      name: (msg.content || '').slice(0, 30) || '继续对话',
      messages: [],
      assistantId: '',
      createdAt: new Date().toISOString(),
    } as Topic;
    store.addTopic('', topic);
    activeChatId.value = topicId;
    sidebarOpen.value = false;

    // 将当前消息作为种子写入 draft
    draft.value = `继续：${(msg.content || '').slice(0, 200)}`;
    showToast('已创建新对话');
  }

  // 4. 点赞/点踩持久化
  function rateMessage(message: OrbitMessage, rating: 'up' | 'down' | null) {
    if (!activeChatId.value)
      return;
    // toggle: 再次点击同一 rating 取消
    const newRating = (message.rating === rating) ? null : rating;
    store.updateMessage(activeChatId.value, message.id, {
      rating: newRating,
    } as any);
    if (newRating === 'up')
      showToast('已点赞');
    else if (newRating === 'down')
      showToast('已点踩');
  }

  // 5. 删除消息
  function deleteMessage(msg: OrbitMessage) {
    if (!activeChatId.value)
      return;
    store.deleteMessage(activeChatId.value, msg.id);
    showToast('已删除消息');
  }

  // 6. 分支（真实现）
  function branchFrom(message: OrbitMessage) {
    if (!activeChatId.value)
      return;
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    if (!topic?.messages)
      return;

    // 找到该消息的索引
    const msgIndex = topic.messages.findIndex(m => m.id === message.id);
    if (msgIndex === -1)
      return;

    // 创建新 topic
    const topicId = crypto.randomUUID?.() || `topic-${Date.now()}`;
    const newTopic: Topic = {
      id: topicId,
      name: `${topic.name || '对话'} - 分支`,
      messages: topic.messages.slice(0, msgIndex + 1).map(m => ({ ...m })),
      assistantId: topic.assistantId,
      createdAt: new Date().toISOString(),
    } as Topic;
    store.addTopic('', newTopic);
    activeChatId.value = topicId;
    sidebarOpen.value = false;
    replyingTo.value = message.content.slice(0, 42);
    showToast('已创建分支');
  }

  // —— 提示词 ——
  function savePrompt() {
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    const assistantId = topic?.assistantId;
    if (assistantId && promptDraft.value) {
      store.updateAssistant(assistantId, { prompt: promptDraft.value });
    }
    modal.value = '';
    showToast('系统提示词已保存');
  }

  // —— 导入/导出 ——
  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file)
        return;
      try {
        const stats = await store.importData(file);
        showToast(`导入完成：${stats.topics || 0} 个对话，${stats.assistants || 0} 个助手`);
      }
      catch (err: any) {
        showToast(`导入失败：${err?.message || '未知错误'}`);
      }
    };
    input.click();
  }

  function handleExport() {
    try {
      store.downloadExport();
      showToast('数据导出成功');
    }
    catch (err: any) {
      showToast(`导出失败：${err?.message || '未知错误'}`);
    }
  }

  function handleClearData() {
    store.clearData();
    activeChatId.value = '';
    showToast('所有数据已清除');
  }

  // —— Markdown 导出 ——
  function exportMarkdown() {
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    if (!topic) {
      showToast('无活跃对话');
      return;
    }
    const title = topic.name || '对话';
    const lines: string[] = [`# ${title}`, '', '---', ''];
    const msgs = topic.messages ?? [];
    for (const m of msgs) {
      const role = m.role === 'user' ? '## User' : '## Assistant';
      lines.push(role, '', m.content || '', '', '---', '');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Markdown 导出成功');
  }

  // —— ZIP 导出（JSZip 降级方案） ——
  async function exportZip() {
    const topic = store.appData?.topics?.find(t => t.id === activeChatId.value);
    if (!topic) {
      showToast('无活跃对话');
      return;
    }
    try {
      // 尝试用 JSZip
      const JSZip = (window as any).JSZip;
      if (!JSZip) throw new Error('no-jszip');
      const zip = new JSZip();
      const title = topic.name || '对话';
      // Markdown
      const lines: string[] = [`# ${title}`, '', '---', ''];
      for (const m of topic.messages ?? []) {
        const role = m.role === 'user' ? '## User' : '## Assistant';
        lines.push(role, '', m.content || '', '', '---', '');
      }
      zip.file(`${title}.md`, lines.join('\n'));
      // JSON
      zip.file('data.json', JSON.stringify(topic, null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('ZIP 导出成功');
    } catch {
      // 降级：仅导出 JSON
      const title = topic.name || '对话';
      const blob = new Blob([JSON.stringify(topic, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('已导出 JSON（安装 JSZip 后可打包为 ZIP）');
    }
  }

  // —— 设置方法 ——
  function toggleDarkMode() {
    settingsDarkMode.value = !settingsDarkMode.value;
    store.appData!.settings = { ...(store.appData?.settings ?? {}), theme: settingsDarkMode.value ? 'dark' : 'light' } as any;
    store._save();
    if (settingsDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleCompactMode() {
    const current = compactMode.value;
    store.appData!.settings = { ...(store.appData?.settings ?? {}), compactMode: !current } as any;
    store._save();
  }

  function setDefaultModel(modelId: string) {
    store.appData!.settings = { ...(store.appData?.settings ?? {}), defaultModelId: modelId } as any;
    store._save();
    if (modelId) {
      selectedModelId.value = modelId;
    }
    showToast(modelId ? '默认模型已更新' : '已取消默认模型');
  }

  // —— 滚动 ——
  function scrollToBottom() {
    nearBottom.value = true;
  }

  // —— 响应式 ——
  function handleResize() {
    if (typeof window === 'undefined')
      return;
    if (window.innerWidth > 1180 && !focusMode.value) {
      inspectorVisible.value = true;
    }
    if (window.innerWidth > 760) {
      sidebarOpen.value = false;
    }
  }

  // —— 生命周期 ——
  onMounted(async () => {
    await store.init();
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      window.addEventListener('online', () => {
        online.value = true;
        showToast('网络已恢复');
      });
      window.addEventListener('offline', () => {
        online.value = false;
        showToast('当前处于离线状态');
      });
    }
    // 初始化选中第一个对话
    if (!activeChatId.value && chats.value.length > 0) {
      activeChatId.value = chats.value[0].id;
    }

    // 应用默认模型
    const dmId = defaultModelId.value;
    if (dmId && models.value.some(m => m.id === dmId)) {
      selectedModelId.value = dmId;
    }
  });

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    if (toastTimer)
      clearTimeout(toastTimer);
    // 清理流式连接
    if (abortController) {
      abortController.abort();
    }
  });

  return {
    // 状态
    sidebarOpen,
    inspectorOpen,
    inspectorVisible,
    focusMode,
    online,
    modal,
    commandQuery,
    toast,
    undoAction,
    models,
    selectedModel,
    chats,
    activeChatId,
    messages,
    generating,
    nearBottom,
    replyingTo,
    attachments,
    draft,
    promptPresets,
    promptDraft,
    inspectorPrompt,
    canSend,
    filteredCommands,
    filteredCommandChats,
    currentChat,
    editingMessageId,
    editDraft,
    isCollapsed,
    selectedChatIds,
    batchMode,
    sortBy,
    showArchived,
    conversationItems,
    // 附件
    attachmentPreview,
    previewAttachment,
    closePreview,
    nextPreview,
    prevPreview,
    // 搜索
    searchOpen,
    searchQuery,
    searchScope,
    searchResults,
    searchFilters,
    scrollTargetId,
    openSearch,
    closeSearch,
    runSearch,
    jumpToSearchResult,
    // 模型参数
    temperature,
    maxTokens,
    topP,
    // 设置
    compactMode,
    defaultModelId,
    settingsDarkMode,
    settingsLanguage,
    toggleDarkMode,
    toggleCompactMode,
    setDefaultModel,
    // 方法
    showToast,
    undo,
    openCommand,
    runCommand,
    newConversation,
    openConversation,
    selectModel,
    toggleFocusMode,
    toggleInspector,
    closeDrawers,
    addFiles,
    removeAttachment,
    sendMessage,
    stopGeneration,
    copyMessage,
    rateMessage,
    branchFrom,
    regenerateMessage,
    startEditMessage,
    confirmEditMessage,
    cancelEditMessage,
    continueFrom,
    deleteMessage,
    savePrompt,
    handleImport,
    handleExport,
    handleClearData,
    exportMarkdown,
    exportZip,
    scrollToBottom,
    // 对话管理
    pinChat,
    favoriteChat,
    archiveChat,
    unarchiveChat,
    editChatTags,
    toggleBatchMode,
    toggleSelectChat,
    batchDeleteChats,
    deleteChatTopic,
    setSortBy,
    toggleShowArchived,
  };
}

export type OrbitState = ReturnType<typeof useOrbitState>;
