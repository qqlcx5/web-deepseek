# ThoughtChain 思维链

## 介绍

`ThoughtChain` 是一个用于展示AI思考过程的时间轴组件，支持 **状态管理**、**内容展开/收起** 和 **动态样式配置**。通过可视化的思考步骤序列，帮助用户直观理解复杂逻辑流程。组件内置多种状态反馈、过渡动画和扩展插槽，适用于智能对话、数据分析、流程引导等场景。

## 代码示例

### 基础用法

## 代码示例

### base

```vue
<docs>
---
title: thinkingItems 基础使用
---

通过 `thinkingItems` 传入一个数组控制渲染。

::: info
`id` 为必传字段。你还可以通过 `rowKey` 设置唯一标识的名称，默认为 `id`。
:::
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';

interface DataType {
  codeId: string;
  title?: string;
  thinkTitle?: string;
  thinkContent?: string;
  status?: 'success' | 'loading' | 'error';
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    codeId: '1',
    id: '1',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    title: '成功-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    codeId: '2',
    id: '2',
    title: '加载中-主标题',
    status: 'loading',
    isCanExpand: true,
    isDefaultExpand: false,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    codeId: '3',
    id: '3',
    title: '失败-主标题',
    status: 'error',
    isCanExpand: true,
    isDefaultExpand: false,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    codeId: '4',
    id: '4',
    title: '失败-主标题',
    status: 'error',
    isCanExpand: true,
    isDefaultExpand: true,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  }
];
</script>

<template>
  <ThoughtChain :thinking-items="thinkingItems" row-key="codeId" />
</template>

<style scoped lang="less"></style>

```

### dot-size

```vue
<docs>
---
title: dotSize 属性
---

默认值是 `default`，可选值有 `small`、`default`、`large`。
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';

interface DataType {
  id: string;
  title?: string;
  thinkTitle?: string;
  thinkContent?: string;
  status?: 'success' | 'loading' | 'error';
  hideTitle?: boolean;
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    id: '1',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    title: '成功-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    id: '2',
    title: '加载中-主标题',
    status: 'loading',
    isCanExpand: true,
    isDefaultExpand: false,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    id: '3',
    title: '失败-主标题',
    status: 'error',
    isCanExpand: true,
    isDefaultExpand: false,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    id: '4',
    hideTitle: true,
    status: 'loading',
    isCanExpand: true,
    isDefaultExpand: true,
    thinkTitle: '隐藏主标题，思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(10)
  }
];
</script>

<template>
  <ThoughtChain :thinking-items="thinkingItems" dot-size="small" />
  <ThoughtChain :thinking-items="thinkingItems" dot-size="large" />
</template>

<style scoped lang="less"></style>

```

### handle-expand

```vue
<docs>
---
title: handleExpand 事件
---

通过 handleExpand 事件，可以获取到当前展开的节点数据。
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';

interface DataType {
  codeId: string;
  self_title?: string;
  self_thinkTitle?: string;
  self_thinkContent?: string;
  status?: 'success' | 'loading' | 'error';
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    codeId: '1',
    id: '1',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    self_title: '成功-主标题',
    self_thinkTitle: '思考内容标题-默认展开',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '2',
    id: '2',
    self_title: '加载中-主标题',
    status: 'loading',
    isCanExpand: true,
    isDefaultExpand: false,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '3',
    id: '3',
    self_title: '失败-主标题',
    status: 'error',
    isCanExpand: true,
    isDefaultExpand: false,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '4',
    id: '4',
    self_title: '谢谢-主标题',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  }
];

function handleExpand(item: ThoughtChainItemProps<DataType>) {
  console.log(item);
}
</script>

<template>
  <ThoughtChain
    :thinking-items="thinkingItems"
    row-key="codeId"
    title-key="self_title"
    think-title-key="self_thinkTitle"
    think-content-key="self_thinkContent"
    @handle-expand="handleExpand"
  />
</template>

<style scoped lang="less">
.is-loading {
  animation: spin 1s infinite linear;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

```

### key-label

```vue
<docs>
---
title: titleKey、thinkTitleKey、thinkContentKey 属性
---

通过 `titleKey`、`thinkTitleKey`、`thinkContentKey` 属性，可以自定义节点的：标题、思考内容标题、思考内容 的 key 名称。
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';

interface DataType {
  codeId: string;
  self_title?: string;
  self_thinkTitle?: string;
  self_thinkContent?: string;
  status?: 'success' | 'loading' | 'error';
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    codeId: '1',
    id: '1',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    self_title: '成功-主标题',
    self_thinkTitle: '思考内容标题-默认展开',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '2',
    id: '2',
    self_title: '加载中-主标题',
    status: 'loading',
    isCanExpand: true,
    isDefaultExpand: false,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '3',
    id: '3',
    self_title: '失败-主标题',
    status: 'error',
    isCanExpand: true,
    isDefaultExpand: false,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '4',
    id: '4',
    self_title: '谢谢-主标题',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  }
];
</script>

<template>
  <ThoughtChain
    :thinking-items="thinkingItems"
    row-key="codeId"
    title-key="self_title"
    think-title-key="self_thinkTitle"
    think-content-key="self_thinkContent"
  />
</template>

<style scoped lang="less"></style>

```

