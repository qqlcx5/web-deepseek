/*
 * Orbit AI 状态管理 (composable)
 * 移植自 chat.html 的 Vue 实例响应式状态 + 方法
 * 目标：保持样式阶段的交互可演练（不接 SSE）
 */

import {
  ORBIT_BRANCHES,
  ORBIT_CHATS,
  ORBIT_COMMANDS,
  ORBIT_DEFAULT_PROMPT,
  ORBIT_INSPECTOR_PROMPT,
  ORBIT_INSPECTOR_USAGE,
  ORBIT_MODELS,
  ORBIT_PROMPT_PRESETS,
  ORBIT_WORKSPACES,
  createOrbitMessages,
  type OrbitChatMeta,
  type OrbitCommandItem,
  type OrbitMessage,
  type OrbitModelMeta,
  type OrbitPromptPreset,
} from './orbitData';

export interface OrbitAttachment {
  id: number;
  name: string;
  size: string;
}

export interface OrbitToast {
  id: number;
  text: string;
  undo?: () => void;
}

export function useOrbitState() {
  // —— 布局 ——
  const sidebarOpen = ref(true);
  const inspectorOpen = ref(false);
  const inspectorVisible = ref(true);
  const focusMode = ref(false);
  const online = ref(true);

  // —— 弹窗 ——
  const modal = ref<'' | 'command' | 'model' | 'prompt'>('');

  // —— 命令面板 ——
  const commandQuery = ref('');

  // —— Toast ——
  const toast = ref<OrbitToast | null>(null);
  const undoAction = ref<null | (() => void)>(null);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  // —— 模型 ——
  const models = ref<OrbitModelMeta[]>(ORBIT_MODELS);
  const selectedModel = ref<OrbitModelMeta>(ORBIT_MODELS[0]);

  // —— 数据 ——
  const workspaces = ref(ORBIT_WORKSPACES);
  const chats = ref<OrbitChatMeta[]>(ORBIT_CHATS);
  const activeChatId = ref<string>('c1');

  // —— 消息 ——
  const messages = ref<OrbitMessage[]>(createOrbitMessages());
  const generating = ref(false);
  const nearBottom = ref(true);
  const replyingTo = ref<string>('');
  const attachments = ref<OrbitAttachment[]>([]);
  const draft = ref('');

  // —— 提示词 ——
  const promptPresets = ref<OrbitPromptPreset[]>(ORBIT_PROMPT_PRESETS);
  const promptDraft = ref(ORBIT_DEFAULT_PROMPT);
  const inspectorPrompt = ref(ORBIT_INSPECTOR_PROMPT);

  // —— 分支 / Inspector 数据 ——
  const branches = ref(ORBIT_BRANCHES);
  const usage = ref(ORBIT_INSPECTOR_USAGE);
  const contextFiles = ref([
    { name: 'migration-plan.pdf', meta: '24 页已解析', icon: 'file' },
    { name: 'cost-comparison.csv', meta: '86 行已解析', icon: 'sheet' },
  ]);
  const costGrid = ref({
    input: '8,420',
    output: '2,186',
    cost: '$0.008',
    duration: '3.8s',
  });

  // —— 命令 ——
  const commands = ref<OrbitCommandItem[]>(ORBIT_COMMANDS);

  // —— 断点 ——
  const mobileBreakpoint = 760;
  const tabletBreakpoint = 1180;

  // —— 计算属性 ——
  const canSend = computed(
    () => !generating.value && (!!draft.value.trim() || attachments.value.length > 0),
  );
  const filteredCommands = computed(() =>
    !commandQuery.value
      ? commands.value
      : commands.value.filter(
          (c) =>
            c.title.includes(commandQuery.value) || c.description.includes(commandQuery.value),
        ),
  );
  const filteredCommandChats = computed(() => {
    if (!commandQuery.value) return chats.value.slice(0, 4);
    return chats.value
      .filter(
        (c) => c.title.includes(commandQuery.value) || c.preview.includes(commandQuery.value),
      )
      .slice(0, 4);
  });
  const currentChat = computed(
    () => chats.value.find((c) => c.id === activeChatId.value) || chats.value[0],
  );

  // —— 通知 ——
  function showToast(text: string, undo?: () => void) {
    toast.value = { id: Date.now(), text, undo };
    undoAction.value = undo || null;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.value = null;
      undoAction.value = null;
    }, 3200);
  }

  function undo() {
    const action = undoAction.value;
    toast.value = null;
    undoAction.value = null;
    if (toastTimer) clearTimeout(toastTimer);
    if (action) action();
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

  // —— 对话 ——
  function newConversation() {
    const id = `chat-${Date.now()}`;
    chats.value.unshift({
      id,
      title: '新对话',
      preview: '暂无消息',
      group: '7 天内',
    });
    activeChatId.value = id;
    messages.value = [];
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
    selectedModel.value = model;
    modal.value = '';
    showToast(`已切换到 ${model.name}`);
  }

  // —— 布局 ——
  function toggleFocusMode() {
    focusMode.value = !focusMode.value;
    if (focusMode.value) {
      inspectorVisible.value = false;
      inspectorOpen.value = false;
    } else if (typeof window !== 'undefined' && window.innerWidth > tabletBreakpoint) {
      inspectorVisible.value = true;
    }
  }
  function toggleInspector() {
    if (inspectorVisible.value) {
      inspectorOpen.value = !inspectorOpen.value;
    } else {
      inspectorOpen.value = !inspectorOpen.value;
    }
  }
  function closeDrawers() {
    sidebarOpen.value = false;
    inspectorOpen.value = false;
  }

  // —— 草稿 ——
  function handleComposerKeydown(e: KeyboardEvent) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    if ((e as any).isComposing) return;
    e.preventDefault();
    sendMessage();
  }
  function addFiles(files: File[] | FileList) {
    const arr = Array.from(files).slice(0, 6 - attachments.value.length);
    arr.forEach((f) =>
      attachments.value.push({
        id: Date.now() + Math.random(),
        name: f.name,
        size: formatSize(f.size),
      }),
    );
    showToast(`已添加 ${arr.length} 个附件`);
  }
  function removeAttachment(id: number) {
    const removed = attachments.value.find((a) => a.id === id);
    attachments.value = attachments.value.filter((a) => a.id !== id);
    if (removed) {
      const target = removed;
      showToast(`已移除 ${target.name}`, () => {
        attachments.value.push(target);
      });
    }
  }
  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // —— 发送 ——
  function sendMessage() {
    if (!canSend.value) return;
    const text = draft.value.trim();
    messages.value.push({
      id: Date.now(),
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
    draft.value = '';
    attachments.value = [];
    replyingTo.value = '';
    const aiId = Date.now() + 1;
    messages.value.push({
      id: aiId,
      role: 'assistant',
      model: selectedModel.value.name,
      content: '',
      loading: true,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      branches: 1,
      activeBranch: 1,
    });
    generating.value = true;
    setTimeout(() => {
      const target = messages.value.find((m) => m.id === aiId);
      if (!target) return;
      target.loading = false;
      target.content = `这是「${text.slice(0, 20)}」的模拟回复，用于演示 Orbit 样式。`;
      generating.value = false;
      nearBottom.value = true;
    }, 800);
  }

  function stopGeneration() {
    generating.value = false;
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === 'assistant') {
      last.loading = false;
      if (!last.content) last.content = '生成已停止。';
    }
    showToast('已停止生成');
  }

  function copyMessage(message: OrbitMessage) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(message.content).then(
        () => showToast('已复制到剪贴板'),
        () => showToast('复制失败，请检查浏览器权限'),
      );
    }
  }

  function rateMessage(message: OrbitMessage, rating: 'up' | 'down') {
    message.rating = message.rating === rating ? null : rating;
    showToast(rating === 'up' ? '已点赞' : '已反馈');
  }

  function regenerate(message: OrbitMessage) {
    const next = (message.branches || 1) + 1;
    message.branches = next;
    message.activeBranch = next;
    showToast(`已切换到分支 ${next}`);
  }

  function branchFrom(message: OrbitMessage) {
    replyingTo.value = message.content.slice(0, 42);
    showToast('已基于此消息创建分支');
  }

  function editMessage(message: OrbitMessage) {
    draft.value = message.content;
    replyingTo.value = '编辑历史消息后重新发送';
  }

  function savePrompt() {
    modal.value = '';
    inspectorPrompt.value = promptDraft.value;
    showToast('系统提示词已保存');
  }

  // —— 滚到底部 ——
  function scrollToBottom() {
    nearBottom.value = true;
  }

  // —— 响应式 ——
  function handleResize() {
    if (typeof window === 'undefined') return;
    if (window.innerWidth > tabletBreakpoint && !focusMode.value) {
      inspectorVisible.value = true;
    }
    if (window.innerWidth > mobileBreakpoint) {
      sidebarOpen.value = false;
    }
  }

  // —— 生命周期 ——
  onMounted(() => {
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
  });
  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    if (toastTimer) clearTimeout(toastTimer);
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
    workspaces,
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
    branches,
    usage,
    contextFiles,
    costGrid,
    commands,
    // 计算
    canSend,
    filteredCommands,
    filteredCommandChats,
    currentChat,
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
    handleComposerKeydown,
    addFiles,
    removeAttachment,
    sendMessage,
    stopGeneration,
    copyMessage,
    rateMessage,
    regenerate,
    branchFrom,
    editMessage,
    savePrompt,
    scrollToBottom,
  };
}

export type OrbitState = ReturnType<typeof useOrbitState>;