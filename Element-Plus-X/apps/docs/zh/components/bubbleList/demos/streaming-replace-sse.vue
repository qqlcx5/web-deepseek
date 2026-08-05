<docs>
---
title: 模拟真实 SSE（全量累计）复现自动触底失效
---

::: warning 复现目的
某些后端为了简化前端处理，会把每次 SSE 事件的 `data.content` 设计为**已拼接好的累计全量内容**，前端只需在每次 `onmessage` 里把最后一次的 `content` 直接 **赋值（替换）** 到 AI 气泡上即可，无需自己拼接。

这种「全量替换」模式与示例库里常见的「增量追加（`content += chunk`）」模式行为非常接近，但在某些情况下会导致 `BubbleList` 的自动触底/流式跟随失效。这个 demo 用来稳定复现该问题。
:::

**关键差异**：
- 常规 demo：`currentItem.content += chunk`（字符串原地变长）
- 本 demo：`currentItem.content = latestSSEEvent.content`（每次都替换为新的完整字符串）

操作步骤：
1. 点击「开始模拟 SSE 流」
2. 观察 AI 气泡内容持续变长 —— **预期**：列表始终贴底；**实际**：列表停在初始位置，不会跟随
3. 如需对比，可点击「切换到增量追加模式」再试一次
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListItemProps,
  BubbleListProps,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';
import {
  defineComponent,
  h,
  onBeforeUnmount as vOnBeforeUnmount,
  onMounted as vOnMounted,
  ref as vRef
} from 'vue';

interface MessageItem extends BubbleListItemProps {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
}

// ============== <think> 解析 ==============
type ThinkingStatus = 'start' | 'thinking' | 'end';
interface ParsedThink {
  thinking: string;
  body: string;
  status: ThinkingStatus;
}

function parseThink(raw: string): ParsedThink {
  if (!raw) return { thinking: '', body: '', status: 'start' };
  const open = raw.indexOf('<think>');
  if (open < 0) return { thinking: '', body: raw, status: 'start' };
  const close = raw.indexOf('</think>', open + 7);
  if (close < 0) {
    // 思考进行中：还没看到闭合标签，全部内容都是思考
    return {
      thinking: raw.slice(open + 7),
      body: '',
      status: 'thinking'
    };
  }
  const thinking = raw.slice(open + 7, close);
  const body = (raw.slice(0, open) + raw.slice(close + 8)).replace(/^\s+/, '');
  return { thinking, body, status: 'end' };
}

// ============== 异步加载 MarkdownRenderer ==============
const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  // @ts-expect-error style entry is runtime-only in x-markdown-vue
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value =
    (mod as any).MarkdownRenderer ?? (mod as any).default ?? mod;
});

const MyEchartsBlock = defineComponent({
  name: 'SseReplaceEchartsBlock',
  props: {
    option: { type: Object, required: true }
  },
  setup(props) {
    const chartEl = vRef<HTMLDivElement>();
    let chart: any = null;
    let resizeObserver: ResizeObserver | null = null;

    vOnMounted(async () => {
      if (!chartEl.value) return;
      try {
        const echarts = await import('echarts');
        chart = echarts.init(chartEl.value);
        chart.setOption(props.option);
        resizeObserver = new ResizeObserver(() => chart?.resize());
        resizeObserver.observe(chartEl.value);
      } catch (e) {
        console.warn('[streaming-replace-sse] echarts init failed', e);
      }
    });

    vOnBeforeUnmount(() => {
      resizeObserver?.disconnect();
      chart?.dispose();
    });

    return () =>
      h('div', {
        ref: chartEl,
        style: 'width:100%;height:320px;margin:16px 0;'
      });
  }
});

function safeJsonParse(raw: string) {
  try {
    return { ok: true as const, value: JSON.parse(raw) };
  } catch {
    return { ok: false as const };
  }
}

const codeXRender = {
  'my-echarts': (props: any) => {
    const parsed = safeJsonParse(props.raw.content);
    if (parsed.ok) {
      return h(MyEchartsBlock, { option: parsed.value });
    }

    return h('div', { class: 'chart-loading' }, '图表数据加载中...');
  }
};

// ============== 代码围栏符号（避免模板字面量嵌套三反引号）==============
const CF = '```';