### line-gradient

```vue
<docs>
---
title: lineGradient 属性
---

启用线条颜色渐变，但不支持自定义颜色。当数组大于 1 时有效
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';

interface DataType {
  id: string;
  title?: string;
  thinkTitle?: string;
  thinkContent?: string;
  status?: 'success' | 'loading' | 'error';
  hideTitle?: boolean;
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    id: '1',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    title: '成功-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(20)
  },
  {
    id: '2',
    status: 'loading',
    isCanExpand: true,
    title: '加载-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(20)
  },
  {
    id: '3',
    status: 'error',
    isCanExpand: true,
    title: '失败-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(20)
  },
  {
    id: '4',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    title: '成功-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(20)
  }
];
</script>

<template>
  <ThoughtChain :thinking-items="thinkingItems" line-gradient />
</template>

<style scoped lang="less"></style>

```

### max-width

```vue
<docs>
---
title: maxWidth 属性
---

设置 思维链的最大宽度，默认 '500px'。字符串类型，意味着你可以传入百分比，如 '50%'。或其他单位，甚至 css 计算宽度，如 'calc(100% - 200px)'。
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';

interface DataType {
  id: string;
  title?: string;
  thinkTitle?: string;
  thinkContent?: string;
  status?: 'success' | 'loading' | 'error';
  hideTitle?: boolean;
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    id: '1',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    title: '成功-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(20)
  }
];
</script>

<template>
  <ThoughtChain
    :thinking-items="thinkingItems"
    max-width="calc(100% - 300px)"
  />
</template>

<style scoped lang="less"></style>

```

### solt

```vue
<docs>
---
title: #icon 插槽
---

通过 `#icon` 插槽，可以自定义 不同状态的 图标。 通过 `#icon={item}` 可以获取到当前状态。
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';
import {
  CircleCloseFilled,
  Loading,
  SuccessFilled
} from '@element-plus/icons-vue';

interface DataType {
  codeId: string;
  self_title?: string;
  self_thinkTitle?: string;
  self_thinkContent?: string;
  status?: 'success' | 'loading' | 'error';
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    codeId: '1',
    id: '1',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    self_title: '成功-主标题',
    self_thinkTitle: '思考内容标题-默认展开',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '2',
    id: '2',
    self_title: '加载中-主标题',
    status: 'loading',
    isCanExpand: true,
    isDefaultExpand: false,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '3',
    id: '3',
    self_title: '失败-主标题',
    status: 'error',
    isCanExpand: true,
    isDefaultExpand: false,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  },
  {
    codeId: '4',
    id: '4',
    self_title: '谢谢-主标题',
    status: 'success',
    isCanExpand: true,
    isDefaultExpand: true,
    self_thinkTitle: '思考内容标题',
    self_thinkContent: '进行搜索文字'.repeat(10),
    thinkContent: 'Search text'.repeat(10)
  }
];
</script>

<template>
  <ThoughtChain
    :thinking-items="thinkingItems"
    row-key="codeId"
    title-key="self_title"
    think-title-key="self_thinkTitle"
    think-content-key="self_thinkContent"
  >
    <template #icon="{ item }">
      <span
        v-if="item.status === 'success'"
        style="
          font-size: 18px;
          margin-left: 7px;
          color: var(--el-color-success);
        "
      >
        <el-icon><SuccessFilled /></el-icon>
      </span>
      <span
        v-if="item.status === 'error'"
        style="font-size: 18px; margin-left: 7px; color: var(--el-color-danger)"
      >
        <el-icon><CircleCloseFilled /></el-icon>
      </span>
      <span
        v-if="item.status === 'loading'"
        style="font-size: 18px; margin-left: 7px"
      >
        <el-icon class="is-loading"><Loading /></el-icon>
      </span>
    </template>
  </ThoughtChain>
</template>

