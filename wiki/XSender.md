# XSender 输入发送框

## 介绍

`XSender` 这个组件内置了**输入框**、**标签选择**、**指令弹窗**、**提及用户**等场景智能对话的场景功能。

⚠️ 插件版本需要大于 `1.3.98` 版本，之前旧版本插件名为 `EditorSender` ，其中API 有很大的使用差异，需要注意。

### 基础用法

## 代码示例

### action-list

```vue
<docs>
---
title: 操作列表插槽
---

通过 `#action-list` 插槽用于自定义输入框的操作列表内容。

::: info
当你使用 `#action-list` 插槽时，会隐藏内置的输入框的操作按钮。你可以通过和 `组件实例方法` 相结合，实现更丰富的操作。
:::
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import {
  Delete,
  Promotion
} from '@element-plus/icons-vue';

const senderRef = ref<InstanceType<typeof XSender>>();

function handleDelete() {
  senderRef.value?.clear();
}

function handleSubmit() {
  console.log(senderRef.value?.getModelValue());
  handleDelete();
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XSender
      ref="senderRef"
      variant="updown"
    >
      <!-- 自定义 操作列表插槽 -->
      <template #action-list>
        <div style="display: flex; align-items: center;">
          <el-button round plain color="#626aef" @click="handleDelete">
            <el-icon><Delete /></el-icon>
          </el-button>
          <el-button round plain color="#626aef" @click="handleSubmit">
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
      </template>
    </XSender>
  </div>
</template>

```

### auto-focus

```vue
<docs>
---
title: 提示语
---

可以通过 `auto-focus` 设置输入框自动聚焦。
</docs>

<template>
  <XSender placeholder="自动聚焦" auto-focus />
</template>

```

### basic

```vue
<docs>
---
title: 基本使用
---

这是一个`XSender` 输入框，最简单的使用例子。
</docs>

<template>
  <XSender />
</template>

```

### befor-tip

```vue
<docs>
---
title: 前置提示词
---

可以通过 `showTip` 唤起前置提示词。
使用 `closeTip` 可以关闭前置提示词。
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import { reactive, ref } from 'vue';

const senderRef = ref<InstanceType<typeof XSender>>();

const tipConfig = reactive({
  offsetTop: 0
});

function onOpen() {
  senderRef.value?.showTip({
    text: '图像生成',
    dialogText: '点击退出技能'
  });
}

function onClose() {
  senderRef.value?.closeTip();
}
</script>

<template>
  <div style="margin-bottom: 20px">
    <el-button type="primary" @click="onOpen"> 打开前置标签 </el-button>
    <el-button type="primary" @click="onClose"> 关闭前置标签 </el-button>
  </div>
  <div style="margin-bottom: 20px">
    <span>前置标签状态：{{ senderRef?.senderState.tipShow }}</span>
  </div>
  <XSender ref="senderRef" :tip-config="tipConfig" />
</template>

```

### custom-style

```vue
<docs>
---
title: 自定义输入框样式
---
通过 `customStyle` 方便对输入框的样式透传，你可以设置 `maxHeight` 来限制输入框的高度。这样实现在一定的高度下出现滚动条。
</docs>

<template>
  <XSender variant="updown" :custom-style="{ maxHeight: '200px' }"></XSender>
</template>

```

### footer

```vue
<docs>
---
title: 底部插槽
---

通过 `#footer` 插槽设置输入框 底部内容
</docs>

<template>
  <XSender>
    <!-- 自定义 底部插槽 -->
    <template #footer>
      <div
        style="
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
          "
      >
        自定义底部内容
      </div>
    </template>
  </XSender>
</template>

```

### header

```vue
<docs>
---
title: 头部插槽
---

通过 `#header` 插槽用于自定义输入框的头部内容，还可以通过 `headerAnimationTimer` 属性设置头部动画时间。
</docs>

<script setup lang="ts">
import { CircleClose } from '@element-plus/icons-vue';

const showHeaderFlog = ref(true);
</script>

<template>
  <XSender :header-animation-timer="300">
    <!-- 自定义 头部插槽 -->
    <template v-if="showHeaderFlog" #header>
      <div class="header-self-wrap">
        <div class="header-self-title">
          <div class="header-left">💯 欢迎使用 Element Plus X</div>
          <div class="header-right">
            <el-button @click.stop="showHeaderFlog = false">
              <el-icon><CircleClose /></el-icon>
              <span>关闭头部</span>
            </el-button>
          </div>
        </div>
        <div class="header-self-content">🦜 自定义头部内容</div>
      </div>
    </template>
    <!-- 自定义 前缀插槽 -->
    <template #prefix>
      <el-button @click="showHeaderFlog = !showHeaderFlog">打开/关闭头部</el-button>
    </template>
  </XSender>
</template>

<style scoped lang="less">
.header-self-wrap {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 200px;
  .header-self-title {
    width: 100%;
    display: flex;
    height: 30px;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
  }
  .header-self-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #626aef;
    font-weight: 600;
  }
}
</style>

