# Prompts 提示词

## 介绍

`Prompts` 用于显示一组与当前上下文相关的预定义的问题或建议。

### 基本使用

## 代码示例

### base

```vue
<docs>
---
title: 基础用法
---

快速创建一组提示集列表。默认超出不会换行，且隐藏滚动条。
</docs>

<script setup lang="ts">
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts';

const items = ref<PromptsItemsProps[]>([
  {
    key: '1',
    label: '🐛 提示集组件标题',
    description: '描述信息'.repeat(3)
  },
  {
    key: '2',
    label: '🐛 提示集组件标题'
  },
  {
    key: '3',
    label: '🐛 提示集组件标题'
  },
  {
    key: '4',
    label: '🐛 提示集组件标题'
  }
]);

function handleItemClick(item: PromptsItemsProps) {
  ElMessage.success(`点击了 ${item.key}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Prompts
      title="🐵 提示集组件标题"
      :items="items"
      @item-click="handleItemClick"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### customized

```vue
<docs>
---
title: 定制化提示集的样式

---

通过 `style` 属性来定制化提示集的样式。

通过 `itemStyle` 和 `itemHoverStyle` 还有 `itemActiveStyle` 属性来定制化单个提示集的样式。
</docs>

<script setup lang="ts">
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts';

const items = ref<PromptsItemsProps[]>([
  {
    key: '1',
    label: '🐛 提示集组件标题',
    description: '描述信息'.repeat(3),
    itemStyle: { width: 'calc(50% - 6px)', transition: 'background .3s' },
    itemHoverStyle: {
      background:
        'linear-gradient(to bottom right, rgba(223, 59, 61, 0.9), rgba(203, 52, 244, 0.9)'
    },
    itemActiveStyle: {
      background:
        'linear-gradient(to bottom right, rgba(58, 32, 164, 0.9), rgba(254, 166, 223, 0.9)'
    }
  },
  {
    key: '2',
    label: '🐛 我是被禁用的',
    disabled: true,
    itemStyle: { width: 'calc(50% - 6px)', transition: 'background .3s' },
    itemHoverStyle: {
      background:
        'linear-gradient(to bottom right, rgba(223, 59, 61, 0.9), rgba(203, 52, 244, 0.9)'
    },
    itemActiveStyle: {
      background:
        'linear-gradient(to bottom right, rgba(58, 32, 164, 0.9), rgba(254, 166, 223, 0.9)'
    }
  },
  {
    key: '3',
    label: '🐛 单个禁用控制更准确',
    disabled: true,
    itemStyle: { width: 'calc(50% - 6px)', transition: 'background .3s' },
    itemHoverStyle: {
      background:
        'linear-gradient(to bottom right, rgba(223, 59, 61, 0.9), rgba(203, 52, 244, 0.9)'
    },
    itemActiveStyle: {
      background:
        'linear-gradient(to bottom right, rgba(58, 32, 164, 0.9), rgba(254, 166, 223, 0.9)'
    }
  },
  {
    key: '4',
    label: '🐛 提示集组件标题',
    itemStyle: { width: 'calc(50% - 6px)', transition: 'background .3s' },
    itemHoverStyle: {
      background:
        'linear-gradient(to bottom right, rgba(223, 59, 61, 0.9), rgba(203, 52, 244, 0.9)'
    },
    itemActiveStyle: {
      background:
        'linear-gradient(to bottom right, rgba(58, 32, 164, 0.9), rgba(254, 166, 223, 0.9)'
    }
  }
]);

function handleItemClick(item: PromptsItemsProps) {
  ElMessage.success(`点击了 ${item.key}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Prompts
      title="🐵 提示集组件标题"
      :items="items"
      wrap
      :style="{
        width: '300px',
        padding: '12px',
        borderRadius: '8px',
        background:
          'linear-gradient(to bottom right, rgba(237, 43, 114, 0.9), rgba(223, 67, 62, 0.9)'
      }"
      @item-click="handleItemClick"
    />
  </div>
</template>

<style scoped lang="less">
:deep(.elx-prompts) {
  .elx-prompts__title {
    color: #fff;
    font-size: 16px;
    font-weight: 700;
  }
}
</style>

```

### disabled

```vue
<docs>
---
title: 禁用状态
---

通过 `disabled` 属性快速禁用提示集组件，点击事件将会失效。注意是控制单个提示集上，才生效。
</docs>

<script setup lang="ts">
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts';

const items = ref<PromptsItemsProps[]>([
  {
    key: '1',
    label: '🐛 提示集组件标题',
    description: '描述信息'.repeat(3)
  },
  {
    key: '2',
    label: '🐛 我是被禁用的',
    disabled: true
  },
  {
    key: '3',
    label: '🐛 单个禁用控制更准确',
    disabled: true
  },
  {
    key: '4',
    label: '🐛 提示集组件标题'
  }
]);

