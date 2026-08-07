/*
 * Orbit AI 静态展示数据
 * 移植自 chat.html 的 JS 部分
 * 用于演示样式时填充侧栏 / 消息 / 模型选择器等内容
 */

export interface OrbitWorkspace {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface OrbitChatMeta {
  id: string;
  title: string;
  preview: string;
  group: string;
  pinned?: boolean;
}

export interface OrbitModelMeta {
  id: string;
  name: string;
  color: string;
  description: string;
  tags: string[];
}

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

export interface OrbitMessageBranch {
  index: number;
  title: string;
  count: number;
  meta: string;
  active?: boolean;
  muted?: boolean;
}

export interface OrbitMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  html?: string;
  time: string;
  model?: string;
  loading?: boolean;
  rating?: 'up' | 'down' | null;
  branches?: number;
  activeBranch?: number;
  sources?: OrbitMessageSource[];
  artifact?: OrbitMessageArtifact;
}

export interface OrbitPromptPreset {
  id: string;
  title: string;
  body: string;
}

export interface OrbitCommandItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  shortcut?: string;
  action: 'new' | 'model' | 'prompt' | 'focus' | 'offline';
}

export const ORBIT_WORKSPACES: OrbitWorkspace[] = [
  { id: 'personal', name: '个人空间', color: '#5b56d6', count: 8 },
  { id: 'product', name: '产品研发', color: '#16875d', count: 5 },
  { id: 'content', name: '内容创作', color: '#d97706', count: 3 },
];

export const ORBIT_CHATS: OrbitChatMeta[] = [
  { id: 'c1', title: '迁移方案 v1', preview: '比较 MinIO 与 OSS 的成本结构', group: '7 天内', pinned: true },
  { id: 'c2', title: '新对话', preview: '暂无消息', group: '7 天内' },
  { id: 'c3', title: '登录态改造方案', preview: 'JWT 与 Session 的取舍', group: '7 天内' },
  { id: 'c4', title: 'MiniMax 周报整理', preview: '本周完成的功能与遗留事项', group: '30 天内' },
  { id: 'c5', title: 'SEO 关键词研究', preview: '3 个候选词 + 流量估算', group: '30 天内' },
];

export const ORBIT_MODELS: OrbitModelMeta[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    color: '#10a37f',
    description: '视觉 + 文件，长上下文 128K',
    tags: ['视觉', '128K'],
  },
  {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    color: '#d97757',
    description: '文件 + 长上下文 200K',
    tags: ['文件', '200K'],
  },
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    color: '#4285f4',
    description: '视觉 + 音频 + 1M 上下文',
    tags: ['视觉', '音频', '1M'],
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    color: '#4d6bfe',
    description: '中文友好 + 代码强项',
    tags: ['中文', '代码', '64K'],
  },
];

export const ORBIT_PROMPT_PRESETS: OrbitPromptPreset[] = [
  {
    id: 'tech',
    title: '技术评审',
    body: '你是一位资深软件架构师，请用简洁的中文评审以下方案的可行性、性能瓶颈与可改进点。',
  },
  {
    id: 'product',
    title: '产品评审',
    body: '请站在产品经理视角评估以下功能：用户价值、商业价值、上线风险。',
  },
  {
    id: 'concise',
    title: '简洁回答',
    body: '用最少的文字准确回答问题，避免客套话，使用项目符号。',
  },
];

export const ORBIT_COMMANDS: OrbitCommandItem[] = [
  { id: 'new', title: '新建对话', description: '开启一个全新的会话', icon: 'plus', shortcut: '⌘N', action: 'new' },
  { id: 'model', title: '切换模型', description: '为当前会话选择不同模型', icon: 'sparkles', action: 'model' },
  { id: 'prompt', title: '编辑系统提示词', description: '调整当前会话的角色与风格', icon: 'edit', action: 'prompt' },
  { id: 'focus', title: '专注模式', description: '隐藏侧栏与 Inspector 沉浸思考', icon: 'eye', shortcut: '⌘⇧F', action: 'focus' },
  { id: 'offline', title: '模拟离线状态', description: '在网络异常时继续编辑草稿', icon: 'wifi-off', action: 'offline' },
];

export const ORBIT_BRANCHES: OrbitMessageBranch[] = [
  { index: 1, title: '原始方案', count: 6, meta: '当前分支', active: true },
  { index: 2, title: 'MinIO 迁移方案', count: 3, meta: '12 分钟前', muted: true },
];

const formatNow = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export function createOrbitMessages(): OrbitMessage[] {
  return [
    {
      id: Date.now() - 4000,
      role: 'user',
      content: '帮我对比 MinIO 和阿里云 OSS 在 5TB 静态资源场景下的成本与运维负担，给我一份可直接发给财务的表格。',
      time: formatNow(),
    },
    {
      id: Date.now() - 3500,
      role: 'assistant',
      model: 'DeepSeek Chat',
      content:
        '下面是从存储、流量、请求次数、运维四个维度的对比。我已把数据填入表格并附上口径说明，方便你直接导出到 Markdown。',
      html: undefined,
      time: formatNow(),
      rating: 'up',
      branches: 1,
      activeBranch: 1,
      sources: [
        { index: 1, title: '对象存储计费白皮书 2024.pdf', snippet: 'OSS 标准型存储 0.12 元/GB/月…', url: '#' },
        { index: 2, title: 'MinIO 分布式部署最佳实践.md', snippet: 'EC 编码可在 5TB 量级减少 30% 存储…', url: '#' },
      ],
      artifact: { title: 'cost-comparison.md', size: '4.2 KB', type: '文档' },
    },
    {
      id: Date.now() - 1500,
      role: 'user',
      content: '再加一列「年度人力成本」和「3 年 TCO」，并给一个推荐结论。',
      time: formatNow(),
    },
    {
      id: Date.now() - 1000,
      role: 'assistant',
      model: 'DeepSeek Chat',
      content: '好的，已补充年度人力成本与 3 年 TCO，并给出推荐结论。',
      time: formatNow(),
      loading: true,
      branches: 2,
      activeBranch: 2,
    },
  ];
}

export const ORBIT_DEFAULT_PROMPT =
  '你是一位严谨、乐于助人的中文 AI 助手，优先给出可执行的步骤与代码示例。';

export const ORBIT_INSPECTOR_PROMPT =
  '你是一位严谨、乐于助人的中文 AI 助手，优先给出可执行的步骤与代码示例，遇到不确定信息时主动澄清。';

export const ORBIT_INSPECTOR_USAGE = {
  total: 48240,
  ratio: 0.38,
  remainChars: '约 52,000 字符',
};