```

### input

```vue
<docs>
---
title: 输入框
---

可以通过 `setInput` 插入一个输入框，提供用户填写预设内容。
使用 `setChatNode` 可以预设输入框内容（如文案、输入项等）。
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import { ref } from 'vue';

const senderRef = ref<InstanceType<typeof XSender>>();

function onSetBasic() {
  senderRef.value?.setInput('job', '请输入职业');
}
function onSetValue() {
  senderRef.value?.setInput('job', '请输入职业', '前端工程师');
}
function onSetModel() {
  senderRef.value?.setChatNode([
    [
      {
        type: 'Write',
        text: '请帮我改写以下内容：'
      },
      {
        type: 'Input',
        key: 'target',
        placeholder: '这里输入要扩写的内容'
      }
    ],
    [
      {
        type: 'Write',
        text: '扩写要求是：'
      },
      {
        type: 'Input',
        key: 'target',
        placeholder: '这里输入要扩写的重点或要求，如扩写的主题、字数要求'
      }
    ]
  ]);
}
</script>

<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="onSetBasic"> 基础插入 </el-button>
      <el-button type="primary" @click="onSetValue"> 定义默认值插入 </el-button>
      <el-button type="primary" @click="onSetModel">
        预设输入内容插入
      </el-button>
    </div>
    <XSender ref="senderRef" variant="updown" />
  </div>
</template>

```

### max-length

```vue
<docs>
---
title: 输入长度限制
---

可以通过 `maxLength` 来限制输入框的最大输入长度。

::: danger

该配置项性能开销较大 非必要情况请别设置（像豆包和文心一言都不对这块做限制不应因小失大）

:::
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import { ref } from 'vue';

const senderRef = ref<InstanceType<typeof XSender>>();

const maxLength = ref(200);
</script>

<template>
  <div style="margin-bottom: 20px;">
    <span>当前输入长度：{{ senderRef?.senderState.textLength }} / {{ maxLength }}</span>
  </div>
  <XSender
    ref="senderRef"
    :max-length="maxLength"
    placeholder="输入长度限制"
  ></XSender>
</template>

```

### mention

```vue
<docs>
---
title: 提及用户
---

默认可以通过 `@` 触发提及用户选择弹窗。
可以通过 `setMention` 插入一个提及用户标签。
使用 `setChatNode` 可以预设输入框内容（如文案、提及等）。
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import { ref } from 'vue';

const senderRef = ref<InstanceType<typeof XSender>>();

const mentionConfig = ref({
  dialogTitle: '用户选择',
  callEvery: false,
  options: [
    {
      name: '用户1',
      id: 'user1'
    },
    {
      name: '用户2',
      id: 'user2'
    },
    {
      name: '用户3',
      id: 'user3'
    }
  ]
});

function onSetBasic() {
  senderRef.value?.setMention('user1');
}

function onSetModel() {
  senderRef.value?.setChatNode([
    [
      {
        type: 'Write',
        text: '这些工作任务将由'
      },
      {
        type: 'Mention',
        id: 'user1',
        name: '用户1'
      },
      {
        type: 'Write',
        text: '负责完成。'
      }
    ]
  ]);
}
</script>