function handleItemClick(item: PromptsItemsProps) {
  ElMessage.success(`点击了 ${item.key}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Prompts
      title="🐵 提示集组件标题"
      :items="items"
      @item-click="handleItemClick"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### nested

```vue
<docs>
---
title: 基础用法
---

快速创建一组提示集列表。默认超出不会换行，且隐藏滚动条。
</docs>

<script setup lang="ts">
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts';

const items = ref<PromptsItemsProps[]>([]);

onMounted(() => {
  for (let index = 0; index < 3; index++) {
    items.value.push({
      key: index,
      label: `🐠 主标题 ${index}`,
      description: `描述 ${index}`,
      // icon: h(InfoFilled, { style: { color: '#409EFF' } }),
      // icon: 'ancient-gate-fill',
      disabled: false,
      itemStyle: {
        width: `calc(100% / ${3} - 43px)`,
        backgroundImage: `linear-gradient(137deg, #e5f4ff 0%, #efe7ff 100%)`
      },
      itemHoverStyle: {
        cursor: 'unset'
        // background: '#409EFF',
        // color: '#fff',
      },
      // itemActiveStyle: {
      //   // background: 'red',
      //   // color: '#fff',
      // },
      children: [
        {
          key: `${index}-1`,
          label: `🐛 子标题 ${index}-1`,
          description: `描述 ${index}`,
          disabled: false,
          itemStyle: {
            backgroundImage: `linear-gradient(137deg, #e5f4ff 0%, #efe7ff 100%)`,
            border: '1px solid #FFF'
          },
          itemHoverStyle: {
            cursor: 'unset'
          },
          children: [
            {
              key: `${index}-1-1`,
              label: `🐛 孙子标题 ${index}-1-1`,
              description: `描述 ${index}`,
              disabled: false,
              itemStyle: {
                background: 'rgba(255,255,255,0.45)',
                border: '1px solid #FFF'
              }
            },
            {
              key: `${index}-1-2`,
              label: `🐛 孙子标题 ${index}-1-1`,
              description: `描述 ${index}`,
              disabled: false,
              itemStyle: {
                background: 'rgba(255,255,255,0.45)',
                border: '1px solid #'
              }
            },
            {
              key: `${index}-1-3`,
              label: `🐛 孙子标题 ${index}-1-1`,
              description: `描述 ${index}`,
              disabled: false,
              itemStyle: {
                background: 'rgba(255,255,255,0.45)',
                border: '1px solid #FFF'
              }
            }
          ]
        },
        {
          key: `${index}-2`,
          label: `🐛 子标题 ${index}-2`,
          description: `描述 ${index}`,
          disabled: false,
          itemStyle: {
            background: 'rgba(255,255,255,0.45)',
            border: '1px solid #FFF'
          }
        },
        {
          key: `${index}-3`,
          label: `🐛 子标题 ${index}-3`,
          description: `描述 ${index}`,
          disabled: false,
          itemStyle: {
            background: 'rgba(255,255,255,0.45)',
            border: '1px solid #FFF'
          }
        }
      ]
    });
  }
});

function handleItemClick(item: PromptsItemsProps) {
  ElMessage.success(`点击了 ${item.key}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Prompts
      title="🐛 提示集组件标题"
      :items="items"
      wrap
      @item-click="handleItemClick"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### responsive

```vue
<docs>
---
title: 响应式宽度

---

配合 `wrap` 与 `styles` 固定宽度展示。 注意是作用在 `PromptsItem` 上结合使用才会生效。单独作用方便更定制化。
</docs>

<script setup lang="ts">
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts';

const items = ref<PromptsItemsProps[]>([
  {
    key: '1',
    label: '🐛 提示集组件标题',
    description: '描述信息'.repeat(3),
    itemStyle: { width: 'calc(50% - 6px)' }
  },
  {
    key: '2',
    label: '🐛 我是被禁用的',
    disabled: true,
    itemStyle: { width: 'calc(50% - 6px)' }
  },
  {
    key: '3',
    label: '🐛 单个禁用控制更准确',
    disabled: true,
    itemStyle: { width: 'calc(50% - 6px)' }
  },
  {
    key: '4',
    label: '🐛 提示集组件标题',
    itemStyle: { width: 'calc(50% - 6px)' }
  }
]);

function handleItemClick(item: PromptsItemsProps) {
  ElMessage.success(`点击了 ${item.key}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Prompts
      title="🐵 提示集组件标题"
      :items="items"
      wrap
      @item-click="handleItemClick"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### vertical

```vue
<docs>
---
title: 纵向展示
---

使用 `vertical` 属性，控制 `Prompts` 展示方向。注意这个是作用在整个 `Prompts` 组件上，而不是单个 `PromptsItem` 上。
</docs>

<script setup lang="ts">
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts';

const items = ref<PromptsItemsProps[]>([
  {
    key: '1',
    label: '🐛 提示集组件标题',
    description: '描述信息'.repeat(3)
  },
  {
    key: '2',
    label: '🐛 我是被禁用的',
    disabled: true
  },
  {
    key: '3',
    label: '🐛 单个禁用控制更准确',
    disabled: true
  },
  {
    key: '4',
    label: '🐛 提示集组件标题'
  }
]);

function handleItemClick(item: PromptsItemsProps) {
  ElMessage.success(`点击了 ${item.key}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Prompts
      title="🐵 提示集组件标题"
      :items="items"
      vertical
      @item-click="handleItemClick"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### wrap

```vue
<docs>
---
title: 换行展示
---

使用 `wrap` 属性，控制 `Prompts` 超出区域长度时是否可以换行。
</docs>

<script setup lang="ts">
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts';

const items = ref<PromptsItemsProps[]>([
  {
    key: '1',
    label: '🐛 提示集组件标题',
    description: '描述信息'.repeat(3)
  },
  {
    key: '2',
    label: '🐛 我是被禁用的',
    disabled: true
  },
  {
    key: '3',
    label: '🐛 单个禁用控制更准确',
    disabled: true
  },
  {
    key: '4',
    label: '🐛 提示集组件标题'
  }
]);

function handleItemClick(item: PromptsItemsProps) {
  ElMessage.success(`点击了 ${item.key}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Prompts
      title="🐵 提示集组件标题"
      :items="items"
      wrap
      @item-click="handleItemClick"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

## API 参考

### 禁用状态

### 垂直排列

### 可换行

### 响应式宽度

### 定制化样式

### 嵌套组合

## 属性

| 属性名     | 类型                  | 是否必填 | 默认值  | 描述                                                                 |
| ---------- | --------------------- | -------- | ------- | -------------------------------------------------------------------- |
| `title`    | `string`              | 否       | `''`    | 提示集的主标题文本内容                                               |
| `items`    | `PromptsItemsProps[]` | 否       | `[]`    | 提示项数组，每个元素包含标签、图标、描述等信息（具体结构见下方说明） |
| `wrap`     | `boolean`             | 否       | `false` | 是否允许提示项自动换行（仅水平排列时生效）                           |
| `vertical` | `boolean`             | 否       | `false` | 是否垂直排列提示项（垂直模式下布局方向为列排列）                     |
| `style`    | `CSSProperties`       | 否       | `{}`    | 组件容器的自定义样式（直接作用于最外层`div.elx-prompts`）            |

**`PromptsItemsProps` 结构说明**（单个提示项属性）：

```typescript
interface PromptsItemsProps {
  key: string | number; // 唯一标识（用于状态关联）
  label?: string; // 提示项标签文本
  icon?: ComponentVNode; // 提示项图标（Vue组件形式）
  description?: string; // 提示项描述文本
  disabled?: boolean; // 是否禁用（禁用时不响应交互）
  itemStyle?: CSSProperties; // 提示项自定义基础样式
  itemHoverStyle?: CSSProperties; // 提示项悬停状态自定义样式
  itemActiveStyle?: CSSProperties; // 提示项激活状态自定义样式
  children?: PromptsItemsProps[]; // 子提示项数组（用于嵌套展示）
}
```

## 事件

| 事件名       | 参数                        | 类型     | 描述                             |
| ------------ | --------------------------- | -------- | -------------------------------- |
| `@itemClick` | `(item: PromptsItemsProps)` | Function | 当某个提示集被点击时触发的事件。 |

## 插槽

| 插槽名         | 参数                          | 类型   | 描述                                                                         |
| -------------- | ----------------------------- | ------ | ---------------------------------------------------------------------------- |
| `#title`       | -                             | `Slot` | 自定义提示集标题内容（若同时设置`title`属性，插槽内容会覆盖属性文本）        |
| `#icon`        | `{ item: PromptsItemsProps }` | `Slot` | 自定义提示项的图标内容（接收当前提示项`item`参数，可覆盖`item.icon`）        |
| `#label`       | `{ item: PromptsItemsProps }` | `Slot` | 自定义提示项的标签内容（接收当前提示项`item`参数，可覆盖`item.label`）       |
| `#description` | `{ item: PromptsItemsProps }` | `Slot` | 自定义提示项的描述内容（接收当前提示项`item`参数，可覆盖`item.description`） |

## 功能特性

1. **多维度内容展示**：支持通过`items`属性配置标签、图标、描述等基础信息，同时提供`label`/`icon`/`description`插槽实现内容高度自定义。
2. **灵活布局控制**：通过`vertical`属性切换垂直/水平排列模式，`wrap`属性控制水平排列时的自动换行能力，适配不同场景布局需求。
3. **交互状态反馈**：内置悬停（背景色变浅）和激活（背景色加深）状态样式，支持通过`itemHoverStyle`/`itemActiveStyle`自定义状态样式，提升交互体验。
4. **禁用状态支持**：单个提示项可通过`item.disabled`属性禁用，禁用状态下不响应点击事件且背景色变灰，明确提示不可操作。
5. **嵌套层级展示**：支持通过`item.children`配置子提示项，组件自动递归渲染嵌套结构，满足多级分类或关联提示的展示需求。6.**细粒度样式定制**：支持通过`style`属性控制组件整体样式，通过`itemStyle`控制单个提示项基础样式，支持状态样式单独配置（`itemHoverStyle`/`itemActiveStyle`）。
---

