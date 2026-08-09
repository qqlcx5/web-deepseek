# Thinking 思考过程

## 介绍

`Thinking` 是一个用于展示思考中状态的组件，支持 **状态管理** 、**内容展开/收起** 和 **自定义样式**。通过不同状态（开始/思考中/完成/错误/取消）的视觉反馈，帮助用户直观理解AI的思考流程。组件内置过渡动画，提供灵活的扩展插槽，适合在智能对话、数据分析等场景中使用。

此组件可以和 `BubbleList` 等组件一起使用，以实现更丰富的交互体验。

### 基本使用

## 代码示例

### autoCollapse

```vue
<docs>
---
title: autoCollapse 属性
---

自动收起属性，当组件 `status` 状态变成 `end` 时，自动收起。该属性默认为 `false`。
</docs>

<script setup lang="ts">
import type { ThinkingStatus } from 'vue-element-plus-x/types/Thinking';

const statusValue = ref<ThinkingStatus>('thinking');
</script>

<template>
  <el-radio-group v-model="statusValue" style="margin-bottom: 12px">
    <el-radio-button value="thinking">
      thinking
    </el-radio-button>
    <el-radio-button value="end">
      end
    </el-radio-button>
  </el-radio-group>

  <Thinking
    :status="statusValue"
    auto-collapse
    content="欢迎使用 Element-Plus-X"
    button-width="250px"
    max-width="100%"
  />
</template>

```

### base

```vue
<docs>
---
title: 基础使用
---

最基础的集成方式
</docs>

<template>
  <Thinking />
</template>

```

### color

```vue
<docs>
---
title: color 和 backgroundColor
---

通过 `color` 和 `backgroundColor` 来快速设置内容区域的背景颜色和字体颜色。类型为 `string`，意味着可以使用 `css` 的颜色值。
</docs>

<template>
  <Thinking
    content="欢迎使用 Element-Plus-X 🍉🍉🍉"
    color="#fff"
    background-color="linear-gradient(to bottom right, rgba(190, 126, 246, 1), rgba(95, 13, 245, 1), rgba(186, 74, 227, 1))"
  />
</template>

```

### content

```vue
<docs>
---
title: content 属性
---

通过 `content` 属性可以设置内容展示
</docs>

<script setup lang="ts"></script>

<template>
  <div>
    <Thinking content="欢迎使用 Element-Plus-X" />
  </div>
</template>

<style scoped lang="less"></style>

```

### disabled

```vue
<docs>
---
title: disabled 属性
---

禁用操作
</docs>

<script setup lang="ts">
const senderValue = ref(false);
</script>

<template>
  <div
    style="
      display: flex;
      gap: 10px;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
    "
  >
    <div>
      <Thinking
        v-model="senderValue"
        disabled
        content="欢迎使用 Element-Plus-X"
        status="start"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        disabled
        content="欢迎使用 Element-Plus-X"
        status="thinking"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        disabled
        content="欢迎使用 Element-Plus-X"
        status="end"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        disabled
        content="欢迎使用 Element-Plus-X"
        status="error"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        disabled
        content="欢迎使用 Element-Plus-X"
        status="cancel"
      />
    </div>
  </div>
</template>

```

### duration

```vue
<docs>
---
title: duration 属性
---

通过 `duration` 属性可以设置动画时长，类型为 `string`。默认为 `0.2s`。你可以这么设置动画时长
</docs>

<template>
  <Thinking duration="0.8s" content="欢迎使用 Element-Plus-X" />
</template>

```

### solt

```vue
<docs>
---
title: 插槽使用
---

组件提供多个自定义插槽，方便开发者自定义组件样式

- `#status-icon`: 状态图标插槽
- `#label`: 状态文字插槽
- `#arrow`: 箭头插槽
- `#content`: 内容插槽
- `#error`: 错误提示插槽
</docs>

<script setup lang="ts">
const statusValue = ref('start');
</script>