<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="onSetBasic"> API插入 </el-button>
      <el-button type="primary" @click="onSetModel">
        预设输入内容插入
      </el-button>
    </div>
    <XSender
      ref="senderRef"
      variant="updown"
      :mention-config="mentionConfig"
      placeholder="敲击 @键 唤起提及用户选择"
    />
  </div>
</template>

```

### placeholder

```vue
<docs>
---
title: 提示语
---

可以通过 `placeholder` 设置输入框的提示语。
</docs>

<template>
  <XSender placeholder="💌 欢迎使用 Element-Plus-X ~" />
</template>

```

### prefix

```vue
<docs>
---
title: 前缀插槽
---

通过 `#prefix` 插槽用于自定义输入框的前缀内容。
</docs>

<template>
  <XSender>
    <!-- 自定义 前缀插槽 -->
    <template #prefix>
      <div>
        <el-button>自定义</el-button>
        <el-button>前缀</el-button>
      </div>
    </template>
  </XSender>
</template>

```

### select

```vue
<docs>
---
title: 标签选择框
---

可以通过 `setSelect` 插入一个标签选择框提供用户选择预设内容。
使用 `showSelect` 可以基于传入的元素唤起选择弹窗。
使用 `setChatNode` 可以预设输入框内容（如文案、标签选择等）。
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import { ref } from 'vue';

const senderRef = ref<InstanceType<typeof XSender>>();

const selectConfig = ref([
  {
    dialogTitle: '图像风格',
    key: 'style',
    options: [
      { id: '1', name: '人像摄影', preview: '/logo.png' },
      { id: '2', name: '电影写真', preview: '/logo.png' },
      { id: '3', name: '中国风', preview: '/logo.png' }
    ],
    multiple: false // 是否开启多选
  }
]);

function onSetBasic() {
  senderRef.value?.setSelect('style', '1');
}

function openSelectDialog() {
  senderRef.value?.showSelect('style', document.getElementById('target')!);
}

function onSetModel() {
  senderRef.value?.setChatNode([
    [
      {
        type: 'Write',
        text: '请帮我生成一张'
      },
      {
        type: 'Select',
        key: 'style',
        id: '1',
        name: '中国风'
      },
      {
        type: 'Write',
        text: '的图片。'
      }
    ]
  ]);
}
</script>

<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="onSetBasic"> API插入 </el-button>
      <el-button id="target" type="primary" @click="openSelectDialog">
        外部唤起选择弹窗
      </el-button>
      <el-button type="primary" @click="onSetModel">
        预设输入内容插入
      </el-button>
    </div>
    <XSender ref="senderRef" variant="updown" :select-config="selectConfig" />
  </div>
</template>

```

### status

```vue
<docs>
---
title: 组件状态
---

可以通过简单属性是，实现组件的状态

::: info
- 通过 `loading` 属性，可以控制输入框是否加载中。
- 通过 `disabled` 属性，可以控制输入框是否禁用。
- 通过 `clearable` 属性，可以控制输入框是否出现删除按钮，实现清空。
:::
</docs>

<script setup lang="ts">

</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XSender loading placeholder="加载中..." />
    <XSender disabled placeholder="禁用" />
    <XSender clearable placeholder="删除按钮" />
  </div>
</template>

```

### submit-type

```vue
<docs>
---
title: 提交方式
---

可以通过 `submitType` 设置输入框的提交方式。
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import type { XSenderProps } from 'vue-element-plus-x/types/XSender';

const submitType = ref<XSenderProps['submitType']>('enter');
const senderLoading = ref(false);
const senderRef = ref<InstanceType<typeof XSender>>();