const LONG_THINKING_DETAIL = Array.from({ length: 28 }, (_, i) => {
  const area = ['青秀区', '兴宁区', '江南区', '西乡塘区', '良庆区', '邕宁区'][
    i % 6
  ];
  const factor = ['PM2.5', 'PM10', 'NO2', 'O3', 'CODMn', '氨氮'][i % 6];
  const risk = ['低', '中', '中高', '高'][i % 4];

  return [
    `推理片段 ${i + 1}：正在比对 ${area} 的 ${factor} 监测指标。`,
    `- 临时样本量：${128 + i * 17} 条`,
    `- 异常点位：${(i % 5) + 1} 个`,
    `- 风险等级：${risk}`,
    `- 处理策略：先按小时聚合，再按站点类型回填缺失值，最后校验累计总数是否仍为 175。`,
    `- 备注：这是一段专门用于拉高 Thinking 高度的假数据，观察 think 闭合标签出现后自动折叠是否会影响 BubbleList 追底。`
  ].join('\n');
}).join('\n\n');

// ============== 模拟后端：包含多种 Markdown 要素的「最终全量内容」 ==============
const FINAL_FULL_CONTENT = `<think>
正在理解问题中……用户需要查看南宁市环境监测站点综合统计，包含数据表、图表、流程图、数学公式与参考图片。

第一步：整理站点数量汇总表格。
第二步：构建 ECharts 环形图，可视化各类站点占比。
第三步：用 Mermaid 流程图描述监测数据处理流程。
第四步：给出 AQI 空气质量指数计算公式（LaTeX）。
第五步：附上南宁市区位示意图。

下面开始模拟较长的内部思考过程，用于测试 Thinking 内容很长时自动折叠造成的高度突变：

${LONG_THINKING_DETAIL}

准备就绪，开始输出……</think>

## 南宁市环境监测站点统计报告

### 一、站点数量汇总

| 监测类型 | 站点数量 | 细分说明 | 占比 |
|:---------|:-------:|:---------|-----:|
| 大气监测 | 22 | 国控 4 / 省控 8 / 市控 10 | 12.6% |
| 地表水手动站 | 18 | 邕江沿线为主 | 10.3% |
| 地表水自动站 | 18 | 实时在线 | 10.3% |
| 饮用水手动站 | 15 | 水厂取水口 | 8.6% |
| 秸秆焚烧监测 | 92 | 覆盖全市 12 个县区 | 52.6% |
| 酸雨监测 | 10 | 均匀分布 | 5.7% |
| **合计** | **175** | — | **100%** |

### 二、站点类型分布（ECharts 环形图）

${CF}my-echarts
{
  "title": { "text": "南宁市监测站点类型分布", "left": "center" },
  "tooltip": { "trigger": "item", "formatter": "{b}: {c} 个 ({d}%)" },
  "legend": { "orient": "vertical", "left": "left", "top": "middle" },
  "series": [{
    "type": "pie",
    "radius": ["40%", "70%"],
    "avoidLabelOverlap": false,
    "label": { "show": false, "position": "center" },
    "emphasis": { "label": { "show": true, "fontSize": 14, "fontWeight": "bold" } },
    "labelLine": { "show": false },
    "data": [
      { "value": 22, "name": "大气监测" },
      { "value": 36, "name": "地表水监测" },
      { "value": 15, "name": "饮用水监测" },
      { "value": 92, "name": "秸秆焚烧监测" },
      { "value": 10, "name": "酸雨监测" }
    ]
  }]
}
${CF}

### 三、监测数据处理流程（Mermaid）

${CF}mermaid
flowchart TD
  A[传感器采集原始数据] --> B{数据校验}
  B -- 通过 --> C[写入实时数据库]
  B -- 异常 --> D[触发告警通知]
  C --> E[实时看板展示]
  C --> F[历史数据归档]
  D --> G[人工复核]
  G --> B
  F --> H[统计分析报告]
  E --> I[公众发布平台]
${CF}

### 四、AQI 空气质量指数计算公式

AQI 采用分段线性插值方法：

$$AQI = \\frac{I_{hi} - I_{lo}}{C_{hi} - C_{lo}} \\times (C_p - C_{lo}) + I_{lo}$$

**参数说明：**

- $C_p$：污染物实测浓度（μg/m³）
- $C_{hi}$、$C_{lo}$：浓度分段上下断点
- $I_{hi}$、$I_{lo}$：对应 AQI 分段上下断点

各等级区间：$0 \\sim 50$ 优；$51 \\sim 100$ 良；$101 \\sim 150$ 轻度污染；$151 \\sim 200$ 中度污染。

### 五、南宁市区位示意图

![生态监测示意图](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80)

> 图：生态环境监测场景示意

### 六、综合结论

南宁市各类环境监测站点共 **175 个**，形成覆盖大气、水质、秸秆焚烧和酸雨四大领域的综合监测网络。

${Array.from({ length: 10 }, (_, i) => `**详细说明 ${i + 1}**：秸秆焚烧监测站点数量最多（92 个，占 52.6%），主要因广西农业规模大，监管需求强烈。水质监测站点合计 51 个，沿邕江、左江、右江主要水体分布。酸雨监测站点 10 个均匀覆盖全市。大气监测站 22 个中，国控/省控/市控三级网络数据实时上传国家平台，支持智能告警联动。`).join('\n\n')}
`;