<template>
  <el-radio-group v-model="statusValue" style="margin-bottom: 12px">
    <el-radio-button value="start"> start </el-radio-button>
    <el-radio-button value="thinking"> thinking </el-radio-button>
    <el-radio-button value="end"> end </el-radio-button>
    <el-radio-button value="error"> error </el-radio-button>
    <el-radio-button value="cancel"> cancel </el-radio-button>
  </el-radio-group>

  <Thinking
    :status="statusValue"
    content="欢迎使用 Element-Plus-X"
    button-width="250px"
    max-width="100%"
  >
    <template #status-icon="{ status }">
      <span v-if="status === 'start'">😄</span>
      <span v-else-if="status === 'error'">😭</span>
      <span v-else-if="status === 'thinking'">🤔</span>
      <span v-else-if="status === 'end'">😊</span>
      <span v-else-if="status === 'cancel'">🤐</span>
    </template>

    <template #label="{ status }">
      <span v-if="status === 'start'">有什么指示嘛？</span>
      <span v-else-if="status === 'thinking'">容我想想</span>
      <span v-else-if="status === 'end'">想出来了</span>
      <span v-else-if="status === 'error'">想不出来</span>
      <span v-else-if="status === 'cancel'">中断啦</span>
    </template>

    <template #arrow>
      <span>👇</span>
    </template>

    <template #content="{ content, status }">
      <span>{{ status }}: {{ content }}</span>
    </template>

    <template #error>
      <span>抱歉，无法解决您的问题</span>
    </template>
  </Thinking>
</template>

```

### status

```vue
<docs>
---
title: status 属性
---

通过 `status` 属性设置组件的状态，一共有四个默认状态，分别是 `start`、`thinking`、`end`、`error`
</docs>

<script setup lang="ts">
const senderValue = ref(false);
</script>

<template>
  <div
    style="
      display: flex;
      gap: 10px;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
    "
  >
    <div>
      <Thinking
        v-model="senderValue"
        content="欢迎使用 Element-Plus-X"
        status="start"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        content="欢迎使用 Element-Plus-X"
        status="thinking"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        content="欢迎使用 Element-Plus-X"
        status="end"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        content="欢迎使用 Element-Plus-X"
        status="error"
      />
    </div>

    <div>
      <Thinking
        v-model="senderValue"
        content="欢迎使用 Element-Plus-X"
        status="cancel"
      />
    </div>
  </div>
</template>

<style scoped lang="less"></style>

```

### theme-overrides

```vue
<docs>
---
title: 自定义主题
---

通过 `ConfigProvider.themeOverrides` 覆盖 `Thinking` 的 `--elx-*` 变量（按钮背景、边框、内容区域等）。
</docs>

<script setup lang="ts">
import { computed, ref } from 'vue';