<style scoped lang="less">
.is-loading {
  animation: spin 1s infinite linear;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

```

### status-key-test

```vue
<docs>
---
title: statusKey、statusEnum 属性
---

通过 `statusKey` 、`statusEnum` 设置 状态字段 和 状态字段的对应 内置样式枚举值。

左侧 dot 节点的样式由 `statusKey` 和 `statusEnum` 配置决定。
</docs>

<script setup lang="ts">
import type { ThoughtChainItemProps } from 'vue-element-plus-x/types/ThoughtChain';

interface DataType {
  codeId: string;
  title?: string;
  thinkTitle?: string;
  thinkContent?: string;
  self_status?: 'yes' | 'no' | 'load';
}

const thinkingItems: ThoughtChainItemProps<DataType>[] = [
  {
    codeId: '1',
    id: '1',
    self_status: 'yes',
    isCanExpand: true,
    isDefaultExpand: true,
    title: '成功-主标题',
    thinkTitle: '思考内容标题-默认展开',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    codeId: '2',
    id: '2',
    title: '加载中-主标题',
    self_status: 'load',
    isCanExpand: true,
    isDefaultExpand: false,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    codeId: '3',
    id: '3',
    title: '失败-主标题',
    self_status: 'no',
    isCanExpand: true,
    isDefaultExpand: false,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  },
  {
    codeId: '4',
    id: '4',
    title: '谢谢-主标题',
    isCanExpand: true,
    isDefaultExpand: true,
    thinkTitle: '思考内容标题',
    thinkContent: '进行搜索文字'.repeat(10)
  }
];
</script>

<template>
  <ThoughtChain
    :thinking-items="thinkingItems"
    row-key="codeId"
    status-key="self_status"
    :status-enum="{
      loading: { value: 'load', type: 'warning' },
      error: { value: 'no', type: 'success' },
      success: { value: 'yes', type: 'danger' }
    }"
  >
    <template #icon="{ item }">
      <span>{{ console.log(item) }}</span>
    </template>
  </ThoughtChain>
</template>

<style scoped lang="less"></style>

```

## API 参考

### 尺寸大小控制

### 最大宽度控制

### 自定义标题和内容

### 扩展插槽

### 手动控制展开状态

<!-- <demo src="./demos/status-key-test.vue"></demo> -->

## 属性

- **组件属性**

| 参数名            | 类型                          | 默认值         | 描述                 |
| ----------------- | ----------------------------- | -------------- | -------------------- |
| `thinkingItems`   | `Array<ThoughtChainItemBase>` | []             | 思考项数组           |
| `dotSize`         | 'small'/'default'/'large'     | 'default'      | 时间轴点大小         |
| `maxWidth`        | string                        | '600px'        | 最大宽度             |
| `lineGradient`    | boolean                       | false          | 是否启用线条颜色渐变 |
| `rowKey`          | string                        | 'id'           | 数据项唯一标识字段   |
| `titleKey`        | string                        | 'title'        | 标题字段名           |
| `thinkTitleKey`   | string                        | 'thinkTitle'   | 思考标题字段名       |
| `thinkContentKey` | string                        | 'thinkContent' | 思考内容字段名       |

- **ThoughtChainItemBase** 数组子项的类型定义

| 参数名            | 类型                                | 默认值      | 描述                           |
| ----------------- | ----------------------------------- | ----------- | ------------------------------ |
| `id`              | `string \| number`                  | **必填**    | 节点唯一标识                   |
| `title`           | `string`                            | `undefined` | 主标题                         |
| `thinkTitle`      | `string`                            | `undefined` | 折叠面板标题（思考标题）       |
| `thinkContent`    | `string`                            | `undefined` | 展开时显示的详细内容           |
| `status`          | `'loading' \| 'error' \| 'success'` | `undefined` | 节点状态标识（影响图标和颜色） |
| `isCanExpand`     | `boolean`                           | `undefined` | 是否允许展开节点内容           |
| `isDefaultExpand` | `boolean`                           | `undefined` | 是否默认展开节点内容           |

## 事件

| 事件名         | 参数类型                         | 说明               |
| -------------- | -------------------------------- | ------------------ |
| `handleExpand` | `item: ThoughtChainItemProps<T>` | 展开状态变化时触发 |

## 插槽

| 插槽名  | 作用域参数 | 说明               |
| ------- | ---------- | ------------------ |
| `#icon` | \{ item \} | 自定义时间轴点图标 |

## 核心特性

1. **多状态可视化**
   - 支持`loading`/`success`/`error`
   - 自动切换加载动画、图标和颜色反馈

2. **动态内容管理**
   - 支持内容折叠展开（可配置默认展开项）

3. **灵活样式配置**
   - 自定义时间轴宽度、点大小
   - 动态颜色渐变线条
   - CSS变量主题覆盖

4. **响应式交互**
   - 平滑的过渡动画
   - 支持动态增删思考项
   - 展开状态双向绑定
---