// ============== 模拟后端 SSE：每次推送都是「拼接好的全量内容」 ==============
interface SSEEvent {
  content: string;
  completed: boolean;
}

function createMockSSE(
  finalContent: string,
  options: {
    onMessage: (e: SSEEvent) => void;
    onClose: () => void;
    tickMs?: number;
    charsPerTick?: number;
  }
) {
  const { onMessage, onClose, tickMs = 50, charsPerTick = 30 } = options;
  let offset = 0;
  const timer = window.setInterval(() => {
    offset = Math.min(offset + charsPerTick, finalContent.length);
    const accumulated = finalContent.slice(0, offset); // 关键：每次发出的是「累计后的完整字符串」
    const done = offset >= finalContent.length;
    onMessage({ content: accumulated, completed: done });
    if (done) {
      window.clearInterval(timer);
      onClose();
    }
  }, tickMs);
  return () => window.clearInterval(timer);
}

// ============== 组件状态 ==============
const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<BubbleListProps<MessageItem>['list']>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const mode = ref<'replace' | 'append'>('replace');
const lastEventLength = ref(0);
const eventCount = ref(0);
const virtualEnabled = ref(false);

// 速度档位 1~10（1 最慢，10 最快）
const speed = ref(4);
function speedToTiming(s: number) {
  // tickMs: 200ms (s=1) -> 20ms (s=10)
  // charsPerTick: 2 (s=1) -> 56 (s=10)
  const tickMs = Math.round(200 - (s - 1) * 20);
  const charsPerTick = Math.round(2 + (s - 1) * 6);
  return { tickMs, charsPerTick };
}

let nextKey = 0;
let stopSSE: (() => void) | null = null;

function createMessage(
  key: number,
  role: 'user' | 'ai',
  content: string
): MessageItem {
  const isUser = role === 'user';
  return {
    key,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '24px',
    avatarGap: '12px',
    shape: 'corner',
    variant: isUser ? 'outlined' : 'filled',
    noStyle: true
  };
}

function buildSeed() {
  bubbleItems.value = [];
  for (let i = 0; i < 6; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    bubbleItems.value.push(
      createMessage(
        ++nextKey,
        role,
        role === 'ai'
          ? `预热消息 ${i + 1}：用于把列表填到接近底部的状态。`
          : `用户预热消息 ${i + 1}`
      )
    );
  }
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  eventCount.value = 0;
  lastEventLength.value = 0;
  nextTick(() => bubbleListRef.value?.scrollToBottom(false));
}

function stopStreaming() {
  stopSSE?.();
  stopSSE = null;
  isStreaming.value = false;
}

function startStreaming() {
  if (isStreaming.value) return;
  stopStreaming();

  // 用户消息
  bubbleItems.value.push(
    createMessage(++nextKey, 'user', '请用 SSE 流式输出南宁市监测站点统计。')
  );

  // AI 占位消息（content 初始为空）
  bubbleItems.value.push(createMessage(++nextKey, 'ai', ''));

  isStreaming.value = true;
  eventCount.value = 0;
  let lastReceivedContent = ''; // 用于 append 模式计算 delta

  const { tickMs, charsPerTick } = speedToTiming(speed.value);
  stopSSE = createMockSSE(FINAL_FULL_CONTENT, {
    tickMs,
    charsPerTick,
    onMessage: e => {
      eventCount.value += 1;
      lastEventLength.value = e.content.length;
      const aiItem = bubbleItems.value[bubbleItems.value.length - 1];
      if (!aiItem || aiItem.role !== 'ai') return;

      if (mode.value === 'replace') {
        // ❗ 复现模式：每次 SSE 都是「全量累计内容」，前端直接整体替换
        aiItem.content = e.content;
      } else {
        // 对照模式：按 delta 增量追加（这才是 demo 库默认演示的方式）
        const delta = e.content.slice(lastReceivedContent.length);
        aiItem.content += delta;
      }
      lastReceivedContent = e.content;
    },
    onClose: () => {
      isStreaming.value = false;
    }
  });
}

function resetConversation() {
  stopStreaming();
  nextKey = 0;
  buildSeed();
}

function toggleMode() {
  if (isStreaming.value) return;
  mode.value = mode.value === 'replace' ? 'append' : 'replace';
}

function handleScrollStateChange(s: BubbleListScrollState) {
  scrollState.value = s;
}
function handleUnreadCountChange(c: number) {
  unreadCount.value = c;
}