const enabled = ref(true);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#06b6d4',
      'border-color': 'rgba(6, 182, 212, 0.35)',
      'text-color-regular': 'rgba(15, 23, 42, 0.82)',
      'box-shadow': '0 18px 54px rgba(6, 182, 212, 0.22)'
    },
    components: {
      Thinking: {
        'thinking-trigger-bg': 'rgba(6, 182, 212, 0.10)',
        'thinking-trigger-bg-hover': 'rgba(6, 182, 212, 0.16)',
        'thinking-trigger-border-color': 'rgba(6, 182, 212, 0.45)',
        'thinking-content-wrapper-background-color':
          'linear-gradient(135deg, rgba(6, 182, 212, 0.10), rgba(99, 102, 241, 0.08))',
        'thinking-content-wrapper-color': 'rgba(15, 23, 42, 0.86)',
        'thinking-content-wrapper-width': '560px',
        'thinking-button-width': '190px'
      }
    }
  };
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>点击按钮展开/收起内容，观察主题覆写效果。</div>
      <button
        type="button"
        style="
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(0, 0, 0, 0.02);
          cursor: pointer;
        "
        @click="enabled = !enabled"
      >
        {{ enabled ? '关闭自定义主题' : '开启自定义主题' }}
      </button>
    </div>

    <ConfigProvider apply-to="self" :theme-overrides="themeOverrides">
      <div
        style="
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--elx-border-color);
          background:
            radial-gradient(
              1200px 300px at 0% 0%,
              rgba(6, 182, 212, 0.2),
              transparent 60%
            ),
            radial-gradient(
              900px 240px at 100% 10%,
              rgba(99, 102, 241, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
        "
      >
        <Thinking
          status="thinking"
          content="这里是 Thinking 的示例内容。\n开关前后会看到按钮与内容区域的“玻璃感”变化。"
          :auto-collapse="false"
        />
      </div>
    </ConfigProvider>
  </div>
</template>

```

### v-model

```vue
<docs>
---
title: v-model 属性 受控组件
---

通过 v-model 属性，我们可以设置 默认状态。
</docs>

<script setup lang="ts">
const senderValue = ref(true);
</script>

<template>
  <div>
    <Thinking v-model="senderValue" content="欢迎使用 Element-Plus-X" />
  </div>
</template>

<style scoped lang="less"></style>

```

### width

```vue
<docs>
---
title: buttonWidth 和 maxWidth
---

`buttonWidth` 和 `maxWidth` 属性，可以设置 **展开收起按钮** 和 **展开内容** 的最大宽度。两者都是 `string` 类型，意味着你可以使用 `px`、`%`、`vw`、`vh` 等单位。
</docs>

<template>
  <Thinking
    button-width="250px"
    max-width="100%"
    content="欢迎使用 Element-Plus-X"
  />
</template>

```

## API 参考

### 内容展开/收起

### 状态管理

### 状态样式

### 自动收起

### 禁用状态

### 宽度定制

### 内容颜色样式定制

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `Thinking` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#thinking)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

### 插槽定制

## 属性

| 属性名            | 类型           | 是否必填 | 默认值                   | 描述                                                                                          |
| ----------------- | -------------- | -------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| `content`         | String         | 否       | `''`                     | 显示的主要内容文本 无打字效果，由接口返回决定                                                 |
| `modelValue`      | Boolean        | 否       | `true`                   | 通过 v-model 绑定展开状态，默认为展开状                                                       |
| `status`          | ThinkingStatus | 否       | `'start'`                | 组件状态：`start`（开始）/`thinking`（思考中）/`end`（完成）/`error`（错误）/`cancel`（取消） |
| `autoCollapse`    | Boolean        | 否       | `false`                  | 是否在组件状态变为 `end` 时自动收起内容区域                                                   |
| `disabled`        | Boolean        | 否       | `false`                  | 是否禁用组件交互                                                                              |
| `buttonWidth`     | String         | 否       | `'160px'`                | 触发按钮宽度                                                                                  |
| `duration`        | String         | 否       | `'0.2s'`                 | 过渡动画时长                                                                                  |
| `maxWidth`        | String         | 否       | `'500px'`                | 内容区域最大宽度                                                                              |
| `backgroundColor` | String         | 否       | `'#fcfcfc'`              | 内容区域背景色                                                                                |
| `color`           | String         | 否       | `'var(--el-color-info)'` | 内容文字颜色                                                                                  |

## 事件

| 事件名    | 参数                                    | 类型     | 描述                     |
| --------- | --------------------------------------- | -------- | ------------------------ |
| `@change` | \{value:boolean,status:ThinkingStatus\} | Function | 展开状态或状态变化时触发 |

## 插槽

| 插槽名         | 参数          | 类型 | 描述                         |
| -------------- | ------------- | ---- | ---------------------------- |
| `#status-icon` | \{ status \}  | Slot | 自定义状态图标               |
| `#label`       | \{ status \}  | Slot | 自定义按钮文字               |
| `#arrow`       | -             | Slot | 自定义箭头图标               |
| `#content`     | \{ content \} | Slot | 自定义内容区域（非错误状态） |
| `#error`       | -             | Slot | 自定义错误信息内容展示       |

## 功能特性

1. **多状态管理**
   - 支持`start`/`thinking`/`end`/`error`/`cancel`五种状态，自动切换对应图标和文案
   - 错误状态时强制显示固定错误提示

2. **交互反馈**
   - 展开/收起内容区域时带有平滑滑动动画
   - 按钮点击反馈支持自定义过渡效果

3. **样式定制**
   - 通过CSS变量控制尺寸、颜色等视觉属性
   - 提供完整的插槽扩展能力，支持自定义图标和内容

4. **智能行为**
   - 状态切换时自动调整展开状态
   - 禁用状态时保持视觉反馈但阻断交互
---