function handleSubmit() {
  if (senderLoading.value)
    return;

  ElMessage.info(`发送中`);
  senderLoading.value = true;

  setTimeout(() => {
    // 可以在控制台 查看打印结果
    console.log('submit-> value：', senderRef.value?.getModelValue());
    senderLoading.value = false;
    ElMessage.success(`发送成功`);
  }, 2000);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <el-radio-group v-model="submitType">
      <el-radio-button value="enter">
        enter提交
      </el-radio-button>
      <el-radio-button value="shiftEnter">
        shiftEnter提交
      </el-radio-button>
    </el-radio-group>

    <XSender
      ref="senderRef"
      :submit-type="submitType"
      :loading="senderLoading"
      @submit="handleSubmit"
    />
  </div>
</template>

```

### trigger

```vue
<docs>
---
title: 自定义指令
---

默认可以通过自定义设置触发符触发选择弹窗。
可以通过 `setTrigger` 插入一个指令标签。
使用 `setChatNode` 可以预设输入框内容（如文案、指令等）。
</docs>

<script setup lang="ts">
import type { XSender } from 'vue-element-plus-x';
import { ref } from 'vue';

const senderRef = ref<InstanceType<typeof XSender>>();

const triggerConfig = ref([
  {
    dialogTitle: '技能选择',
    key: '/',
    options: [
      {
        name: '技能1',
        id: 'skill1'
      },
      {
        name: '技能2',
        id: 'skill2'
      },
      {
        name: '技能3',
        id: 'skill3'
      }
    ]
  }
]);

function onSetBasic() {
  senderRef.value?.setTrigger('/', 'skill1');
}

function onSetModel() {
  senderRef.value?.setChatNode([
    [
      {
        type: 'Write',
        text: '用户选择了'
      },
      {
        type: 'Trigger',
        key: '/',
        id: 'skill3',
        name: '技能3'
      },
      {
        type: 'Write',
        text: '模式。'
      }
    ]
  ]);
}
</script>

<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="onSetBasic"> API插入 </el-button>
      <el-button type="primary" @click="onSetModel">
        预设输入内容插入
      </el-button>
    </div>

    <XSender
      ref="senderRef"
      :trigger-config="triggerConfig"
      variant="updown"
      placeholder="敲击 / 唤起技能选择"
    />
  </div>
</template>

```

### variant

```vue
<docs>
---
title: 输入框布局变体
---

通过 `variant` 属性设置输入框的变体。默认 'default' | 上下结构 'updown'

这个属性，将左右结构的 输入框，变成 上下结构的 输入框。上面为 输入框，下面为 内置的 前缀和操作列表栏
</docs>

<script setup lang="ts">
import type { XSenderProps } from 'vue-element-plus-x/types/XSender';
import { Paperclip, Promotion } from '@element-plus/icons-vue';
import { ref } from 'vue';

const variant = ref<XSenderProps['variant']>('default');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <el-radio-group v-model="variant">
      <el-radio-button value="default">
        default
      </el-radio-button>
      <el-radio-button value="updown">
        updown
      </el-radio-button>
    </el-radio-group>

    <XSender :variant="variant" clearable />

    <XSender
      :variant="variant"
      placeholder="💌 在这里你可以自定义变体后的 prefix 和 action-list"
    >
      <template #prefix>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
          <el-button round plain color="#626aef">
            <el-icon><Paperclip /></el-icon>
          </el-button>
        </div>
      </template>

      <template #action-list>
        <div style="display: flex; align-items: center; gap: 8px">
          <el-button round color="#626aef">
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
      </template>
    </XSender>
  </div>
</template>

```

## API 参考

### 提示语

### 自动聚焦

### 状态属性

### 提交方式

### 布局变体

### 自定义操作列表

### 自定义前缀

### 自定义头部

### 自定义底部

### 自定义输入框样式

### 输入长度限制

## 进阶用法

### 输入框

### 标签选择框

### 提及用户

### 指令弹窗

### 前置提示词

## 属性

### Props

| 属性                   | 类型                 | 是否必填 | 默认值       | 说明                                                                        |
| ---------------------- | -------------------- | -------- | ------------ | --------------------------------------------------------------------------- |
| `placeholder`          | string               | false    | `请输入内容` | 提示占位语                                                                  |
| `device`               | PC \| H5 \| auto     | false    | `auto`       | 交互设备                                                                    |
| `autoFocus`            | boolean              | false    | `false`      | 渲染完成后是否自动聚焦                                                      |
| `variant`              | default \| updown    | false    | `default`    | 布局变体                                                                    |
| `maxLength`            | number               | false    | `-1`         | 输入长度限制                                                                |
| `submitType`           | enter \| shiftEnter  | false    | `enter`      | 提交类型                                                                    |
| `customStyle`          | CSSStyleDeclaration  | false    | `{}`         | 自定义输入框样式                                                            |
| `loading`              | boolean              | false    | `false`      | 加载中状态                                                                  |
| `disabled`             | boolean              | false    | `false`      | 禁用状态                                                                    |
| `clearable`            | boolean              | false    | `false`      | 显示清空按钮                                                                |
| `headerAnimationTimer` | number               | false    | `300`        | 头部动画时间                                                                |
| `mentionConfig`        | MentionConfig        | false    | `null`       | 提及用户配置                                                                |
| `triggerConfig`        | TriggerConfig[]      | false    | `null`       | 指令弹窗配置                                                                |
| `selectConfig`         | SelectConfig[]       | false    | `null`       | 标签选择弹窗配置                                                            |
| `tipConfig`            | TipConfig \| boolean | false    | `true`       | 前置提示词配置（`true` 启用默认配置，`false` 禁用，对象表示启用并传入配置） |
| `getPlugin`            | () => typeof XSender | false    | `null`       | 自定义底层插件版本                                                          |

`tipConfig` 会原样透传给底层 `x-sender` 插件：组件本身不对配置做合并处理，`true/false` 用于开关功能，对象用于自定义配置项。

### MentionConfig

| 属性          | 类型                                                | 是否必填 | 默认值     | 说明                         |
| ------------- | --------------------------------------------------- | -------- | ---------- | ---------------------------- |
| `dialogTitle` | string                                              | true     | `''`       | 提及用户弹窗标题             |
| `options`     | \<{ id: string, name: string, avatar?: string }\>[] | true     | `[]`       | 数据选项                     |
| `callEvery`   | boolean                                             | false    | `false`    | 是否需要提及所有人选项       |
| `everyText`   | string                                              | false    | `所有人`   | 提及所有人的选项文案         |
| `asyncMatch`  | (matchStr: string) => Promise<MentionItem[]>        | false    | `null`     | 提及弹窗选项启用异步匹配模式 |
| `emptyText`   | string                                              | false    | `暂无数据` | 异步匹配选项为空时的提示文案 |

### TriggerConfig

| 属性          | 类型                               | 是否必填 | 默认值 | 说明                 |
| ------------- | ---------------------------------- | -------- | ------ | -------------------- |
| `dialogTitle` | string                             | true     | `''`   | 指令弹窗标题         |
| `key`         | string                             | true     | `null` | 触发指令选择的按键符 |
| `options`     | \<{ id: string, name: string }\>[] | true     | `[]`   | 数据选项             |

### SelectConfig

| 属性              | 类型                                                 | 是否必填 | 默认值           | 说明                     |
| ----------------- | ---------------------------------------------------- | -------- | ---------------- | ------------------------ |
| `dialogTitle`     | string                                               | true     | `''`             | 标签选择弹窗标题         |
| `key`             | string                                               | true     | `null`           | 选择标签标识             |
| `options`         | \<{ id: string, name: string, preview?: string }\>[] | true     | `[]`             | 数据选项                 |
| `multiple`        | boolean                                              | false    | `false`          | 开启多选                 |
| `emptyText`       | string                                               | false    | `暂无数据`       | 无选项时的提示文案       |
| `showSearch`      | boolean                                              | false    | `false`          | 开启搜索功能             |
| `placeholder`     | string                                               | false    | `输入关键字查询` | 搜索提示占位语           |
| `searchEmptyText` | string                                               | false    | `暂无数据`       | 搜索内容为空时的提示文案 |

### TipConfig

| 属性             | 类型     | 是否必填 | 默认值 | 说明                 |
| ---------------- | -------- | -------- | ------ | -------------------- |
| `tipTemplate`    | string   | false    | `''`   | 前置提示词模板       |
| `dialogTemplate` | string   | false    | `''`   | 指令弹窗模板         |
| `closeNames`     | string[] | false    | `[]`   | 关闭弹窗的按键符列表 |
| `offsetTop`      | number   | false    | `0`    | 弹窗顶部偏移量       |

---