onMounted(buildSeed);
onUnmounted(stopStreaming);
</script>

<template>
  <div class="sse-replace-demo">
    <div class="tip">
      <strong>当前接收模式：</strong>
      <span :class="`mode-tag mode-${mode}`">
        {{ mode === 'replace' ? '全量替换（复现 Bug）' : '增量追加（正常）' }}
      </span>
      <span class="hint">
        全量替换模式下，预期 BubbleList 应当持续贴底，但实际可能不会自动滚动。
      </span>
    </div>

    <div class="toolbar">
      <el-button
        size="small"
        type="primary"
        plain
        :disabled="isStreaming"
        @click="startStreaming"
      >
        开始模拟 SSE 流
      </el-button>
      <el-button
        size="small"
        type="warning"
        plain
        :disabled="!isStreaming"
        @click="stopStreaming"
      >
        停止
      </el-button>
      <el-button
        size="small"
        type="info"
        plain
        :disabled="isStreaming"
        @click="toggleMode"
      >
        切换为「{{ mode === 'replace' ? '增量追加' : '全量替换' }}」模式
      </el-button>
      <el-button size="small" type="danger" plain @click="resetConversation">
        重置会话
      </el-button>
      <div class="speed-control">
        <span class="speed-label">输出速度</span>
        <el-slider
          v-model="speed"
          :min="1"
          :max="10"
          :step="1"
          :disabled="isStreaming"
          show-stops
          style="width: 180px"
        />
        <span class="speed-hint">{{
          speed <= 3 ? '慢（看清过程）' : speed >= 8 ? '快（接近真实）' : '中'
        }}</span>
      </div>
    </div>

    <div class="status-row">
      <div class="chip">
        滚动状态：<strong :class="`s-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="chip">
        未读：<strong>{{ unreadCount }}</strong>
      </div>
      <div class="chip">
        SSE 事件数：<strong>{{ eventCount }}</strong>
      </div>
      <div class="chip">
        最后事件 content 长度：<strong>{{ lastEventLength }}</strong>
      </div>
      <div class="chip">
        流式状态：<strong>{{ isStreaming ? '进行中' : '空闲' }}</strong>
      </div>
      <div class="chip switch-chip">
        虚拟列表：
        <el-switch
          v-model="virtualEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
    </div>

    <div class="stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :virtual="virtualEnabled"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #header="{ item }">
          <Thinking
            v-if="
              item.role === 'ai' &&
              (parseThink(item.content).thinking ||
                parseThink(item.content).status === 'thinking')
            "
            class="message-thinking"
            :content="parseThink(item.content).thinking"
            :status="
              parseThink(item.content).status === 'thinking'
                ? 'thinking'
                : 'end'
            "
            auto-collapse
            max-width="100%"
          />
        </template>
        <template #content="{ item }">
          <template v-if="item.role === 'ai'">
            <!-- 正文：用 Markdown 渲染 -->
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer && parseThink(item.content).body"
              :markdown="parseThink(item.content).body"
              :code-x-render="codeXRender"
              :enable-mermaid="true"
              :enable-animate="isStreaming"
            />
            <span
              v-else-if="
                !parseThink(item.content).body &&
                parseThink(item.content).status !== 'thinking'
              "
              style="color: #999"
              >正在等待回复...</span
            >
          </template>
          <template v-else>
            <span class="user-msg-text">{{ item.content }}</span>
          </template>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sse-replace-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.tip {
  padding: 12px 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  font-size: 13px;
  color: #92400e;
  line-height: 1.7;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mode-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
  &.mode-replace {
    background: #fecaca;
    color: #991b1b;
  }
  &.mode-append {
    background: #bbf7d0;
    color: #166534;
  }
}
.hint {
  color: #78350f;
  font-size: 12px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.speed-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  padding: 0 12px;
  height: 28px;
  border-radius: 999px;
  background: #f1f5f9;
}
.speed-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}
.speed-hint {
  font-size: 12px;
  color: #64748b;
  min-width: 64px;
}
.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
  strong {
    color: #0f172a;
    font-size: 13px;
    &.s-at_bottom {
      color: #16a34a;
    }
    &.s-scrolled_up {
      color: #d97706;
    }
    &.s-has_new_messages {
      color: #dc2626;
    }
  }
}
.stage {
  min-height: 520px;
  height: 520px;
  padding: 10px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
}
.stage :deep(.elx-bubble-list) {
  width: 100%;
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}
.switch-chip {
  padding-right: 8px;
}
.message-thinking {
  margin-bottom: 8px;
}
.chart-loading {
  margin: 16px 0;
  padding: 12px;
  border: 1px dashed #dbeafe;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}
.user-msg-text {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.5;
}
</style>
