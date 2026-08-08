---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_3ef7f935935e11f1bafa525400287e28
    ReservedCode1: lthAZwqEp6eG1NnLYcYw9vVG3lFnnrP4EeIX/3EfnYSpT+Yx/lYUEvtuaF63p6XYp50P4yOG8QYkC09FB/Q8MlTV9tnAb7p/Jd5+vkwkI3jSfJVKf8xxLp79gNrTpoyj3bPgMXa+yGXrgRB0FkBA+7FQK5w+LCBZqgrfRZ9IdVlwN6lMoWQK4Lm5TGQ=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_3ef7f935935e11f1bafa525400287e28
    ReservedCode2: lthAZwqEp6eG1NnLYcYw9vVG3lFnnrP4EeIX/3EfnYSpT+Yx/lYUEvtuaF63p6XYp50P4yOG8QYkC09FB/Q8MlTV9tnAb7p/Jd5+vkwkI3jSfJVKf8xxLp79gNrTpoyj3bPgMXa+yGXrgRB0FkBA+7FQK5w+LCBZqgrfRZ9IdVlwN6lMoWQK4Lm5TGQ=
---

# Element-Plus-X 组件 Wiki

## 目录

1. [Attachments 附件管理](#attachments)
2. [Bubble 对话气泡](#bubble)
3. [BubbleList 对话气泡列表](#bubbleList)
4. [ConfigProvider 全局配置](#configProvider)
5. [Conversations 会话管理](#conversations)
6. [FilesCard 文件卡片](#filesCard)
7. [Prompts 提示词](#prompts)
8. [Thinking 思考过程](#thinking)
9. [ThoughtChain 思维链](#thoughtChain)
10. [useRecord 录音](#useRecord)
11. [useSend 发送](#useSend)
12. [useXStream 流式传输](#useXStream)
13. [Welcome 欢迎页](#welcome)
14. [XMarkdown Markdown渲染](#xMarkdown)
15. [XSender 输入发送框](#xsender)

---

# Attachments 附件管理

## 介绍

`Attachments` 组件是一个功能丰富的附件管理组件，支持文件列表展示、上传、拖拽交互、滚动浏览等功能，适用于需要处理多文件上传和展示的场景（如表单附件、文件管理界面）。组件内置文件上传按钮、拖拽提示区域，并提供灵活的自定义插槽和样式配置

### 基本使用

## 代码示例

### base

```vue
<docs>
---
title: 基础用法
---

基础文件列表展示与上传功能，支持自动生成文件卡片。
</docs>

<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { ref } from 'vue';

type SelfFilesCardProps = FilesCardProps & {
  id?: number;
};

const files = ref<SelfFilesCardProps[]>([]);

function handleBeforUpload(file: any) {
  console.log('befor', file);
  if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('文件大小不能超过 2MB!');
    return false;
  }
}

async function handleUploadDrop(files: any, props: any) {
  console.log('drop', files);
  console.log('props', props);

  if (files && files.length > 0) {
    if (files[0].type === '') {
      ElMessage.error('禁止上传文件夹！');
      return false;
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      await handleHttpRequest({ file });
    }
  }
}

async function handleHttpRequest(options: any) {
  const formData = new FormData();
  formData.append('file', options.file);
  ElMessage.info('上传中...');

  setTimeout(() => {
    const res = {
      message: '文件上传成功',
      fileName: options.file.name,
      uid: options.file.uid,
      fileSize: options.file.size,
      imgFile: options.file
    };
    files.value.push({
      id: files.value.length,
      uid: res.uid,
      name: res.fileName,
      fileSize: res.fileSize,
      imgFile: res.imgFile,
      showDelIcon: true,
      imgVariant: 'square'
    });
    ElMessage.success('上传成功');
  }, 1000);
}

function handleDeleteCard(item: SelfFilesCardProps) {
  files.value = files.value.filter((items: any) => items.id !== item.id);
  console.log('delete', item);
  ElMessage.success('删除成功');
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Attachments
      :http-request="handleHttpRequest"
      :items="files"
      drag
      :before-upload="handleBeforUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### custom-list

```vue
<docs>
---
title: 自定义文件列表
---

通过插槽自定义文件列表展示内容（覆盖默认的 `FilesCard` 组件）。
</docs>

<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { ref } from 'vue';

type SelfFilesCardProps = FilesCardProps & {
  id?: number;
};

const files = ref<SelfFilesCardProps[]>([]);

function handleBeforUpload(file: any) {
  console.log('befor', file);
  if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('文件大小不能超过 2MB!');
    return false;
  }
}

async function handleUploadDrop(files: any, props: any) {
  console.log('drop', files);
  console.log('props', props);

  if (files && files.length > 0) {
    if (files[0].type === '') {
      ElMessage.error('禁止上传文件夹！');
      return false;
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      await handleHttpRequest({ file });
    }
  }
}

async function handleHttpRequest(options: any) {
  const formData = new FormData();
  formData.append('file', options.file);
  ElMessage.info('上传中...');

  setTimeout(() => {
    const res = {
      message: '文件上传成功',
      fileName: options.file.name,
      uid: options.file.uid,
      fileSize: options.file.size,
      imgFile: options.file
    };
    files.value.push({
      id: files.value.length,
      uid: res.uid,
      name: res.fileName,
      fileSize: res.fileSize,
      imgFile: res.imgFile,
      showDelIcon: true,
      imgVariant: 'square'
    });
    ElMessage.success('上传成功');
  }, 1000);
}

function handleDeleteCard(item: SelfFilesCardProps) {
  files.value = files.value.filter((items: any) => items.id !== item.id);
  console.log('delete', item);
  ElMessage.success('删除成功');
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Attachments
      :http-request="handleHttpRequest"
      :items="files"
      drag
      :before-upload="handleBeforUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    >
      <template #file-list="{ items }">
        <div class="custom-list">
          <div v-for="(item, index) in items" :key="index" class="custom-item">
            <div class="custom-item-name">
              {{ item.name }}
            </div>
          </div>
        </div>
      </template>
    </Attachments>
  </div>
</template>

<style scoped lang="less">
.custom-list {
  display: flex;
  gap: 12px;
}

.custom-item {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>

```

### custom-scroll-buttons

```vue
<docs>
---
title: 自定义滚动按钮
---

覆盖默认的左右滚动按钮样式和交互。
</docs>

<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { ref } from 'vue';

type SelfFilesCardProps = FilesCardProps & {
  id?: number;
};

const files = ref<SelfFilesCardProps[]>([]);

function handleBeforUpload(file: any) {
  console.log('befor', file);
  if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('文件大小不能超过 2MB!');
    return false;
  }
}

async function handleUploadDrop(files: any, props: any) {
  console.log('drop', files);
  console.log('props', props);

  if (files && files.length > 0) {
    if (files[0].type === '') {
      ElMessage.error('禁止上传文件夹！');
      return false;
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      await handleHttpRequest({ file });
    }
  }
}

async function handleHttpRequest(options: any) {
  const formData = new FormData();
  formData.append('file', options.file);
  ElMessage.info('上传中...');

  setTimeout(() => {
    const res = {
      message: '文件上传成功',
      fileName: options.file.name,
      uid: options.file.uid,
      fileSize: options.file.size,
      imgFile: options.file
    };
    files.value.push({
      id: files.value.length,
      uid: res.uid,
      name: res.fileName,
      fileSize: res.fileSize,
      imgFile: res.imgFile,
      showDelIcon: true,
      imgVariant: 'square'
    });
    ElMessage.success('上传成功');
  }, 1000);
}

function handleDeleteCard(item: SelfFilesCardProps) {
  files.value = files.value.filter((items: any) => items.id !== item.id);
  console.log('delete', item);
  ElMessage.success('删除成功');
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Attachments
      :http-request="handleHttpRequest"
      :items="files"
      drag
      overflow="scrollX"
      :before-upload="handleBeforUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    >
      <template #prev-button="{ show, onScrollLeft }">
        <button v-if="show" class="custom-prev" @click="onScrollLeft">
          👈
        </button>
      </template>
      <template #next-button="{ show, onScrollRight }">
        <button v-if="show" class="custom-next" @click="onScrollRight">
          👉
        </button>
      </template>
    </Attachments>
  </div>
</template>

<style scoped lang="less">
.custom-prev,
.custom-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.custom-prev {
  left: 8px;
}

.custom-next {
  right: 8px;
}

.custom-prev:hover,
.custom-next:hover {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-color: rgba(255, 255, 255, 0.8);
}
</style>

```

### drag-upload

```vue
<docs>
---
title: 拖拽上传
---

`drag` 属性，开启拖拽上传功能，支持自定义拖拽目标区域和视觉反馈。

`dragTarget` 属性 可以是一个 id 选择器字符串，可以是一个 Ref 实例，也可以是 HTMLElement dom 。不设置就默认拖拽范围为当前列表。

如果想整个页面拖拽上传，请将 `drag` 设置为 `true`，并设置 `drag-target` 为 `'document.body'`。
</docs>

<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';

type SelfFilesCardProps = FilesCardProps & {
  id?: number;
};

const files = ref<SelfFilesCardProps[]>([]);
const isFull = ref(false);

const dragArea = ref();

watch(
  () => isFull.value,
  () => {
    if (isFull.value) {
      dragArea.value = document.body;
    } else {
      dragArea.value = 'drag-area';
    }
  },
  { immediate: true, deep: true }
);

function handleBeforUpload(file: any) {
  if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('文件大小不能超过 2MB!');
    return false;
  }
}

async function handleUploadDrop(files: any, _props: any) {
  if (files && files.length > 0) {
    if (files[0].type === '') {
      ElMessage.error('禁止上传文件夹！');
      return false;
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      await handleHttpRequest({ file });
    }
  }
}

async function handleHttpRequest(options: any) {
  const formData = new FormData();
  formData.append('file', options.file);
  ElMessage.info('上传中...');

  setTimeout(() => {
    const res = {
      message: '文件上传成功',
      fileName: options.file.name,
      uid: options.file.uid,
      fileSize: options.file.size,
      imgFile: options.file
    };
    files.value.push({
      id: files.value.length,
      uid: res.uid,
      name: res.fileName,
      fileSize: res.fileSize,
      imgFile: res.imgFile,
      showDelIcon: true,
      imgVariant: 'square'
    });
    ElMessage.success('上传成功');
  }, 1000);
}

function handleDeleteCard(item: SelfFilesCardProps) {
  files.value = files.value.filter((items: any) => items.id !== item.id);
  ElMessage.success('删除成功');
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <p>设置全屏拖拽上传：<el-switch v-model="isFull" /></p>
    <Attachments
      :http-request="handleHttpRequest"
      :items="files"
      drag
      :drag-target="dragArea"
      :before-upload="handleBeforUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    />

    <div
      id="drag-area"
      style="
        border: 2px dashed #ccc;
        padding: 20px;
        height: 250px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      在此处拖拽文件上传
    </div>
  </div>
</template>

<style scoped lang="less"></style>

```

### scroll-mode

```vue
<docs>
---
title: 滚动模式
---

支持横向滚动（`scrollX`）、纵向滚动（`scrollY`）和自动换行（`wrap`）三种布局模式。默认横向
</docs>

<script setup lang="ts">
import type {
  FilesCardProps,
  FilesType
} from 'vue-element-plus-x/types/FilesCard';
import { ref } from 'vue';

type SelfFilesCardProps = FilesCardProps & {
  id?: number;
};

const colorMap: Record<FilesType, string> = {
  word: '#5E74A8',
  excel: '#4A6B4A',
  ppt: '#C27C40',
  pdf: '#5A6976',
  txt: '#D4C58C',
  mark: '#FFA500',
  image: '#8E7CC3',
  audio: '#A67B5B',
  video: '#4A5568',
  three: '#5F9E86',
  code: '#4B636E',
  database: '#4A5A6B',
  link: '#5D7CBA',
  zip: '#8B5E3C',
  file: '#AAB2BF',
  unknown: '#888888'
};

const files = ref<SelfFilesCardProps[]>([]);
const typeList = Object.keys(colorMap);

onMounted(() => {
  for (let index = 0; index < 30; index++) {
    files.value.push({
      id: index,
      uid: index,
      name: `文件${index}`,
      fileSize: 1024 * 2,
      fileType: typeList[
        Math.floor(Math.random() * typeList.length)
      ] as FilesType,
      // description: `描述 ${index}`,
      url: '/logo.png',
      thumbUrl: '/logo.png',
      imgFile: new File([], 'test.txt'),
      showDelIcon: true
    });
  }
});

function handleBeforUpload(file: any) {
  if (file.size > 1024 * 1024 * 2) {
    ElMessage.error('文件大小不能超过 2MB!');
    return false;
  }
}

async function handleUploadDrop(files: any, _props: any) {
  if (files && files.length > 0) {
    if (files[0].type === '') {
      ElMessage.error('禁止上传文件夹！');
      return false;
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      await handleHttpRequest({ file });
    }
  }
}

async function handleHttpRequest(options: any) {
  const formData = new FormData();
  formData.append('file', options.file);
  ElMessage.info('上传中...');

  setTimeout(() => {
    const res = {
      message: '文件上传成功',
      fileName: options.file.name,
      uid: options.file.uid,
      fileSize: options.file.size,
      imgFile: options.file
    };
    files.value.push({
      id: files.value.length,
      uid: res.uid,
      name: res.fileName,
      fileSize: res.fileSize,
      imgFile: res.imgFile,
      showDelIcon: true,
      imgVariant: 'square'
    });
    ElMessage.success('上传成功');
  }, 1000);
}

function handleDeleteCard(item: SelfFilesCardProps) {
  files.value = files.value.filter((items: any) => items.id !== item.id);
  ElMessage.success('删除成功');
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div>scrollX</div>
    <Attachments
      :http-request="handleHttpRequest"
      :items="files"
      drag
      overflow="scrollX"
      :before-upload="handleBeforUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    />
    <div>scrollY</div>
    <Attachments
      :http-request="handleHttpRequest"
      :items="files"
      drag
      overflow="scrollY"
      :list-style="{ height: '200px' }"
      :before-upload="handleBeforUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    />
    <div>wrap</div>
    <Attachments
      :http-request="handleHttpRequest"
      :items="files"
      drag
      overflow="wrap"
      :before-upload="handleBeforUpload"
      :hide-upload="false"
      @upload-drop="handleUploadDrop"
      @delete-card="handleDeleteCard"
    />
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

通过 `ConfigProvider.themeOverrides` 覆盖 `Attachments` 的 `--elx-*` 变量（并联动 `FilesCard`），开关前后会有明显反差。
</docs>

<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { computed, ref } from 'vue';

const enabled = ref(true);

const files = ref<FilesCardProps[]>([
  {
    uid: '1',
    name: 'design-spec.pdf',
    fileSize: 1024 * 1024 * 2,
    showDelIcon: true
  },
  {
    uid: '2',
    name: 'avatar.png',
    fileSize: 1024 * 340,
    showDelIcon: true,
    imgVariant: 'square'
  },
  {
    uid: '3',
    name: 'demo.zip',
    fileSize: 1024 * 1024 * 5,
    showDelIcon: true
  },
  {
    uid: '4',
    name: 'readme.md',
    fileSize: 1024 * 8,
    showDelIcon: true
  },
  {
    uid: '5',
    name: 'report.xlsx',
    fileSize: 1024 * 420,
    showDelIcon: true
  }
]);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#7c3aed',
      'bg-surface': 'rgba(124, 58, 237, 0.06)',
      'border-color': 'rgba(124, 58, 237, 0.28)',
      'fill-color': 'rgba(124, 58, 237, 0.08)',
      'text-color-primary': 'rgba(15, 23, 42, 0.92)',
      'text-color-regular': 'rgba(15, 23, 42, 0.78)',
      'box-shadow': '0 16px 48px rgba(124, 58, 237, 0.22)'
    },
    components: {
      Attachments: {
        'attachments-nav-bg': 'rgba(124, 58, 237, 0.55)',
        'attachments-nav-bg-hover': 'rgba(124, 58, 237, 0.75)',
        'attachments-nav-bg-active': 'rgba(124, 58, 237, 0.92)',
        'attachments-nav-color': '#ffffff',
        'attachments-drop-bg':
          'linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(59, 130, 246, 0.10))',
        'attachments-upload-icon-color': '#7c3aed',
        'attachments-upload-icon-size': '60px'
      },
      FilesCard: {
        'files-card-bg':
          'linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(59, 130, 246, 0.08))',
        'files-card-border-color': 'rgba(124, 58, 237, 0.28)',
        'files-card-progress-bg': 'rgba(124, 58, 237, 0.16)',
        'files-card-delete-bg': 'rgba(124, 58, 237, 0.14)',
        'files-card-delete-border-color': 'rgba(124, 58, 237, 0.35)',
        'files-card-delete-color': '#7c3aed',
        'files-card-delete-shadow': '0 10px 30px rgba(124, 58, 237, 0.25)'
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
      <div>提示：此示例只覆写 Attachments 相关变量，不影响其他组件。</div>
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
          background: linear-gradient(
            135deg,
            rgba(124, 58, 237, 0.1),
            rgba(59, 130, 246, 0.06)
          );
          box-shadow: var(--elx-box-shadow);
        "
      >
        <Attachments
          :items="files"
          overflow="scrollX"
          :list-style="{ height: '140px' }"
        />
      </div>
    </ConfigProvider>
  </div>
</template>

```

## API 参考

### 滚动模式

### 自定义文件列表

### 拖拽上传

### 自定义滚动按钮

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `Attachments` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#attachments)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

## 属性

| 属性名           | 类型                                         | 是否必填 | 默认值      | 描述                                                          |
| ---------------- | -------------------------------------------- | -------- | ----------- | ------------------------------------------------------------- |
| `items`          | `FilesCardProps[]`                           | 否       | `[]`        | 文件列表数据（包含文件基础信息，如名称、类型、状态等）        |
| `overflow`       | `'scrollX' \| 'scrollY' \| 'wrap'`           | 否       | `'scrollX'` | 滚动布局模式（横向滚动/纵向滚动/自动换行）                    |
| `listStyle`      | `CSSProperties`                              | 否       | `{}`        | 列表容器自定义样式                                            |
| `uploadIconSize` | `string`                                     | 否       | `'64px'`    | 上传按钮图标尺寸                                              |
| `dragTarget`     | `string \| Ref<HTMLElement> \| null`         | 否       | `null`      | 拖拽目标元素（支持选择器字符串或 DOM 引用，默认使用组件自身） |
| `hideUpload`     | `boolean`                                    | 否       | `false`     | 是否隐藏默认上传按钮                                          |
| `limit`          | `number`                                     | 否       | `undefined` | 文件数量限制（超过时隐藏上传按钮）                            |
| `beforeUpload`   | `(file: File) => boolean`                    | 否       | `undefined` | 上传前校验函数（返回 `false` 可阻止上传）                     |
| `httpRequest`    | `(options: { file: File }) => Promise<void>` | 否       | `undefined` | 自定义上传请求函数（需返回 Promise）                          |

## 插槽

| 插槽名             | 插槽参数                                       | 描述                                                              |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------------------- |
| `#file-list`       | `{ items: FilesCardProps[] }`                  | 自定义文件列表内容（覆盖默认的 `FilesCard` 展示）                 |
| `#prev-button`     | `{ show: boolean, onScrollLeft: () => void }`  | 自定义左侧滚动按钮（`scrollX` 模式生效），`show` 控制按钮显示状态 |
| `#next-button`     | `{ show: boolean, onScrollRight: () => void }` | 自定义右侧滚动按钮（`scrollX` 模式生效），`show` 控制按钮显示状态 |
| `#empty-upload`    | `-`                                            | 空文件列表时的上传区域自定义（默认显示带加号的上传按钮）          |
| `#no-empty-upload` | `-`                                            | 非空文件列表时的上传占位符自定义（默认显示带加号的上传按钮）      |
| `#drop-area`       | `-`                                            | 拖拽上传时的遮罩层内容自定义（默认显示上传提示图标和文本）        |

## 事件

| 事件名          | 回调参数                                               | 描述                                                   |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `uploadChange`  | `(file: File, fileList: FileListProps)`                | 文件选择变化时触发（包含选中文件和当前文件列表）       |
| `uploadSuccess` | `(response: any, file: File, fileList: FileListProps)` | 文件上传成功时触发（返回接口响应、当前文件及文件列表） |
| `uploadError`   | `(error: any, file: File, fileList: FileListProps)`    | 文件上传失败时触发（返回错误信息、当前文件及文件列表） |
| `uploadDrop`    | `(files: File[], props: FileListProps)`                | 拖拽文件释放时触发（包含拖拽文件数组和组件属性）       |
| `deleteCard`    | `(item: FilesCardProps, index: number)`                | 文件卡片删除按钮点击时触发（返回被删除文件信息及索引） |

## 支持 el-upload 属性

组件内部使用了 **elementplus** `el-upload` 组件，因此支持其大部分上传属性，如：`httpRequest`、`beforeUpload` 等。 详情请参考：[element-plus/upload](https://element-plus.org/zh-CN/component/upload.html)

## 功能特性

1. **多布局模式** 支持 `scrollX`（横向滚动）、`scrollY`（纵向滚动）、`wrap`（自动换行）三种布局，适配不同屏幕空间和文件数量。
2. **拖拽上传交互** 内置拖拽目标区域（可自定义 `dragTarget`），拖拽时显示半透明遮罩层提示，支持文件夹过滤和文件类型校验。
3. **高度可定制化** 通过 `#file-list` 插槽完全自定义文件列表展示（如替换为自定义卡片组件），支持自定义滚动按钮、上传按钮样式。
4. **文件状态管理** 配合 `FilesCard` 组件，支持文件上传中（进度条）、完成、失败等状态可视化，自动同步文件列表更新。
---

# Bubble 对话气泡

`2.0.0 版本` 移除了内置的 Typewriter 打字器组件。如需 Markdown 渲染功能，请使用 [x-markdown-vue](https://www.npmjs.com/package/x-markdown-vue)

## 介绍

`Bubble` 是一个对话气泡组件，常用于聊天的时候。它可以展示对话内容，支持自定义头像、头部、内容、底部，并且具备加载状态展示。

### 基本使用

## 代码示例

### avatar-and-placement

```vue
<docs>
---
title: 支持位置和头像，以及间距设置
---

通过 `#avatar` 设置自定义头像。通过 `placement` 属性设置位置，提供了 `start`、`end` 两个选项值。

::: tip
😸 内置 `element-plus` `el-avatar` 组件。但是为避免属性名重复，例如：`el-avatar` 和 `Bubble` 的 `shape` 属性。你需要用以下属性设置

1. 属性
- `avatar` 设置头像占位图片
- `avatar-size` 设置头像占位大小 👉这个属性在 `el-avatar组件` 是 `number类型`，这里注意在此组件上是 `string类型` 以更好自定义样式属性😊
- `avatar-gap` 设置头像和气泡之间的距离
- `avatar-shape` 设置头像形状
- `avatar-icon` 设置头像占位图标
- `avatar-src-set` 设置头像图片 srcset 属性
- `avatar-alt` 设置头像图片的 alt  属性
- `avatar-fit` 设置头像占位图片的填充模式
2. 事件
- `@avatar-error` 当头像加载失败时触发。
:::
</docs>

<script setup lang="ts">
const avatarAI =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
const avatarUser = 'https://avatars.githubusercontent.com/u/76239030?v=4';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <!-- Avatar and Placement 左侧 -->
    <Bubble
      content="Good morning, how are you?"
      placement="start"
      :avatar="avatarAI"
      avatar-size="48px"
    />

    <!-- avatar-size 设置头像占位空间 -->
    <Bubble
      content="What a beautiful day!"
      placement="start"
      avatar-size="48px"
    />

    <!-- Avatar and Placement 右侧 -->
    <Bubble content="Hi, good morning, I'm fine!" placement="end">
      <template #avatar>
        <el-avatar :size="32" :src="avatarUser" />
      </template>
    </Bubble>

    <!-- avatar-gap 属性控制 气泡与头像的距离 -->
    <Bubble
      content="Hi, good morning, I'm fine! Thank you!"
      placement="end"
      avatar-size="0px"
      avatar-gap="0px"
    />
  </div>
</template>

```

### content-customize

```vue
<docs>
---
title: 自定义 气泡内容
---

通过 `#content` 插槽，自定义气泡内容。

::: info
`#content` 插槽 优先级更高，`content` 属性将失效。 `no-padding` 属性可以禁用气泡内容内边距。
:::
</docs>

<script setup lang="ts">
const avatarSize = '48px';
const avatarAI =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Bubble
      content="欢迎使用 element-plus-x。"
      typing
      :avatar="avatarAI"
      :avatar-size="avatarSize"
      no-style
    >
      <template #content>
        <div class="content-container">
          😊 欢迎使用 element-plus-x，我是自定义气泡
        </div>
      </template>
    </Bubble>

    <Bubble :avatar-size="avatarSize" typing no-style variant="borderless">
      <template #header>
        <div class="content-container-header">
          推荐内容 自定义气泡
        </div>
      </template>
      <template #content>
        <div class="content-borderless-container">
          🥤 长时间工作后如何有效休息？
        </div>
      </template>
    </Bubble>

    <Bubble :avatar-size="avatarSize" typing no-style variant="borderless">
      <template #content>
        <div class="content-borderless-container">
          💌 保持积极心态的秘诀是什么？
        </div>
      </template>
    </Bubble>

    <Bubble :avatar-size="avatarSize" typing no-style variant="borderless">
      <template #content>
        <div class="content-borderless-container">
          🔥 如何在巨大的压力下保持冷静？
        </div>
      </template>
    </Bubble>
  </div>
</template>

<style scoped>
.content-container {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.content-container-header {
  font-size: 12px;
  color: #909399;
}

.content-borderless-container {
  user-select: none;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #ebeef5;
  }
}
</style>

```

### content

```vue
<docs>
---
title: 基础用法。
---

最简化的集成方式。
</docs>

<script setup lang="ts">
const content = ref('hello world !');
</script>

<template>
  <Bubble :content="content" />
</template>

```

### header-and-footer

```vue
<docs>
---
title: 支持自定义气泡 头部、底部 内容
---

通过 `#header` 和 `#footer` 插槽 来自定义气泡的头部和底部。
</docs>

<script setup lang="ts">
import { DocumentCopy, Refresh, Search, Star } from '@element-plus/icons-vue';

const content = ref(
  '嗨！你好，欢迎使用 Element Plus X，有什么问题，可以问我哦~'
);
const avatarAI =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
</script>

<template>
  <Bubble :content="content">
    <template #avatar>
      <el-avatar :src="avatarAI" />
    </template>
    <template #header>
      <span>Element Plus X</span>
    </template>
    <template #footer>
      <div class="footer-container">
        <el-button type="info" :icon="Refresh" size="small" circle />
        <el-button type="success" :icon="Search" size="small" circle />
        <el-button type="warning" :icon="Star" size="small" circle />
        <el-button color="#626aef" :icon="DocumentCopy" size="small" circle />
      </div>
    </template>
  </Bubble>
</template>

<style scoped lang="less">
.footer-container {
  :deep(.el-button + .el-button) {
    margin-left: 8px;
  }
}
</style>

```

### loading

```vue
<docs>
---
title: 加载中状态
---

通过 `loading` 属性设置加载中状态。支持通过 `#loading` 插槽自定义加载中状态内容展示。

::: info
`#loading` 插槽 优先级更高，内置的加载中样式将失效。但 `loading` 属性任然可以控制 加载中状态。
:::
</docs>

<script setup lang="ts">
const loading = ref(true);
const content = ref('hello world !');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <Bubble :content="content" :loading="loading" />

    <Bubble :content="content" :loading="loading">
      <template #loading>
        <div>loading...</div>
      </template>
    </Bubble>

    <Bubble :content="content" :loading="loading">
      <template #loading>
        <div>感谢使用 Element-Plus-X 🌹 请稍后...</div>
      </template>
    </Bubble>

    <div style="display: flex; align-items: center">
      <span>状态：</span>
      <el-switch v-model="loading" />
    </div>
  </div>
</template>

```

### theme-overrides

```vue
<docs>
---
title: 自定义主题
---

通过 `ConfigProvider.themeOverrides` 覆盖 `Bubble` 的主题变量（背景、边框、圆角、padding、宽度等），开关前后会有明显反差。
</docs>

<script setup lang="ts">
import { computed, ref } from 'vue';

const enabled = ref(true);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#8b5cf6',
      'border-color': 'rgba(139, 92, 246, 0.35)',
      'fill-color': 'rgba(139, 92, 246, 0.10)',
      'text-color-primary': 'rgba(15, 23, 42, 0.92)',
      'box-shadow': '0 18px 54px rgba(139, 92, 246, 0.22)'
    },
    components: {
      Bubble: {
        'bubble-content-max-width': '420px',
        'bubble-bg':
          'linear-gradient(135deg, rgba(139, 92, 246, 0.16), rgba(59, 130, 246, 0.10))',
        'bubble-border-color': 'rgba(139, 92, 246, 0.32)',
        'bubble-text-color': 'rgba(15, 23, 42, 0.86)',
        'bubble-radius': '18px',
        'bubble-padding-y': '14px',
        'bubble-padding-x': '18px',
        'bubble-shadow': '0 18px 52px rgba(139, 92, 246, 0.18)',
        'bubble-dot-color': '#8b5cf6'
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
      <div>开启覆写后，气泡内容最大宽度会变窄。</div>
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
              1200px 280px at 0% 0%,
              rgba(139, 92, 246, 0.22),
              transparent 60%
            ),
            radial-gradient(
              900px 240px at 100% 20%,
              rgba(59, 130, 246, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
          display: flex;
          flex-direction: column;
          gap: 10px;
        "
      >
        <Bubble
          placement="start"
          variant="borderless"
          content="这是一个 start 气泡。覆写后会变成渐变背景 + 大圆角 + 更强阴影。"
        />
        <Bubble
          placement="end"
          variant="shadow"
          content="这是一个 end 气泡。通过 themeOverrides 你可以把 Bubble 做成统一的“玻璃风”主题。"
        />
        <Bubble placement="start" variant="shadow" loading />
      </div>
    </ConfigProvider>
  </div>
</template>

```

### variant-and-shape

```vue
<docs>
---
title: 内置样式格式和形状
---

通过 `variant` 属性设置气泡的填内置样式格式。通过 `shape` 属性设置气泡的形状。当然你也可以两两结合，搭配使用

::: info
默认情况下，`variant` 为 `filled`，`shape` 为 `round`。

`shape` 为 `corner` 时，`placement="end"` 会自动将气泡翻转，使得右上角的 `弧度针` 指向用户。
:::
</docs>

<script setup lang="ts"></script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="filled" variant="filled" />
      <Bubble content="filled + round" variant="filled" shape="round" />
      <Bubble content="filled + corner" variant="filled" shape="corner" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="borderless" variant="borderless" />
      <Bubble content="borderless + round" variant="borderless" shape="round" />
      <Bubble
        content="borderless + corner"
        variant="borderless"
        shape="corner"
      />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="outlined" variant="outlined" />
      <Bubble content="outlined + round" variant="outlined" shape="round" />
      <Bubble content="outlined + corner" variant="outlined" shape="corner" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="shadow" variant="shadow" />
      <Bubble content="shadow + round" variant="shadow" shape="round" />
      <Bubble content="shadow + corner" variant="shadow" shape="corner" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="round" shape="round" />
    </div>

    <div style="display: flex; gap: 12px; align-items: center">
      <Bubble content="corner" shape="corner" />
      <Bubble content="placement end" shape="corner" placement="end" />
    </div>
  </div>
</template>

```

### with-markdown

```vue
<docs>
---
title: 与 x-markdown-vue 结合使用
---

支持公式、代码块、任务列表和流式渲染。
</docs>

<script setup lang="ts">
import 'katex/dist/katex.min.css';

import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const avatar = 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4';

const staticContent = ref(`### 行内公式
1. 欧拉公式：$e^{i\\pi} + 1 = 0$
2. 二次方程求根公式：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
3. 向量点积：$\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y + a_z b_z$

### []包裹公式
\\[ e^{i\\pi} + 1 = 0 \\]

\\[\\boxed{boxed包裹}\\]

### 块级公式
1. 傅里叶变换：
$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt
$$

2. 矩阵乘法：
$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
\\begin{bmatrix}
x \\\\
y
\\end{bmatrix}
=
\\begin{bmatrix}
ax + by \\\\
cx + dy
\\end{bmatrix}
$$

3. 泰勒级数展开：
$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n
$$

### 任务列表与代码块
- [x] Add some task
- [ ] Do some task

\`\`\`typescript
const greeting: string = "Hello World";
console.log(greeting);
\`\`\`
`);

const streamingContent = ref('');
let interval: ReturnType<typeof setInterval>;

function startStreaming() {
  streamingContent.value = '';
  const text = `# 标题
这是一个 Markdown 示例。
- 列表项 1
- 列表项 2
**粗体文本** 和 *斜体文本*

- [x] Add some task
- [ ] Do some task

\`\`\`typescript
const greeting = "Hello World";
console.log(greeting);
\`\`\`
`;
  let index = 0;
  interval = setInterval(() => {
    if (index < text.length) {
      streamingContent.value += text[index];
      index++;
    } else {
      clearInterval(interval);
    }
  }, 30);
}

function stopStreaming() {
  clearInterval(interval);
}

function resetStreaming() {
  stopStreaming();
  streamingContent.value = '';
}

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="markdown-demo-container">
    <div class="demo-section">
      <div class="demo-title">基础用法（支持公式、代码块、任务列表）</div>
      <Bubble :avatar="avatar" placement="start">
        <template #content>
          <div class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="staticContent"
            />
          </div>
        </template>
      </Bubble>
    </div>

    <div class="demo-section">
      <div class="demo-title">流式渲染</div>
      <p class="demo-tip">
        通过 <code>enable-animate</code> 属性实现打字机效果，模拟 AI
        流式输出场景
      </p>
      <div class="btn-list">
        <el-button type="primary" @click="startStreaming">
          开始流式输出
        </el-button>
        <el-button @click="stopStreaming"> 停止 </el-button>
        <el-button @click="resetStreaming"> 重置 </el-button>
      </div>
      <Bubble :avatar="avatar" placement="start">
        <template #content>
          <div class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="streamingContent"
              :enable-animate="true"
            />
          </div>
        </template>
      </Bubble>
    </div>
  </div>
</template>

<style scoped lang="scss">
.markdown-demo-container {
  .demo-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .demo-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--vp-c-text-1);
  }

  .demo-tip {
    color: var(--vp-c-text-2);
    font-size: 14px;
    margin-bottom: 12px;

    code {
      background: var(--vp-c-default-soft);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .btn-list {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}

.markdown-content-wrapper {
  word-break: break-word;
  color: #24292e;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.25;
    &:first-child {
      margin-top: 0;
    }
  }

  :deep(p) {
    margin-top: 0;
    margin-bottom: 8px;
    line-height: 1.6;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin-top: 0;
    margin-bottom: 8px;

    ul,
    ol {
      margin-top: 4px;
      margin-bottom: 0;
    }
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(ol) {
    list-style-type: decimal;
  }

  :deep(li) {
    margin: 4px 0;
    line-height: 1.6;

    &.task-list-item {
      list-style-type: none;
      padding-left: 0;
      display: flex;
      align-items: flex-start;
      margin-left: -20px;

      input[type='checkbox'] {
        margin: 5px 8px 0 0;
        flex-shrink: 0;
      }
    }
  }

  :deep(a) {
    color: #0366d6;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  :deep(code):not(pre code) {
    background-color: rgba(27, 31, 35, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family:
      ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Consolas,
      Liberation Mono,
      monospace;
    font-size: 85%;
  }

  :deep(blockquote) {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 8px 0;
  }

  :deep(hr) {
    height: 0.25em;
    padding: 0;
    margin: 16px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  :deep(table) {
    display: block;
    width: 100%;
    overflow: auto;
    margin-top: 0;
    margin-bottom: 16px;
    border-collapse: collapse;

    th,
    td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }

    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }
}

:deep(.x-md-code-block) {
  pre {
    background-color: #f6f8fa !important;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;

    code {
      font-family:
        ui-monospace,
        SFMono-Regular,
        SF Mono,
        Menlo,
        Consolas,
        Liberation Mono,
        monospace;
      font-size: 14px;
      line-height: 1.5;

      .line {
        display: block;
        min-height: 1rem;
      }
    }
  }
}

:deep(.x-md-animated-word) {
  animation: fadeIn 0.2s ease-in-out forwards;
  display: inline-block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

```

## API 参考

### 头像、位置

### 头部、底部

### 加载状态

### 自定义内容

### 变体和形状

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `Bubble` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#bubble)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

### 与 x-markdown-vue 结合使用

从 v2.0.0 开始，Typewriter 组件已移除。如需 Markdown 渲染功能，请使用 [x-markdown-vue](https://www.npmjs.com/package/x-markdown-vue)，或查看专属文档：[XMarkdown](/zh/components/xMarkdown/)。

#### 安装

```bash
pnpm add x-markdown-vue
pnpm add katex
pnpm add shiki shiki-stream
```

::: tip
如果需要代码块语法高亮功能，请安装 `shiki` 和 `shiki-stream`。否则控制台可能会报错：`Streaming highlighter initialization failed: Error: Failed to load shiki-stream module`
:::

#### 完整演示

#### 基础用法

```vue
<script setup>
import { ref } from 'vue';
import { MarkdownRenderer } from 'x-markdown-vue';
import 'x-markdown-vue/style';

const avatar = ref('https://example.com/avatar.png');
const content = ref('**Hello** World!\n\n这是 **Markdown** 内容');
</script>

<template>
  <Bubble :avatar="avatar" placement="start">
    <template #content>
      <MarkdownRenderer :markdown="content" />
    </template>
  </Bubble>
</template>
```

#### 雾化效果（替代打字效果）

```vue
<script setup>
import { ref } from 'vue';
import { MarkdownRenderer } from 'x-markdown-vue';
import 'x-markdown-vue/style';

const content = ref('');
</script>

<template>
  <Bubble :avatar="avatar" placement="start">
    <template #content>
      <MarkdownRenderer :markdown="content" :enable-animate="true" />
    </template>
  </Bubble>
</template>
```

## 属性

| <div style="width: 130px">属性名</div> |  类型   |  默认值  | 说明                                                                                                              |
| :------------------------------------- | :-----: | :------: | :---------------------------------------------------------------------------------------------------------------- |
| `content`                              | String  |    ''    | 气泡内要展示的文本内容                                                                                            |
| `placement`                            | String  | 'start'  | 气泡的位置，可选值为 `'start'` 或 `'end'`，分别表示左侧和右侧。                                                   |
| `avatar`                               | String  |    ''    | 气泡头像的图片地址                                                                                                |
| `loading`                              | Boolean |  false   | 是否显示加载状态。为 `true` 时，气泡内会显示加载状态。                                                            |
| `shape`                                | String  |   null   | 气泡的形状，可选值为 `'round'`（圆角）或 `'corner'`（有角）。                                                     |
| `variant`                              | String  | 'filled' | 气泡的样式变体，可选值为 `'filled'`（填充）、`'borderless'`（无边框）、`'outlined'`（轮廓）、`'shadow'`（阴影）。 |
| `noStyle`                              | Boolean |  false   | 是否去除样式，为 `true` 时，将去除气泡内置 `padding` 和 `背景色`                                                  |
| `maxWidth`                             | String  | '500px'  | 气泡内容的最大宽度。                                                                                              |
| `avatar-size`                          | String  |    ''    | 设置头像占位大小                                                                                                  |
| `avatar-gap`                           | String  |  '12px'  | 设置头像和气泡之间的 `gap` 值                                                                                     |
| `avatar-shape`                         | String  |    ''    | 头像形状，可选值为 `'circle'`（圆形）或 `'square'`（方形）。                                                      |
| `avatar-icon`                          | String  |    ''    | 头像图标，优先级高于 `avatar`，支持传入图标名称，如 `'user'`。                                                    |
| `avatar-src-set`                       | String  |    ''    | 设置头像图片 srcset 属性                                                                                          |
| `avatar-alt`                           | String  |    ''    | 设置头像图片 alt 属性                                                                                             |
| `avatar-fit`                           | String  | 'cover'  | 设置头像图片的 `object-fit` 属性,可选属性值：`'cover'`、`'contain'`、`'fill'`、`'none'`、`'scale-down'`           |

## 事件

| 事件名         | 参数       | 类型     | 描述               |
| -------------- | ---------- | -------- | ------------------ |
| `@avatarError` | `ref` 实例 | Function | 头像加载失败时触发 |

## Ref 实例方法

| 属性名    | 类型     | 描述                   |
| --------- | -------- | ---------------------- |
| `restart` | Function | 重新开始。             |
| `destroy` | Function | 主动销毁 Bubble 组件。 |

## 插槽

| 插槽名     | 参数 | 类型 | 描述                       |
| ---------- | ---- | ---- | -------------------------- |
| `#avatar`  | -    | Slot | 自定义头像展示内容         |
| `#header`  | -    | Slot | 自定义气泡顶部展示内容     |
| `#content` | -    | Slot | 自定义气泡展示内容         |
| `#loading` | -    | Slot | 自定义气泡加载状态展示内容 |
| `#footer`  | -    | Slot | 自定义气泡底部展示内容     |

## 功能特性

1. **布局方向** - 支持左对齐(`start`)和右对齐(`end`)
2. **内容类型** - 支持纯文本、自定义插槽内容
3. **加载状态** - 内置加载动画，支持自定义加载内容
4. **视觉效果** - 提供多种形状和变体（圆角/直角、填充/描边/阴影等）
5. **灵活插槽** - 提供头像、头部、内容、底部、加载状态等插槽
---

# BubbleList 对话气泡列表

## 介绍

`BubbleList` 基于 `Bubble` 组件，用于展示一组对话气泡列表。内置虚拟滚动（`virtua/vue`）、自动追底、滚动状态机、未读计数、双向分页加载、回底按钮和混合节点渲染，开箱即用，按需配置。

### 基础使用

## 代码示例

### auto-scroll

```vue
<docs>
---
title: 自动触底控制（autoScroll）
---

`autoScroll`（默认 `true`）控制追加新消息时是否自动滚到底部。关闭后，新消息不再自动触底，而是累计未读计数——这是显示未读角标的前提。

::: tip 流式输出的特殊行为
即使 `autoScroll` 开启，流式增量也只在用户处于底部时跟随；上滑后不强制拉回，避免打断阅读。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  content: string;
  placement: 'start' | 'end';
  loading?: boolean;
}

const bubbleListRef = ref<BubbleListInstance | null>(null);
const autoScroll = ref(true);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
let nextKey = 100;

const bubbleItems = ref<MessageItem[]>(buildSeedList());

function buildSeedList(): MessageItem[] {
  const list: MessageItem[] = [];
  for (let i = 0; i < 8; i++) {
    const isUser = i % 2 !== 0;
    list.push({
      key: i + 1,
      role: isUser ? 'user' : 'ai',
      content: isUser
        ? `用户消息 ${i + 1}：你好，我想了解一下 BubbleList 的自动滚动功能。`
        : `AI 回复 ${i + 1}：BubbleList 的 autoScroll 属性控制新消息是否自动滚动到底部。默认开启。`,
      placement: isUser ? 'end' : 'start'
    });
  }
  nextKey = 9;
  return list;
}

function resetConversation() {
  bubbleItems.value = buildSeedList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function appendMessage(role: 'user' | 'ai') {
  bubbleItems.value.push({
    key: ++nextKey,
    role,
    content:
      role === 'user'
        ? '用户追加消息：这是一条测试消息，用于观察 autoScroll 开关对自动触底的影响。'
        : 'AI 追加回复：当 autoScroll 开启时，此消息会自动出现在底部可视区域。',
    placement: role === 'user' ? 'end' : 'start'
  });
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}
</script>

<template>
  <div class="autoscroll-demo">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
        <span class="header-icon">⚙️</span>
        <span>AutoScroll 自动触底控制台</span>
      </div>

      <!-- 核心：autoScroll 开关 -->
      <div class="control-row core-switch">
        <span class="switch-label">
          <strong>autoScroll</strong>
          <span class="switch-desc">{{
            autoScroll
              ? '已开启 — 新消息自动触底'
              : '已关闭 — 累计未读，需手动回底'
          }}</span>
        </span>
        <el-switch
          v-model="autoScroll"
          active-text="开启"
          inactive-text="关闭"
        />
      </div>

      <el-divider style="margin: 8px 0" />

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          plain
          size="small"
          @click="appendMessage('user')"
        >
          + 用户消息
        </el-button>
        <el-button
          type="success"
          plain
          size="small"
          @click="appendMessage('ai')"
        >
          + AI 回复
        </el-button>
        <el-button size="small" @click="resetConversation">
          重置会话
        </el-button>
      </div>

      <!-- 行为说明 -->
      <div class="behavior-hint" :class="autoScroll ? 'hint-on' : 'hint-off'">
        <div class="hint-icon">
          {{ autoScroll ? '✅' : '⚠️' }}
        </div>
        <div class="hint-text">
          <template v-if="autoScroll">
            <strong>当前模式：自动追底</strong><br />
            所有新消息（用户 / AI）都会自动滚动到底部，未读计数始终为 0。
            尝试向上滚动后再点追加消息，观察是否仍然自动回底。
          </template>
          <template v-else>
            <strong>当前模式：手动控制</strong><br />
            新消息不再自动触发滚动，未读数开始累计。
            回底按钮将显示红色数字角标，点击后平滑滚到底部并清零未读。
          </template>
        </div>
      </div>
    </div>

    <!-- BubbleList -->
    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :auto-scroll="autoScroll"
        :always-show-scrollbar="true"
        :show-back-button="true"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <!-- 自定义回底按钮（带未读角标） -->
        <template #backToBottom="context">
          <div
            class="custom-back-btn"
            :class="{ 'has-unread': context.unreadCount > 0 }"
            @click="context.scrollToBottom(true)"
          >
            <span class="btn-icon">↓</span>
            <span class="btn-text">回到底部</span>
            <span v-if="context.unreadCount > 0" class="btn-badge">
              {{ context.unreadCount > 99 ? '99+' : context.unreadCount }}
            </span>
          </div>
        </template>
      </BubbleList>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">scrollState</span>
        <el-tag
          :type="
            scrollState === 'AT_BOTTOM'
              ? 'success'
              : scrollState === 'SCROLLED_UP'
                ? 'warning'
                : 'danger'
          "
          size="small"
        >
          {{ scrollState }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">unreadCount</span>
        <el-tag :type="unreadCount > 0 ? 'danger' : 'info'" size="small">
          {{ unreadCount }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">autoScroll</span>
        <el-tag :type="autoScroll ? 'success' : 'danger'" size="small">
          {{ autoScroll ? 'ON' : 'OFF' }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.autoscroll-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
}

.control-panel {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;

  .panel-header {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;

    .header-icon {
      font-size: 18px;
    }
  }

  .core-switch {
    background: #fafafa;
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .switch-label {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        color: #303133;
        font-size: 14px;
      }
      .switch-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .behavior-hint {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
    display: flex;
    gap: 8px;

    &.hint-on {
      background: #f0f9eb;
      border: 1px solid #e1f3d8;
      color: #67c23a;
    }

    &.hint-off {
      background: #fef0f0;
      border: 1px solid #fde2e2;
      color: #f56c6c;
    }

    .hint-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    strong {
      font-weight: 600;
    }
  }
}

.status-bar {
  display: flex;
  gap: 16px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-label {
      font-size: 12px;
      color: #909399;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  }
}

// ---- 自定义回底按钮（带未读角标） ----
.custom-back-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.35);
  transition: all 0.25s ease;
  user-select: none;
  z-index: 10;

  &:hover {
    transform: translateX(-50%) scale(1.05);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.5);
  }

  &:active {
    transform: translateX(-50%) scale(0.97);
  }

  .btn-icon {
    font-size: 14px;
    font-weight: 700;
  }
  .btn-text {
    white-space: nowrap;
  }

  .btn-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #f56c6c;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
  }

  &.has-unread {
    animation: pulse-red 1.5s ease-in-out infinite;
  }
}

@keyframes pulse-red {
  0%,
  100% {
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.35);
  }
  50% {
    box-shadow:
      0 2px 20px rgba(245, 108, 108, 0.6),
      0 0 0 4px rgba(245, 108, 108, 0.15);
  }
}
</style>

```

### back-button

```vue
<docs>
---
title: 返回底部按钮
---

内置回底按钮，支持属性配置外观，也可通过 `#backToBottom` 插槽完全自定义。

通过 `showBackButton`、`backButtonThreshold`、`backButtonPosition`、`btnColor` / `btnIconSize` / `btnLoading` 等属性调整按钮行为与样式。关闭 `autoScroll` 后，按钮上会自动出现未读角标，插槽上下文中的 `unreadCount` 即为当前未读数，`scrollToBottom()` 调用后自动清零。
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  loading: boolean;
  shape: 'round' | 'corner';
  variant: string;
  avatar: string;
  avatarSize: string;
}

const bubbleListRef = ref<BubbleListInstance | null>(null);

// ---- 控制开关 ----
const useCustomSlot = ref(false);
const autoScrollEnabled = ref(true);
const alwaysShowScrollbar = ref(false);

// ---- 内置按钮属性（仅默认模式） ----
const btnLoading = ref(true);
const btnColor = ref('#409EFF');
const btnSize = ref(24);
const bottomValue = ref(20);
const leftValue = ref(50);

// ---- 状态 ----
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
let nextKey = 100;

const backButtonPosition = computed(() => ({
  bottom: `${bottomValue.value}%`,
  left: `${leftValue.value}%`,
  transform: 'translateX(-50%)'
}));

// ---- 初始数据 ----
const list = ref<MessageItem[]>(buildSeedList());

function buildSeedList(): MessageItem[] {
  const messages: MessageItem[] = [];
  for (let i = 0; i < 12; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    messages.push({
      key: i + 1,
      role,
      placement,
      content:
        role === 'ai'
          ? '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'.repeat(
              2
            )
          : `哈哈哈，让我试试第 ${i + 1} 条消息`,
      loading: false,
      shape: 'corner',
      variant: role === 'ai' ? 'filled' : 'outlined',
      avatar:
        role === 'ai'
          ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          : 'https://avatars.githubusercontent.com/u/76239030?v=4',
      avatarSize: '24px'
    });
  }
  nextKey = 13;
  return messages;
}

// ---- 操作 ----
function appendMessage(role: 'user' | 'ai') {
  list.value.push({
    key: ++nextKey,
    role,
    placement: role === 'ai' ? 'start' : 'end',
    content:
      role === 'user'
        ? '📝 用户追加消息：这是一条测试消息，用于观察 autoScroll 对触底和未读的影响。'
        : '🤖 AI 追加回复：当 autoScroll 关闭时，此消息会触发未读计数 +1，回底按钮将带红色角标。',
    loading: false,
    shape: 'corner',
    variant: role === 'ai' ? 'filled' : 'outlined',
    avatar:
      role === 'ai'
        ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        : 'https://avatars.githubusercontent.com/u/76239030?v=4',
    avatarSize: '24px'
  });
}

function resetConversation() {
  list.value = buildSeedList();
  unreadCount.value = 0;
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}
</script>

<template>
  <div class="back-btn-demo">
    <!-- ====== 控制面板 ====== -->
    <div class="control-panel">
      <!-- 核心开关区 -->
      <div class="panel-section">
        <div class="section-title">核心控制</div>

        <div class="control-row core-switch">
          <span class="switch-label">
            <strong>autoScroll</strong>
            <span class="switch-desc">
              {{
                autoScrollEnabled
                  ? '已开启 — 新消息自动触底，无未读'
                  : '已关闭 — 累计未读，显示角标'
              }}
            </span>
          </span>
          <el-switch
            v-model="autoScrollEnabled"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>

        <div class="control-row">
          <span class="control-label">自定义插槽 (V2)</span>
          <el-switch
            v-model="useCustomSlot"
            inactive-text="默认按钮"
            active-text="自定义"
          />
        </div>

        <div class="control-row">
          <span class="control-label">滚动条显示</span>
          <el-switch
            v-model="alwaysShowScrollbar"
            inactive-text="鼠标悬停"
            active-text="一直展示"
          />
        </div>
      </div>

      <!-- 内置按钮属性（仅默认模式） -->
      <template v-if="!useCustomSlot">
        <div class="panel-section">
          <div class="section-title">内置按钮样式</div>

          <div class="control-row">
            <span class="control-label">Loading 动效</span>
            <el-switch
              v-model="btnLoading"
              inactive-text="关闭"
              active-text="开启"
            />
          </div>

          <div class="control-row">
            <span class="control-label">按钮颜色</span>
            <el-color-picker v-model="btnColor" size="default" />
          </div>

          <div class="control-row">
            <span class="control-label">图标大小</span>
            <el-slider v-model="btnSize" :min="16" :max="48" style="flex: 1" />
          </div>
        </div>
      </template>

      <!-- 定位属性（两种模式均生效） -->
      <div class="panel-section">
        <div class="section-title">
          按钮定位
          <el-tag
            size="small"
            type="success"
            effect="plain"
            style="margin-left: 6px; vertical-align: middle"
          >
            插槽模式也生效
          </el-tag>
        </div>
        <div class="control-row">
          <span class="control-label">距底部 %</span>
          <el-slider v-model="bottomValue" :min="0" :max="50" style="flex: 1" />
          <span class="control-value">{{ bottomValue }}%</span>
        </div>
        <div class="control-row">
          <span class="control-label">水平位置 %</span>
          <el-slider v-model="leftValue" :min="0" :max="100" style="flex: 1" />
          <span class="control-value">{{ leftValue }}%</span>
        </div>
      </div>

      <!-- 自定义模式提示 -->
      <div v-if="useCustomSlot" class="custom-tip">
        <span class="tip-badge">V2</span>
        <span
          >自定义 <code>#backToBottom</code> 插槽时，icon / 颜色 /
          大小等视觉属性失效，但
          <strong>backButtonPosition</strong
          >（位置定位）由外层容器控制，上方定位滑块<strong>仍然实时生效</strong>。</span
        >
      </div>

      <!-- 操作按钮 -->
      <el-divider style="margin: 10px 0" />
      <div class="action-buttons">
        <el-button
          type="primary"
          plain
          size="small"
          @click="appendMessage('user')"
        >
          + 用户消息
        </el-button>
        <el-button
          type="success"
          plain
          size="small"
          @click="appendMessage('ai')"
        >
          + AI 回复
        </el-button>
        <el-button size="small" @click="resetConversation">
          重置会话
        </el-button>
      </div>

      <!-- 行为说明 -->
      <div
        class="behavior-hint"
        :class="autoScrollEnabled ? 'hint-on' : 'hint-off'"
      >
        <div class="hint-icon">
          {{ autoScrollEnabled ? '✅' : '⚠️' }}
        </div>
        <div class="hint-text">
          <template v-if="autoScrollEnabled">
            <strong>autoScroll 开启中</strong><br />
            追加消息后自动滚到底部，<strong>unreadCount 始终为 0</strong
            >，回底按钮不会出现。<br />
            尝试：先向上滚动一段距离，再点「+ 用户消息」，观察是否仍自动回底。
          </template>
          <template v-else>
            <strong>autoScroll 已关闭</strong><br />
            追加消息后<strong>不自动滚动</strong>，未读数逐条 +1，状态变为
            <code>HAS_NEW_MESSAGES</code>，回底按钮浮现并带<span
              class="badge-preview"
              >红色数字角标</span
            >。<br />
            点击回底按钮后未读清零，状态恢复 <code>AT_BOTTOM</code>。
          </template>
        </div>
      </div>
    </div>

    <!-- ====== BubbleList ====== -->
    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="list"
        :auto-scroll="autoScrollEnabled"
        :always-show-scrollbar="alwaysShowScrollbar"
        :show-back-button="true"
        :btn-color="useCustomSlot ? undefined : btnColor"
        :btn-loading="useCustomSlot ? undefined : btnLoading"
        :back-button-position="backButtonPosition"
        :btn-icon-size="useCustomSlot ? undefined : btnSize"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <!-- 自定义回底按钮（带未读角标） -->
        <template v-if="useCustomSlot" #backToBottom="context">
          <div
            class="custom-back-btn"
            :class="{ 'has-unread': context.unreadCount > 0 }"
            @click="context.scrollToBottom(true)"
          >
            <span class="custom-back-btn__icon">↓</span>
            <span class="custom-back-btn__text">
              {{
                context.unreadCount > 0
                  ? `${context.unreadCount > 99 ? '99+' : context.unreadCount} 条新消息`
                  : '回到底部'
              }}
            </span>
            <span v-if="context.unreadCount > 0" class="custom-back-btn__badge">
              {{ context.unreadCount > 99 ? '99+' : context.unreadCount }}
            </span>
          </div>
        </template>
      </BubbleList>
    </div>

    <!-- ====== 状态栏 ====== -->
    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">scrollState</span>
        <el-tag
          :type="
            scrollState === 'AT_BOTTOM'
              ? 'success'
              : scrollState === 'SCROLLED_UP'
                ? 'warning'
                : 'danger'
          "
          size="small"
        >
          {{ scrollState }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">unreadCount</span>
        <el-tag :type="unreadCount > 0 ? 'danger' : 'info'" size="small">
          {{ unreadCount }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">autoScroll</span>
        <el-tag :type="autoScrollEnabled ? 'success' : 'danger'" size="small">
          {{ autoScrollEnabled ? 'ON' : 'OFF' }}
        </el-tag>
      </div>
      <div class="status-item">
        <span class="status-label">按钮模式</span>
        <el-tag :type="useCustomSlot ? 'warning' : 'info'" size="small">
          {{ useCustomSlot ? '自定义插槽' : '内置默认' }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.back-btn-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
}

// ---- 控制面板 ----
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 14px;

  .panel-section {
    display: flex;
    flex-direction: column;
    gap: 6px;

    & + .panel-section {
      margin-top: 6px;
      padding-top: 10px;
      border-top: 1px dashed #dcdfe6;
    }
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 2px;
  }

  .control-row {
    display: flex;
    align-items: center;
    gap: 10px;

    .control-label {
      font-size: 13px;
      color: #606266;
      min-width: 100px;
    }

    .control-value {
      font-size: 12px;
      color: #409eff;
      min-width: 36px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  }

  .core-switch {
    background: #fafafa;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .switch-label {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        color: #303133;
        font-size: 14px;
      }
      .switch-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  // 行为说明卡片
  .behavior-hint {
    margin-top: 4px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.65;
    display: flex;
    gap: 8px;

    &.hint-on {
      background: #f0f9eb;
      border: 1px solid #e1f3d8;
      color: #67c23a;
    }

    &.hint-off {
      background: #fef0f0;
      border: 1px solid #fde2e2;
      color: #f56c6c;
    }

    .hint-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    strong {
      font-weight: 600;
    }
    code {
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }
    .badge-preview {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: #f56c6c;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      vertical-align: middle;
    }
  }

  // V2 自定义提示
  .custom-tip {
    margin-top: 4px;
    padding: 10px 12px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f0f9eb 0%, #ecf5ff 100%);
    border: 1px solid #e1f3d8;
    font-size: 13px;
    color: #606266;
    line-height: 1.6;

    .tip-badge {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 4px;
      background: #67c23a;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      margin-right: 6px;
      vertical-align: middle;
    }

    code {
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }
  }
}

// ---- 状态栏 ----
.status-bar {
  display: flex;
  gap: 16px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-label {
      font-size: 12px;
      color: #909399;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  }
}

// ---- 自定义回底按钮（带未读角标） ----
.custom-back-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.35);
  transition: all 0.25s ease;
  user-select: none;
  z-index: 10;

  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
    background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  }

  &:active {
    transform: translateX(-50%) scale(0.96);
  }

  &.has-unread {
    animation: pulse-red 1.5s ease-in-out infinite;
  }

  &__icon {
    font-size: 16px;
    font-weight: 700;
  }

  &__text {
    white-space: nowrap;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #f56c6c;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
  }
}

@keyframes pulse-red {
  0%,
  100% {
    box-shadow: 0 4px 14px rgba(64, 158, 255, 0.35);
  }
  50% {
    box-shadow:
      0 4px 20px rgba(245, 108, 108, 0.6),
      0 0 0 4px rgba(245, 108, 108, 0.15);
  }
}
</style>

```

### bidirectional-loading

```vue
<docs>
---
title: 双向分页加载
---

向上滚到顶部触发 `@load-more-top`，向下滚到底部触发 `@load-more-bottom`。数据准备完毕后调用 `loadMoreTopComplete()` / `loadMoreBottomComplete()` 通知组件，滚动位置自动修复，无需手动处理跳动。

通过 `topStatus` / `bottomStatus` 属性（`{ type, text }`）控制边界状态区的展示（`loading` / `no-more`），配合 `#topStatus` / `#bottomStatus` 插槽自定义 UI。
</docs>

<script setup lang="ts">
import type {
  BubbleListBoundaryState,
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';
import { computed } from 'vue';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  avatarSize?: string;
  avatarGap?: string;
  shape?: string;
  variant?: string;
}

const MAX_HISTORY_BATCHES = 3;
const MAX_BOTTOM_BATCHES = 2;
const PAGE_SIZE = 6;

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const historyBatchCount = ref(0);
const bottomBatchCount = ref(0);
const topTriggerCount = ref(0);
const bottomTriggerCount = ref(0);
const topLoading = ref(false);
const bottomLoading = ref(false);
const lastAction = ref(
  '手动滚动到顶部触发历史加载，回到底部继续向下滚动可触发更多消息。'
);

let nextKey = 0;
let topTimer: number | null = null;
let bottomTimer: number | null = null;

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
    variant: isUser ? 'outlined' : 'filled'
  };
}

function createBatch(label: string, startRole: 'ai' | 'user'): MessageItem[] {
  const batch: MessageItem[] = [];
  for (let i = 0; i < PAGE_SIZE; i++) {
    const role =
      startRole === 'ai'
        ? i % 2 === 0
          ? 'ai'
          : 'user'
        : i % 2 === 0
          ? 'user'
          : 'ai';
    const step = i + 1;
    batch.push(
      createMessage(
        nextKey + i + 1,
        role,
        role === 'user'
          ? `${label} 用户消息 ${step}：用于验证滚动位置、回底按钮和分页触发。`
          : `${label} AI 回复 ${step}：这条消息会刻意保持不同长度，用来验证变高气泡与自动跟随是否稳定。`.repeat(
              step % 3 === 0 ? 2 : 1
            )
      )
    );
  }
  return batch;
}

function buildSeedList(): MessageItem[] {
  const list: MessageItem[] = [];
  for (let i = 0; i < 16; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    list.push(
      createMessage(
        i + 1,
        role,
        role === 'ai' ? `初始 AI 消息 ${i + 1}` : `初始用户消息 ${i + 1}`
      )
    );
  }
  nextKey = list.length;
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  historyBatchCount.value = 0;
  bottomBatchCount.value = 0;
  topTriggerCount.value = 0;
  bottomTriggerCount.value = 0;
  topLoading.value = false;
  bottomLoading.value = false;
  lastAction.value =
    '手动滚动到顶部触发历史加载，回到底部继续向下滚动可触发更多消息。';
  return list;
}

function resetConversation() {
  bubbleItems.value = buildSeedList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

// ---- 边界状态计算 ----
const topStatus = computed<BubbleListBoundaryState | null>(() => {
  if (topLoading.value)
    return { type: 'loading', text: '正在加载更早的历史消息...' };
  if (historyBatchCount.value >= MAX_HISTORY_BATCHES)
    return { type: 'no-more', text: '历史消息已经全部加载完毕' };
  return null;
});

const bottomStatus = computed<BubbleListBoundaryState | null>(() => {
  if (bottomLoading.value)
    return { type: 'loading', text: '正在加载更多消息...' };
  if (bottomBatchCount.value >= MAX_BOTTOM_BATCHES)
    return { type: 'no-more', text: '已经展示全部可加载消息' };
  return null;
});

// ---- 分页事件处理 ----
function handleLoadMoreTop() {
  topTriggerCount.value += 1;
  if (topLoading.value) return;

  topLoading.value = true;
  const n = historyBatchCount.value + 1;

  topTimer = window.setTimeout(() => {
    if (historyBatchCount.value >= MAX_HISTORY_BATCHES) {
      lastAction.value = '顶部历史消息已全部加载完毕。';
      topLoading.value = false;
      topTimer = null;
      bubbleListRef.value?.loadMoreTopComplete();
      return;
    }

    const items = createBatch(`历史批次 ${n}`, n % 2 === 0 ? 'user' : 'ai');
    nextKey += items.length;
    bubbleItems.value = [...items, ...bubbleItems.value];
    historyBatchCount.value = n;
    topLoading.value = false;
    lastAction.value = `顶部加载完成：已插入历史批次 ${n}。`;
    topTimer = null;
    nextTick(() => {
      bubbleListRef.value?.loadMoreTopComplete();
    });
  }, 600);
}

function handleLoadMoreBottom() {
  bottomTriggerCount.value += 1;
  if (bottomLoading.value) return;

  bottomLoading.value = true;
  const n = bottomBatchCount.value + 1;

  bottomTimer = window.setTimeout(() => {
    if (bottomBatchCount.value >= MAX_BOTTOM_BATCHES) {
      lastAction.value = '底部更多消息已全部加载完毕。';
      bottomLoading.value = false;
      bottomTimer = null;
      bubbleListRef.value?.loadMoreBottomComplete();
      return;
    }

    const items = createBatch(`底部批次 ${n}`, n % 2 === 0 ? 'ai' : 'user');
    nextKey += items.length;
    bubbleItems.value = [...bubbleItems.value, ...items];
    bottomBatchCount.value = n;
    bottomLoading.value = false;
    lastAction.value = `底部加载完成：已追加批次 ${n}。`;
    bottomTimer = null;
    nextTick(() => {
      bubbleListRef.value?.loadMoreBottomComplete();
    });
  }, 600);
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}
function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});
onUnmounted(() => {
  if (topTimer) window.clearTimeout(topTimer);
  if (bottomTimer) window.clearTimeout(bottomTimer);
});
</script>

<template>
  <div class="bidirectional-demo">
    <div class="tip-banner">
      <span class="tip-icon">↕</span>
      <span
        >先<strong>向上滚动</strong>到顶部触发历史加载，再<strong>向下滚动</strong>到底部触发更多消息。观察边界状态区的
        loading → no-more 切换。</span
      >
    </div>

    <div class="toolbar-group">
      <div class="btn-list">
        <el-button
          size="small"
          type="primary"
          plain
          @click="bubbleListRef?.scrollToTop()"
        >
          滚到顶部
        </el-button>
        <el-button
          size="small"
          type="primary"
          plain
          @click="bubbleListRef?.scrollToBottom()"
        >
          滚到底部
        </el-button>
        <el-button size="small" type="info" plain @click="resetConversation">
          重置数据
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span
        ><strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span><strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>顶部触发次数</span><strong>{{ topTriggerCount }}</strong>
      </div>
      <div class="status-chip">
        <span>底部触发次数</span><strong>{{ bottomTriggerCount }}</strong>
      </div>
      <div class="status-chip">
        <span>历史批次</span
        ><strong>{{ historyBatchCount }}/{{ MAX_HISTORY_BATCHES }}</strong>
      </div>
      <div class="status-chip">
        <span>底部批次</span
        ><strong>{{ bottomBatchCount }}/{{ MAX_BOTTOM_BATCHES }}</strong>
      </div>
    </div>

    <div class="activity-bar">
      <span>最近动作</span><strong>{{ lastAction }}</strong>
      <small>
        顶部加载中：{{ topLoading ? '是' : '否' }}，底部加载中：{{
          bottomLoading ? '是' : '否'
        }}</small
      >
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :top-status="topStatus"
        :bottom-status="bottomStatus"
        @load-more-top="handleLoadMoreTop"
        @load-more-bottom="handleLoadMoreBottom"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #topStatus="{ status }">
          <div class="edge-status" :data-state="status.type">
            <span class="edge-status__dot" /><span>{{ status.text }}</span>
          </div>
        </template>

        <template #bottomStatus="{ status }">
          <div class="edge-status" :data-state="status.type">
            <span class="edge-status__dot" /><span>{{ status.text }}</span>
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bidirectional-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  .tip-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f0f9eb 0%, #ecf5ff 100%);
    border: 1px solid #e1f3d8;
    font-size: 13px;
    color: #67c23a;
    .tip-icon {
      font-size: 18px;
      font-weight: 700;
    }
    strong {
      color: #303133;
    }
  }

  .toolbar-group {
    min-height: 0;
  }
  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
      line-height: 1;
    }
    strong {
      font-size: 13px;
      color: #0f172a;
      line-height: 1;
      &.state-at_bottom {
        color: #67c23a;
      }
      &.state-scrolled_up {
        color: #e6a23c;
      }
      &.state-has_new_messages {
        color: #f56c6c;
      }
    }
  }

  .activity-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
    }
    strong {
      font-size: 13px;
      color: #1e3a8a;
    }
    small {
      color: #64748b;
      font-size: 12px;
      margin-left: 4px;
    }
  }

  .story-stage {
    min-height: 520px;
    height: 520px;
    padding: 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
  }

  .story-stage :deep(.elx-bubble-list) {
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1 1 0;
    overflow: hidden;
  }
}

.edge-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.24);
  font-size: 13px;
  color: #475569;
  &[data-state='loading'] {
    color: #1d4ed8;
  }
  &[data-state='no-more'] {
    color: #64748b;
  }
}
.edge-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.8;
}
</style>

```

### customized

```vue
<docs>
---
title: 插槽自定义
---

通过 9 个插槽完全接管列表渲染：`#avatar`、`#header`、`#content`、`#footer`、`#loading` 控制每条气泡的各部分；`#backToBottom` 自定义回底按钮（含未读角标）；`#topStatus` / `#bottomStatus` 自定义边界状态区；`#item` 渲染非气泡类型节点。
</docs>

<script setup lang="ts">
import type {
  BubbleListBoundaryState,
  BubbleListItemProps,
  BubbleListProps
} from 'vue-element-plus-x/types/BubbleList';
import {
  ArrowDown,
  Bell,
  Bottom,
  DocumentCopy,
  Refresh,
  Search,
  Star,
  Top
} from '@element-plus/icons-vue';

type listType = BubbleListItemProps & {
  key: number;
  role: 'user' | 'ai' | 'system';
};

// 示例调用
const bubbleItems = ref<BubbleListProps<listType>['list']>(
  generateFakeItems(16)
);
const avatar = ref('https://avatars.githubusercontent.com/u/76239030?v=4');
const avartAi = ref(
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
);
const switchValue = ref(false);
const loading = ref(false);

// 边界状态（用于 topStatus / bottomStatus 插槽）
const topStatus = ref<BubbleListBoundaryState | null>(null);
const bottomStatus = ref<BubbleListBoundaryState | null>(null);

function generateFakeItems(count: number): listType[] {
  const messages: listType[] = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    const key = i + 1;
    messages.push({
      key,
      role,
      placement,
      noStyle: true // 如果你不想用默认的气泡样式
    });
  }
  return messages;
}

// 设置某个 item 的 loading
function setLoading(loading: boolean) {
  bubbleItems.value[bubbleItems.value.length - 1].loading = loading;
  bubbleItems.value[bubbleItems.value.length - 2].loading = loading;
}

/** 插入一条系统通知（走 #item 插槽） */
function addNotice() {
  bubbleItems.value.push({
    key: bubbleItems.value.length + 1,
    role: 'system',
    placement: 'start',
    type: 'notice'
  } as listType);
}

/** 模拟顶部加载更多 */
function triggerTopLoad() {
  topStatus.value = { type: 'loading', text: '正在加载更早的消息...' };
  setTimeout(() => {
    bubbleItems.value.unshift(
      { key: Date.now(), role: 'ai', placement: 'start', noStyle: true },
      { key: Date.now() + 1, role: 'user', placement: 'end', noStyle: true }
    );
    topStatus.value = null;
  }, 1500);
}

/** 模拟底部加载更多 */
function triggerBottomLoad() {
  bottomStatus.value = { type: 'loading', text: '正在加载更多消息...' };
  setTimeout(() => {
    bubbleItems.value.push({
      key: Date.now(),
      role: 'ai',
      placement: 'start',
      noStyle: true
    });
    bottomStatus.value = null;
  }, 1500);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <!-- 控制区 -->
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
      <span>动态设置内容 <el-switch v-model="switchValue" /></span>
      <span
        >自定义 loading
        <el-switch
          v-model="loading"
          @change="(value: any) => setLoading(value as boolean)"
        />
      </span>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
      <el-button type="primary" @click="addNotice">
        + 系统通知（#item）
      </el-button>
      <el-button type="primary" :icon="Top" @click="triggerTopLoad">
        顶部加载
      </el-button>
      <el-button type="primary" :icon="Bottom" @click="triggerBottomLoad">
        底部加载
      </el-button>
      <el-button @click="() => bubbleItems.unshift(...generateFakeItems(3))">
        +3 条消息（便于观察回底按钮）
      </el-button>
    </div>

    <div class="story-stage">
      <BubbleList
        :list="bubbleItems"
        :top-status="topStatus"
        :bottom-status="bottomStatus"
        show-back-button
      >
        <!-- ====== 1. #avatar 自定义头像 ====== -->
        <template #avatar="{ item }">
          <div class="avatar-wrapper">
            <img :src="item.role === 'ai' ? avartAi : avatar" alt="avatar" />
          </div>
        </template>

        <!-- ====== 2. #header 自定义头部 ====== -->
        <template #header="{ item }">
          <div class="header-wrapper">
            <div class="header-name">
              {{ item.role === 'ai' ? 'Element Plus X 🍧' : '🧁 用户' }}
            </div>
          </div>
        </template>

        <!-- ====== 3. #content 自定义气泡内容 ====== -->
        <template #content="{ item }">
          <div class="content-wrapper">
            <div class="content-text">
              {{
                item.role === 'ai'
                  ? `${switchValue ? `#ai-${item.key}：` : ''} 💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~`
                  : `${switchValue ? `#user-${item.key}：` : ''}哈哈哈，让我试试`
              }}
            </div>
          </div>
        </template>

        <!-- ====== 4. #footer 自定义底部操作栏 ====== -->
        <template #footer="{ item }">
          <div class="footer-wrapper">
            <div class="footer-container">
              <el-button type="info" :icon="Refresh" size="small" circle />
              <el-button type="success" :icon="Search" size="small" circle />
              <el-button type="warning" :icon="Star" size="small" circle />
              <el-button
                color="#626aef"
                :icon="DocumentCopy"
                size="small"
                circle
              />
            </div>
            <div class="footer-time">
              {{ item.role === 'ai' ? '下午 2:32' : '下午 2:33' }}
            </div>
          </div>
        </template>

        <!-- ====== 5. #loading 自定义加载动画 ====== -->
        <template #loading="{ item }">
          <div class="loading-container">
            <span>#{{ item.role }}-{{ item.key }}：</span>
            <span>我</span>
            <span>是</span>
            <span>自</span>
            <span>定</span>
            <span>义</span>
            <span>加</span>
            <span>载</span>
            <span>内</span>
            <span>容</span>
            <span>哦</span>
            <span>~</span>
          </div>
        </template>

        <!-- ====== 6. #backToBottom 自定义回底按钮（含未读角标） ====== -->
        <template #backToBottom="{ unreadCount: uc, scrollToBottom }">
          <div class="custom-back-btn" @click="scrollToBottom(false)">
            <el-icon :size="14">
              <ArrowDown />
            </el-icon>
            <span>{{ uc > 0 ? `${uc} 条新消息` : '回到底部' }}</span>
            <span v-if="uc > 0" class="unread-badge">{{
              uc > 99 ? '99+' : uc
            }}</span>
          </div>
        </template>

        <!-- ====== 7. #topStatus 自定义顶部边界状态 ====== -->
        <template #topStatus="{ status }">
          <div class="boundary-custom boundary-top">
            <el-icon
              v-if="status.type === 'loading'"
              class="is-loading"
              :size="14"
            >
              <Refresh />
            </el-icon>
            <span>{{ status.text || `顶部 ${status.type}` }}</span>
            <el-tag size="small" type="info" effect="plain">
              #topStatus
            </el-tag>
          </div>
        </template>

        <!-- ====== 8. #bottomStatus 自定义底部边界状态 ====== -->
        <template #bottomStatus="{ status }">
          <div class="boundary-custom boundary-bottom">
            <el-icon
              v-if="status.type === 'loading'"
              class="is-loading"
              :size="14"
            >
              <Refresh />
            </el-icon>
            <span>{{ status.text || `底部 ${status.type}` }}</span>
            <el-tag size="small" type="info" effect="plain">
              #bottomStatus
            </el-tag>
          </div>
        </template>

        <!-- ====== 9. #item 非气泡类型自定义渲染 ====== -->
        <template #item="{ index, itemType }">
          <div class="custom-notice-item">
            <el-icon :size="16" color="#e6a23c">
              <Bell />
            </el-icon>
            <span
              >[{{ itemType }}] 系统通知 — 这是通过 #item
              插槽自定义渲染的内容（index={{ index }}）</span
            >
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="less">
.story-stage {
  height: 450px;
  padding: 8px 10px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* ── 1. avatar ── */
.avatar-wrapper {
  width: 40px;
  height: 40px;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

/* ── 2. header ── */
.header-wrapper {
  .header-name {
    font-size: 14px;
    color: #979797;
  }
}

/* ── 3. content ── */
.content-wrapper {
  .content-text {
    font-size: 14px;
    color: #333;
    padding: 12px;
    background: linear-gradient(to right, #fdfcfb 0%, #ffd1ab 100%);
    border-radius: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* ── 4. footer ── */
.footer-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  .footer-time {
    font-size: 12px;
    margin-top: 3px;
  }
}

.footer-container {
  :deep(.el-button + .el-button) {
    margin-left: 8px;
  }
}

/* ── 5. loading ── */
.loading-container {
  font-size: 14px;
  color: #333;
  padding: 12px;
  background: linear-gradient(to right, #fdfcfb 0%, #ffd1ab 100%);
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container span {
  display: inline-block;
  margin-left: 8px;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(5px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.loading-container span:nth-child(4n) {
  animation: bounce 1.2s ease infinite;
}
.loading-container span:nth-child(4n + 1) {
  animation: bounce 1.2s ease infinite;
  animation-delay: 0.3s;
}
.loading-container span:nth-child(4n + 2) {
  animation: bounce 1.2s ease infinite;
  animation-delay: 0.6s;
}
.loading-container span:nth-child(4n + 3) {
  animation: bounce 1.2s ease infinite;
  animation-delay: 0.9s;
}

/* ── 6. backToBottom 自定义回底按钮 ── */
.custom-back-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: all 0.25s ease;
  user-select: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.55);
  }
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #f56c6c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  animation: badge-pulse 1.5s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.55);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(245, 108, 108, 0);
  }
}

/* ── 7 & 8. topStatus / bottomStatus ── */
.boundary-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #606266;

  &.boundary-top {
    background: linear-gradient(90deg, #ecf5ff 0%, transparent 100%);
    border: 1px dashed #b3d8ff;
  }

  &.boundary-bottom {
    background: linear-gradient(90deg, transparent 0%, #ecf5ff 100%);
    border: 1px dashed #b3d8ff;
  }

  .el-icon {
    color: #409eff;
  }
}

/* ── 9. item 非气泡自定义项 ── */
.custom-notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin: 4px 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #fdf6ec 0%, #faecd8 100%);
  border-left: 3px solid #e6a23c;
  font-size: 13px;
  color: #996633;
}
</style>

```

### fog-effect

```vue
<docs>
---
title: 雾化效果
---

通过 `enable-animate` 属性实现打字机雾化效果，模拟 AI 流式输出场景。
</docs>

<script setup lang="ts">
import 'katex/dist/katex.min.css';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const STREAM_TICK_MS = 50;
const STREAM_CHARS_PER_TICK = 6;

const list = ref([
  {
    key: '1',
    content: '你好！请帮我介绍一下 BubbleList 的雾化效果。',
    placement: 'end' as const,
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    role: 'user'
  },
  {
    key: '2',
    content: '',
    placement: 'start' as const,
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    role: 'ai'
  }
]);

const isStreaming = ref(false);
let streamTimer: number | null = null;
let streamCharacters: string[] = [];
let streamOffset = 0;

const fullMarkdown = `### 雾化效果介绍

**雾化效果**（Fog / Animate）是 \`x-markdown-vue\` 的 \`MarkdownRenderer\` 提供的一种平滑过渡动画：

- 新增文字以**渐显**方式出现，而非生硬地追加
- 配合流式输出，能模拟 AI **逐段回复**的视觉体验
- 仅需设置 \`enable-animate\` 即可开启

#### 代码示例

\`\`\`vue
<MarkdownRenderer
  :markdown="content"
  :enable-animate="true"
/>
\`\`\`

#### 公式支持

行内公式 $E = mc^2$，块级公式同样适用：

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

> 提示：雾化效果在流式场景下体验最佳，配合 BubbleList 自动追底使用更流畅。`;

function startStreaming() {
  if (isStreaming.value) return;

  // 重置 AI 消息
  list.value[1].content = '';
  streamOffset = 0;
  streamCharacters = Array.from(fullMarkdown);

  const initialChunk = streamCharacters
    .slice(0, STREAM_CHARS_PER_TICK)
    .join('');
  streamOffset = initialChunk.length;
  list.value[1].content = initialChunk;
  isStreaming.value = true;

  streamTimer = window.setInterval(() => {
    if (streamOffset >= streamCharacters.length) {
      stopStreaming();
      return;
    }
    const nextChunk = streamCharacters
      .slice(streamOffset, streamOffset + STREAM_CHARS_PER_TICK)
      .join('');
    list.value[1].content += nextChunk;
    streamOffset += nextChunk.length;

    if (streamOffset >= streamCharacters.length) {
      stopStreaming();
    }
  }, STREAM_TICK_MS);
}

function stopStreaming() {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer);
    streamTimer = null;
  }
  isStreaming.value = false;
}

function resetStreaming() {
  stopStreaming();
  list.value[1].content = '';
}

onMounted(() => {
  startStreaming();
});

onUnmounted(() => {
  stopStreaming();
});
</script>

<template>
  <div class="fog-demo-container">
    <div class="btn-list">
      <el-button type="primary" :disabled="isStreaming" @click="startStreaming">
        开始流式输出
      </el-button>
      <el-button :disabled="!isStreaming" @click="stopStreaming">
        停止
      </el-button>
      <el-button @click="resetStreaming"> 重置 </el-button>
    </div>

    <div class="list-stage">
      <BubbleList :list="list" max-height="420px">
        <template #content="{ item }">
          <div v-if="item.role === 'ai'" class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="item.content || ''"
              :enable-animate="true"
            />
            <pre v-else>{{ item.content }}</pre>
          </div>
          <span v-else>{{ item.content }}</span>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fog-demo-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .btn-list {
    display: flex;
    gap: 12px;
  }

  .list-stage {
    height: 420px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
}

.markdown-content-wrapper {
  word-break: break-word;
  color: #24292e;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.25;
    &:first-child {
      margin-top: 0;
    }
  }

  :deep(p) {
    margin-top: 0;
    margin-bottom: 8px;
    line-height: 1.6;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin-top: 0;
    margin-bottom: 8px;
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(li) {
    margin: 4px 0;
    line-height: 1.6;
  }

  :deep(code):not(pre code) {
    background-color: rgba(27, 31, 35, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family:
      ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Consolas,
      monospace;
    font-size: 85%;
  }

  :deep(blockquote) {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 8px 0;
  }
}

:deep(.x-md-code-block) {
  pre {
    background-color: #f6f8fa !important;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;

    code {
      font-family:
        ui-monospace,
        SFMono-Regular,
        SF Mono,
        Menlo,
        Consolas,
        monospace;
      font-size: 14px;
      line-height: 1.5;

      .line {
        display: block;
        min-height: 1rem;
      }
    }
  }
}
</style>

```

### list

```vue
<docs>
---
title: 基础使用
---

通过 `list` 数组快速渲染一组对话气泡。数组中每个对象会透传给内置的 `Bubble` 组件，`Bubble` 的所有属性（`content`、`placement`、`loading`、`shape`、`variant` 等）都可以直接配置，消息的增删改只需维护这个数组即可。

::: tip
通过 `max-height` 属性或父容器高度控制列表高度，内容溢出时自动出现滚动条。每个 item 的详细属性可参考 [Bubble 文档](/zh/components/bubble)。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListItemProps,
  BubbleListProps
} from 'vue-element-plus-x/types/BubbleList';

type listType = BubbleListItemProps & {
  key: number;
  role: 'user' | 'ai';
  isMarkdown?: boolean;
  typing?: boolean;
  isFog?: boolean;
};

// 示例调用
const list: BubbleListProps<listType>['list'] = generateFakeItems(5);

function generateFakeItems(count: number): listType[] {
  const messages: listType[] = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    const key = i + 1;
    const content =
      role === 'ai'
        ? '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'.repeat(
            5
          )
        : `哈哈哈，让我试试`;
    const loading = false;
    const shape = 'corner';
    const variant = role === 'ai' ? 'filled' : 'outlined';
    const isMarkdown = false;
    const typing = role === 'ai' ? i === count - 1 : false;
    const avatar =
      role === 'ai'
        ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        : 'https://avatars.githubusercontent.com/u/76239030?v=4';

    messages.push({
      key, // 唯一标识
      role, // user | ai 自行更据模型定义
      placement, // start | end 气泡位置
      content, // 消息内容 流式接受的时候，只需要改这个值即可
      loading, // 当前气泡的加载状态
      shape, // 气泡的形状
      variant, // 气泡的样式
      isMarkdown, // 是否渲染为 markdown
      typing, // 是否开启打字器效果 该属性不会和流式接受冲突
      isFog: role === 'ai', // 是否开启打字雾化效果，该效果 v1.1.6 新增，且在 typing 为 true 时生效，该效果会覆盖 typing 的 suffix 属性
      avatar,
      avatarSize: '24px', // 头像占位大小
      avatarGap: '12px' // 头像与气泡之间的距离
    });
  }
  return messages;
}
</script>

<template>
  <div class="story-stage">
    <BubbleList :list="list" />
  </div>
</template>

<style scoped lang="scss">
.story-stage {
  height: 450px;
  padding: 8px 10px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
</style>

```

### mixed-nodes

```vue
<docs>
---
title: 混合节点（#item 插槽）
---

列表中除气泡消息外，可以混入任意类型的节点（日期分隔线、系统提示、历史加载标记等）。通过 `itemType` 属性或解析函数标记非气泡节点，命中后走 `#item` 插槽渲染，普通消息仍走默认 Bubble。

插槽上下文 `{ item, index, itemType }` 用于区分节点类型，渲染不同 UI。虚拟滚动中特殊节点的高度同样会自动测量。
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListItemContext,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface TimelineItem {
  key: number;
  role: 'user' | 'ai' | 'system';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  avatarSize?: string;
  itemType?: 'date-divider' | 'history-divider' | 'system-tip';
  tone?: 'info' | 'success' | 'warning';
  noStyle?: boolean;
}

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<TimelineItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
let nextKey = 0;

function createMessage(
  key: number,
  role: 'user' | 'ai',
  content: string
): TimelineItem {
  const isUser = role === 'user';
  return {
    key,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '32px',
    noStyle: false
  };
}

function createNode(
  itemType: TimelineItem['itemType'],
  content: string,
  tone: TimelineItem['tone'] = 'info'
): TimelineItem {
  nextKey += 1;
  return {
    key: nextKey,
    role: 'system',
    itemType,
    tone,
    content,
    placement: 'start',
    avatar: '',
    noStyle: true
  };
}

function buildInitialList(): TimelineItem[] {
  const base: TimelineItem[] = [];
  for (let i = 0; i < 6; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    base.push(
      createMessage(
        i + 1,
        role,
        role === 'ai'
          ? `初始 AI 消息 ${i + 1}：用于验证混合节点的滚动稳定性。`
          : `初始用户消息 ${i + 1}`
      )
    );
  }

  nextKey = base.length;
  base.splice(2, 0, createNode('history-divider', '以上为历史消息', 'info'));
  base.splice(
    6,
    0,
    createNode('date-divider', '2026 年 4 月 16 日 14:30', 'success')
  );
  base.push(
    createNode(
      'system-tip',
      '系统提示：当前会话已切换到新的回答策略。',
      'warning'
    )
  );

  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  return base;
}

function resetConversation() {
  bubbleItems.value = buildInitialList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function appendAiMessage() {
  bubbleItems.value.push(
    createMessage(
      ++nextKey,
      'ai',
      'AI 继续回复：验证特殊节点夹在普通消息之间时，自动滚底和未读计数是否准确。'
    )
  );
}

function appendDateDivider() {
  bubbleItems.value.push(
    createNode(
      'date-divider',
      `2026 年 4 月 16日 ${String(15 + (nextKey % 9))}:${String(nextKey % 60).padStart(2, '0')}`,
      'success'
    )
  );
}

function appendHistoryDivider() {
  bubbleItems.value.push(
    createNode('history-divider', '已切换到另一段历史消息', 'info')
  );
}

function appendSystemTip() {
  bubbleItems.value.push(
    createNode(
      'system-tip',
      '系统提示：模型正在整理更长的上下文，请稍候。',
      'warning'
    )
  );
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}
function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

function resolveToneClass(context: BubbleListItemContext<TimelineItem>) {
  if (context.itemType === 'date-divider') return 'is-success';
  return context.item.tone === 'warning' ? 'is-warning' : 'is-info';
}

onMounted(() => {
  resetConversation();
});
</script>

<template>
  <div class="mixed-nodes-demo">
    <div class="demo-note">
      <div class="demo-title">混合节点 / 统一 item 插槽</div>
      <p>
        普通消息继续使用默认 Bubble 渲染；当 item 中包含特殊标识符时，统一走
        <code>#item</code> 插槽。
        这里演示日期节点、历史分隔节点和系统提示节点共存于同一条时间线里。
      </p>
    </div>

    <div class="toolbar-group">
      <div class="btn-list">
        <el-button type="primary" plain @click="appendAiMessage">
          追加 AI 消息
        </el-button>
        <el-button type="success" plain @click="appendDateDivider">
          插入日期节点
        </el-button>
        <el-button type="info" plain @click="appendHistoryDivider">
          插入历史分隔
        </el-button>
        <el-button type="warning" plain @click="appendSystemTip">
          插入系统提示
        </el-button>
        <el-button type="info" plain @click="resetConversation">
          重置时间线
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-card">
        <span>滚动状态</span
        ><strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-card">
        <span>未读计数</span><strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-card">
        <span>节点总数</span><strong>{{ bubbleItems.length }}</strong>
      </div>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #item="context">
          <div class="timeline-node" :class="[resolveToneClass(context)]">
            <div
              v-if="context.itemType === 'history-divider'"
              class="timeline-node__history-wrap"
            >
              <span class="timeline-node__line" /><span
                class="timeline-node__text"
                >{{ context.item.content }}</span
              ><span class="timeline-node__line" />
            </div>
            <span
              v-else-if="context.itemType === 'date-divider'"
              class="timeline-node__pill"
              >{{ context.item.content }}</span
            >
            <div v-else class="timeline-node__system-wrap">
              <span class="timeline-node__icon">i</span
              ><span class="timeline-node__text">{{
                context.item.content
              }}</span>
            </div>
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mixed-nodes-demo {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .demo-note {
    padding: 14px 16px;
    border-radius: 14px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    p {
      margin: 8px 0 0;
      color: #475569;
      line-height: 1.6;
    }
    code {
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      font-family: ui-monospace, monospace;
      font-size: 12px;
    }
  }

  .demo-title {
    font-weight: 700;
    color: #1e3a8a;
    font-size: 15px;
  }
  .toolbar-group {
    display: grid;
    gap: 10px;
  }
  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .status-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  .status-card {
    display: grid;
    gap: 4px;
    padding: 10px 14px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    span {
      font-size: 12px;
      color: #64748b;
    }
    strong {
      font-size: 14px;
      color: #0f172a;
      &.state-at_bottom {
        color: #67c23a;
      }
      &.state-scrolled_up {
        color: #e6a23c;
      }
      &.state-has_new_messages {
        color: #f56c6c;
      }
    }
  }

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
}

.timeline-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 40px;
  color: #475569;
}
.timeline-node__history-wrap,
.timeline-node__system-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.timeline-node__line {
  flex: 1;
  max-width: 120px;
  height: 1px;
  background: currentColor;
  opacity: 0.25;
}
.timeline-node__pill,
.timeline-node__text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.24);
  text-align: center;
}
.timeline-node__icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: currentColor;
  color: #fff;
}
.is-info {
  color: #475569;
}
.is-success {
  color: #0f766e;
}
.is-warning {
  color: #b45309;
}
</style>

```

### scroll-to

```vue
<docs>
---
title: 滚动控制方法
---

通过组件实例的三个方法精确控制滚动位置：`scrollToTop()`、`scrollToBottom()`、`scrollToBubble(index)`，均支持传入 `smooth` 参数控制是否平滑滚动。

同时暴露 `currentScrollState` 和 `currentUnreadCount` 实例属性，也可监听 `@scroll-state-change` / `@unread-count-change` 事件实时感知状态（`AT_BOTTOM` / `SCROLLED_UP` / `HAS_NEW_MESSAGES`）。
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface listType {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  loading: boolean;
  shape: string;
  variant: string;
  avatar: string;
  avatarSize: string;
}

const bubbleItems = ref<listType[]>([]);
const bubbleListRef = ref<BubbleListInstance | null>(null);
const targetIndex = ref(0);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const autoScrollEnabled = ref(true);
let nextKey = 0;

function generateFakeItems(count: number): listType[] {
  const messages: listType[] = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    const placement = role === 'ai' ? 'start' : 'end';
    const key = i + 1;
    const content =
      role === 'ai'
        ? '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'
        : `哈哈哈，让我试试`;
    messages.push({
      key,
      role,
      placement,
      content,
      loading: false,
      shape: 'corner',
      variant: role === 'ai' ? 'filled' : 'outlined',
      avatar:
        role === 'ai'
          ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          : 'https://avatars.githubusercontent.com/u/76239030?v=4',
      avatarSize: '32px'
    });
  }
  return messages;
}

function createMessage(role: 'user' | 'ai', content: string): listType {
  nextKey += 1;
  const isUser = role === 'user';
  return {
    key: nextKey,
    role,
    placement: isUser ? 'end' : 'start',
    content,
    loading: false,
    shape: 'corner',
    variant: isUser ? 'outlined' : 'filled',
    avatar: isUser
      ? 'https://avatars.githubusercontent.com/u/76239030?v=4'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '32px'
  };
}

function resetConversation() {
  bubbleItems.value = generateFakeItems(10);
  nextKey = bubbleItems.value.length;
  targetIndex.value = Math.max(bubbleItems.value.length - 1, 0);
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function addMessage() {
  const i = bubbleItems.value.length;
  const isUser = !!(i % 2);
  const content = isUser
    ? '哈哈哈，让我试试'
    : '💖 感谢使用 Element Plus X ! 你的支持，是我们开源的最强动力 ~'.repeat(2);
  const msg = createMessage(isUser ? 'user' : 'ai', content);
  bubbleItems.value.push(msg);
  targetIndex.value = bubbleItems.value.length - 1;
}

function addUserMessage() {
  const msg = createMessage(
    'user',
    `用户补充问题 ${nextKey + 1}：请继续展开交互场景。`
  );
  bubbleItems.value.push(msg);
  targetIndex.value = bubbleItems.value.length - 1;
}

function addAiMessage() {
  const msg = createMessage(
    'ai',
    `AI 最新回复 ${nextKey + 1}：验证 autoScroll 开启时，消息自动滚动到底部。关闭后改为累计未读并显示回底按钮。`.repeat(
      (nextKey % 2) + 1
    )
  );
  bubbleItems.value.push(msg);
  targetIndex.value = bubbleItems.value.length - 1;
}

function addBurstMessages() {
  bubbleItems.value.push(
    createMessage('user', '连续追加：先插入一条短消息，观察列表锚点是否稳定。')
  );
  bubbleItems.value.push(
    createMessage(
      'ai',
      '第二条刻意拉长内容，验证多条消息一起追加时的滚动与动态高度表现。'.repeat(
        2
      )
    )
  );
  bubbleItems.value.push(
    createMessage('ai', '第三条保持较短，便于手动观察滚动位置是否贴底。')
  );
  targetIndex.value = bubbleItems.value.length - 1;
}

function clearMessage() {
  bubbleItems.value = [];
  nextKey = 0;
}

function scrollToTop() {
  bubbleListRef.value?.scrollToTop();
}

function scrollBottom() {
  bubbleListRef.value?.scrollToBottom();
}

function scrollToBubble() {
  const index = Math.min(
    targetIndex.value,
    Math.max(bubbleItems.value.length - 1, 0)
  );
  bubbleListRef.value?.scrollToBubble(index);
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});
</script>

<template>
  <div class="component-container">
    <div class="tip-banner">
      <span class="tip-icon">i</span>
      <span>
        <strong>V2 自动追底规则</strong>：<code>autoScroll</code>
        开启时（默认），追加消息会自动触底，未读计数始终为 0。
        <br />
        如需体验<strong>未读角标 + 回底按钮</strong>，请先将下方开关<strong
          >关闭 autoScroll</strong
        >，再手动向上滚动后追加消息——视图不动、未读 +1、回底按钮浮现，这正是 V2
        状态机的核心体验。
      </span>
    </div>

    <div class="top-wrap">
      <div class="btn-list" style="align-items: center">
        <span style="font-size: 13px; color: #606266"> autoScroll： </span>
        <el-switch
          v-model="autoScrollEnabled"
          active-text="开启（自动追底）"
          inactive-text="关闭（累计未读）"
        />
      </div>
      <div class="btn-list">
        <el-button type="primary" plain @click="addMessage">
          添加对话
        </el-button>
        <el-button type="primary" plain @click="addUserMessage">
          追加用户消息
        </el-button>
        <el-button type="primary" plain @click="addAiMessage">
          追加 AI 消息
        </el-button>
        <el-button type="warning" plain @click="addBurstMessages">
          连续追加 3 条
        </el-button>
        <el-button type="danger" plain @click="clearMessage">
          清空对话列表
        </el-button>
        <el-button type="primary" plain @click="scrollToTop">
          滚动到顶部
        </el-button>
        <el-button type="success" plain @click="scrollBottom">
          滚动到底部
        </el-button>
        <el-input-number
          v-model="targetIndex"
          :min="0"
          :max="Math.max(bubbleItems.length - 1, 0)"
          controls-position="right"
          size="default"
        />
        <el-button type="primary" plain @click="scrollToBubble">
          滚到第{{ targetIndex }}个气泡
        </el-button>
        <el-button type="info" plain @click="resetConversation">
          重置会话
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span>
        <strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span>
        <strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>消息总数</span>
        <strong>{{ bubbleItems.length }}</strong>
      </div>
      <div class="status-chip">
        <span>目标索引</span>
        <strong>{{ targetIndex }}</strong>
      </div>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :auto-scroll="autoScrollEnabled"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.component-container {
  padding: 12px;

  .tip-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
    border: 1px solid #d9ecff;
    margin-bottom: 16px;
    font-size: 13px;
    color: #409eff;

    .tip-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #409eff;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
  }

  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .top-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e4e7ed;

    span {
      font-size: 12px;
      color: #909399;
    }

    strong {
      font-size: 14px;
      color: #303133;
    }

    .state-at_bottom {
      color: #67c23a;
    }

    .state-scrolled_up {
      color: #e6a23c;
    }

    .state-has_new_messages {
      color: #f56c6c;
    }
  }

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
}
</style>

```

### streaming-follow

```vue
<docs>
---
title: 流式跟随
---

`autoScroll` 开启（默认）时，流式输出内容变高会自动贴底。用户上滑后跟随中断，回到底部后自动恢复——无需任何额外配置。

::: tip 自定义追底策略
如需自定义跟随逻辑（例如只有本端消息才强制追底），可通过 `shouldFollowContent` 回调接管决策。回调参数中的 `reason` 字段告知本次触发来源：`own-message`（本端发送）、`streaming`（流式增量）、`new-message`（新追加消息）。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';

interface MessageItem {
  key: number;
  role: 'user' | 'ai';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  avatarSize?: string;
  avatarGap?: string;
  shape?: string;
  variant?: string;
}

const STREAM_TICK_MS = 50;
const STREAM_CHARS_PER_TICK = 6;
const STREAM_TOTAL_TICKS = 120;

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const streamTick = ref(0);
const emittedCharCount = ref(0);
const streamCharTotal = ref(0);
const round = ref(1);
const lastAction = ref(
  '点击"开始流式回复"，然后上滑观察跟随中断，回到底部观察自动恢复。'
);

let nextKey = 0;
let streamCharacters: string[] = [];
let streamOffset = 0;
let streamTimer: number | null = null;

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
    variant: isUser ? 'outlined' : 'filled'
  };
}

function buildStreamingChars(currentRound: number): string[] {
  const total = STREAM_CHARS_PER_TICK * STREAM_TOTAL_TICKS;
  const paragraphs = Array.from({ length: STREAM_TOTAL_TICKS }, (_, idx) => {
    return `第${currentRound}轮第${idx + 1}次增量输出，用来持续观察气泡内容变高时是否始终贴底，用户上滑后是否只累计未读而不打断阅读，重新回到底部以后是否立刻恢复自动跟随。`;
  });
  return Array.from(paragraphs.join('')).slice(0, total);
}

function stopStreaming(reason = '已停止流式回复。') {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer);
    streamTimer = null;
  }
  isStreaming.value = false;
  lastAction.value = reason;
}

function buildSeedList(): MessageItem[] {
  const list: MessageItem[] = [];
  for (let i = 0; i < 14; i++) {
    const role = i % 2 === 0 ? 'ai' : 'user';
    list.push(
      createMessage(
        i + 1,
        role,
        role === 'ai'
          ? `预热 AI 消息 ${i + 1}：这是用于流式跟随验证的种子数据。`
          : `预热用户消息 ${i + 1}`
      )
    );
  }

  nextKey = list.length;
  round.value = 1;
  streamTick.value = 0;
  emittedCharCount.value = 0;
  streamCharTotal.value = 0;
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  isStreaming.value = false;
  lastAction.value =
    '点击"开始流式回复"，然后上滑观察跟随中断，回到底部观察自动恢复。';
  streamCharacters = [];
  streamOffset = 0;

  return list;
}

function resetConversation() {
  stopStreaming('已重置当前流式会话。');
  bubbleItems.value = buildSeedList();
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function startStreaming() {
  if (isStreaming.value) return;

  const currentRound = round.value;
  round.value += 1;
  streamTick.value = 0;
  emittedCharCount.value = 0;
  streamOffset = 0;

  // 先追加一条用户提问
  bubbleItems.value.push(
    createMessage(
      ++nextKey,
      'user',
      `第 ${currentRound} 轮提问：请总结 BubbleList 在流式输出与分页场景下的关键升级点。`
    )
  );

  // 准备流式字符
  streamCharacters = buildStreamingChars(currentRound);
  streamCharTotal.value = streamCharacters.length;

  // 初始 chunk
  const initialChunk = streamCharacters
    .slice(0, STREAM_CHARS_PER_TICK)
    .join('');
  streamOffset = initialChunk.length;
  emittedCharCount.value = streamOffset;
  streamTick.value = initialChunk.length > 0 ? 1 : 0;

  // 追加 AI 消息
  bubbleItems.value.push(createMessage(++nextKey, 'ai', initialChunk));

  isStreaming.value = true;
  lastAction.value = `流式输出进行中：每 ${STREAM_TICK_MS}ms 追加 ${STREAM_CHARS_PER_TICK} 个字，总量约 ${streamCharTotal.value} 字。`;

  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });

  // 定时追加
  streamTimer = window.setInterval(() => {
    const currentItem = bubbleItems.value[bubbleItems.value.length - 1];
    if (!currentItem || currentItem.role !== 'ai') {
      stopStreaming('流式消息已丢失，已终止当前模拟。');
      return;
    }

    if (
      streamOffset >= streamCharacters.length ||
      streamTick.value >= STREAM_TOTAL_TICKS
    ) {
      stopStreaming('流式输出完成。');
      return;
    }

    const nextChunk = streamCharacters
      .slice(streamOffset, streamOffset + STREAM_CHARS_PER_TICK)
      .join('');

    if (!nextChunk) {
      stopStreaming('流式输出完成。');
      return;
    }

    currentItem.content += nextChunk;
    streamOffset += nextChunk.length;
    emittedCharCount.value = streamOffset;
    streamTick.value += 1;

    if (
      streamOffset >= streamCharacters.length ||
      streamTick.value >= STREAM_TOTAL_TICKS
    ) {
      stopStreaming('流式输出完成。');
    }
  }, STREAM_TICK_MS);
}

function simulateInterrupt() {
  if (!bubbleListRef.value) return;
  bubbleListRef.value.scrollToTop(false);
  lastAction.value = '已滚动到顶部，新 chunk 将暂停跟随。回到底部后自动恢复。';
}

function resumeFollow() {
  bubbleListRef.value?.scrollToBottom(false);
  lastAction.value = '已回到底部（scrollToBottom），流式内容将持续跟随。';
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}
function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});
onUnmounted(() => {
  stopStreaming('');
});
</script>

<template>
  <div class="streaming-follow-demo">
    <div class="tip-banner">
      <span class="tip-icon">~</span>
      <span
        ><strong>核心体验流程</strong>：① 点"开始流式回复" → ② 等 AI 开始输出 →
        ③ <strong>向上滚动</strong>打断 → ④ 观察未读增加、列表不再跳动 → ⑤
        点"回到底部恢复" → ⑥ 观察后续 chunk 自动跟随</span
      >
    </div>

    <div class="toolbar-group">
      <div class="btn-list">
        <el-button
          size="small"
          type="primary"
          plain
          :disabled="isStreaming"
          @click="startStreaming"
        >
          开始流式回复
        </el-button>
        <el-button
          size="small"
          type="warning"
          plain
          :disabled="!isStreaming"
          @click="simulateInterrupt"
        >
          滚动到顶部（模拟上滑）
        </el-button>
        <el-button size="small" type="success" plain @click="resumeFollow">
          回到底部恢复
        </el-button>
        <el-button
          size="small"
          type="danger"
          plain
          :disabled="!isStreaming"
          @click="stopStreaming('已手动停止')"
        >
          停止流式回复
        </el-button>
        <el-button size="small" type="info" plain @click="resetConversation">
          重置会话
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span
        ><strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span><strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>流式状态</span
        ><strong :class="isStreaming ? 'streaming' : ''">{{
          isStreaming ? '进行中' : '空闲'
        }}</strong>
      </div>
      <div class="status-chip">
        <span>当前轮次</span><strong>{{ Math.max(round - 1, 0) }}</strong>
      </div>
      <div class="status-chip">
        <span>已输出字符</span
        ><strong>{{ emittedCharCount }}/{{ streamCharTotal }}</strong>
      </div>
      <div class="status-chip">
        <span>运行 tick</span
        ><strong>{{ streamTick }}/{{ STREAM_TOTAL_TICKS }}</strong>
      </div>
    </div>

    <div class="activity-bar">
      <span>最近动作</span><strong>{{ lastAction }}</strong>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.streaming-follow-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  .tip-banner {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #fef0f0 0%, #fdf6ec 100%);
    border: 1px solid #fde2e2;
    font-size: 13px;
    color: #f56c6c;
    line-height: 1.7;
    .tip-icon {
      font-size: 18px;
      line-height: 1;
      margin-top: 2px;
    }
    strong {
      color: #303133;
    }
  }

  .toolbar-group {
    min-height: 0;
  }
  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
      line-height: 1;
    }
    strong {
      font-size: 13px;
      color: #0f172a;
      line-height: 1;
      &.state-at_bottom {
        color: #67c23a;
      }
      &.state-scrolled_up {
        color: #e6a23c;
      }
      &.state-has_new_messages {
        color: #f56c6c;
      }
      &.streaming {
        color: #409eff;
        animation: blink 1.2s ease-in-out infinite;
      }
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }

  .activity-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;
    span {
      font-size: 12px;
      color: #64748b;
    }
    strong {
      font-size: 13px;
      color: #1e3a8a;
    }
  }

  .story-stage {
    min-height: 520px;
    height: 520px;
    padding: 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
  }

  .story-stage :deep(.elx-bubble-list) {
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1 1 0;
    overflow: hidden;
  }
}
</style>

```

### streaming-replace-sse-extreme

```vue
<docs>
---
title: 极端场景：动态插槽高度与自动触底压力测试
---

::: warning 复现目的
这个 demo 用来覆盖更极端的组合场景：在 `#header`、`#topStatus`、`#item` 这些不同插槽里同时放入会随流式内容增高、并在思考结束后 `auto-collapse` 的 `Thinking` 组件。

用于观察：当多个非正文区域出现高度突变时，`BubbleList` 的自动触底是否仍然稳定，尤其是非虚拟列表模式和高速 SSE 全量替换模式。
:::

操作建议：
1. 关闭虚拟列表，保持「全量替换」模式，输出速度拉满
2. 依次打开/关闭 `#header`、`#topStatus`、`#item` 压力开关，观察滚动状态
3. 对比开启虚拟列表后的表现
</docs>

<script setup lang="ts">
import type {
  BubbleListBoundaryState,
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
  role: 'user' | 'ai' | 'system';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
  itemType?: 'stress-thinking';
}

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
  name: 'SseExtremeEchartsBlock',
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
        console.warn('[streaming-replace-sse-extreme] echarts init failed', e);
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
    if (parsed.ok) return h(MyEchartsBlock, { option: parsed.value });

    return h('div', { class: 'chart-loading' }, '图表数据加载中...');
  }
};

const CF = '``​`';

const LONG_THINKING_DETAIL = Array.from({ length: 36 }, (_, i) => {
  const area = ['青秀区', '兴宁区', '江南区', '西乡塘区', '良庆区', '邕宁区'][
    i % 6
  ];
  const factor = ['PM2.5', 'PM10', 'NO2', 'O3', 'CODMn', '氨氮'][i % 6];
  const risk = ['低', '中', '中高', '高'][i % 4];

  return [
    `推理片段 ${i + 1}：正在比对 ${area} 的 ${factor} 监测指标。`,
    `- 临时样本量：${128 + i * 19} 条`,
    `- 异常点位：${(i % 5) + 1} 个`,
    `- 风险等级：${risk}`,
    `- 处理策略：先按小时聚合，再按站点类型回填缺失值，最后校验累计总数是否仍为 175。`,
    `- 高度压力：这一段会同时影响 header / topStatus / item 插槽中的 Thinking 展开高度。`
  ].join('\n');
}).join('\n\n');

const TOP_STATUS_THINKING_DETAIL = Array.from({ length: 16 }, (_, i) => {
  return `顶部插槽压力 ${i + 1}：模拟顶部加载区中存在动态高度组件，当前正在同步第 ${i + 1} 批监测站点上下文。`;
}).join('\n\n');

const ITEM_SLOT_THINKING_DETAIL = Array.from({ length: 18 }, (_, i) => {
  return `#item 插槽压力 ${i + 1}：这是一个非 Bubble 节点，由 itemType 命中 #item 插槽渲染，并在思考结束后自动折叠。`;
}).join('\n\n');

const FINAL_FULL_CONTENT = `<think>
正在理解问题中……本次用于测试多个插槽共同产生动态高度变化时，BubbleList 是否仍能持续追底。

第一步：在 Bubble 的 #header 中渲染 Thinking。
第二步：在 BubbleList 的 #topStatus 中渲染 Thinking。
第三步：插入一个 itemType=stress-thinking 的非气泡节点，在 #item 中渲染 Thinking。
第四步：正文继续输出 Markdown 表格、ECharts、Mermaid、数学公式和图片。

${LONG_THINKING_DETAIL}

准备就绪，开始输出最终回答。</think>

## 极端场景 SSE 输出报告

### 一、压力场景矩阵

| 插槽位置 | 动态组件 | 高度变化来源 | 预期行为 |
|:---------|:---------|:-------------|:---------|
| #header | Thinking | 流式展开 + 自动折叠 | 不打断 AI 回复追底 |
| #topStatus | Thinking | 顶部边界区域动态高度 | 不误判用户上滑 |
| #item | Thinking | 非气泡节点动态高度 | 不阻断后续流式追底 |
| #content | MarkdownRenderer | 表格/图表/公式/图片异步渲染 | 持续贴底 |

### 二、站点类型分布（ECharts）

${CF}my-echarts
{
  "title": { "text": "极端场景站点分布", "left": "center" },
  "tooltip": { "trigger": "item", "formatter": "{b}: {c} 个 ({d}%)" },
  "legend": { "bottom": "0" },
  "series": [{
    "type": "pie",
    "radius": ["42%", "72%"],
    "data": [
      { "value": 22, "name": "大气监测" },
      { "value": 51, "name": "水质监测" },
      { "value": 92, "name": "秸秆焚烧" },
      { "value": 10, "name": "酸雨监测" }
    ]
  }]
}
${CF}

### 三、动态高度触发链路（Mermaid）

${CF}mermaid
flowchart TD
  A[SSE 全量替换] --> B[AI item content 更新]
  B --> C[#header Thinking 增高]
  B --> D[#item Thinking 增高]
  B --> E[Markdown 正文增高]
  B --> F[#topStatus Thinking 增高]
  C --> G{是否仍在底部}
  D --> G
  E --> G
  F --> G
  G -->|是| H[继续自动触底]
  G -->|否| I[保持用户阅读位置]
${CF}

### 四、AQI 公式

$$AQI = \\frac{I_{hi} - I_{lo}}{C_{hi} - C_{lo}} \\times (C_p - C_{lo}) + I_{lo}$$

### 五、图片

![生态监测示意图](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80)

### 六、长段结论

${Array.from({ length: 14 }, (_, i) => `**结论段 ${i + 1}**：当前压力用例会同时让 header、topStatus、item 和 content 区域产生高度变化。理想情况下，只要用户没有主动上滑，BubbleList 都应该维持 AT_BOTTOM；一旦用户主动上滑，则应该进入 SCROLLED_UP 并停止追底。`).join('\n\n')}
`;

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
    const accumulated = finalContent.slice(0, offset);
    const done = offset >= finalContent.length;
    onMessage({ content: accumulated, completed: done });
    if (done) {
      window.clearInterval(timer);
      onClose();
    }
  }, tickMs);
  return () => window.clearInterval(timer);
}

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<BubbleListProps<MessageItem>['list']>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const hasStreamStarted = ref(false);
const mode = ref<'replace' | 'append'>('replace');
const lastEventLength = ref(0);
const eventCount = ref(0);
const virtualEnabled = ref(false);
const headerStressEnabled = ref(true);
const topStatusStressEnabled = ref(true);
const itemStressEnabled = ref(true);
const speed = ref(10);

let nextKey = 0;
let stopSSE: (() => void) | null = null;

const latestAiItem = computed(() => {
  for (let i = bubbleItems.value.length - 1; i >= 0; i--) {
    const item = bubbleItems.value[i];
    if (item?.role === 'ai') return item;
  }
  return undefined;
});

const currentStreamingThink = computed(() => {
  const item = latestAiItem.value;
  if (!item)
    return { thinking: '', body: '', status: 'start' as ThinkingStatus };

  return parseThink(item.content);
});

const topStatus = computed<BubbleListBoundaryState | null>(() => {
  if (!topStatusStressEnabled.value || !hasStreamStarted.value) return null;

  return { type: 'loading', text: '顶部动态 Thinking 压力区' };
});

const topStatusThinkingContent = computed(() => {
  if (currentStreamingThink.value.status === 'thinking') {
    return [
      'BubbleList #topStatus 动态高度压力测试。',
      TOP_STATUS_THINKING_DETAIL,
      currentStreamingThink.value.thinking
    ].join('\n\n');
  }

  return [
    'BubbleList #topStatus 动态高度压力测试。',
    TOP_STATUS_THINKING_DETAIL
  ].join('\n\n');
});

const itemSlotThinkingContent = computed(() => {
  if (currentStreamingThink.value.status === 'thinking') {
    return [
      'BubbleList #item 动态高度压力测试。',
      ITEM_SLOT_THINKING_DETAIL,
      currentStreamingThink.value.thinking
    ].join('\n\n');
  }

  return [
    'BubbleList #item 动态高度压力测试。',
    ITEM_SLOT_THINKING_DETAIL
  ].join('\n\n');
});

function speedToTiming(s: number) {
  const tickMs = Math.round(200 - (s - 1) * 20);
  const charsPerTick = Math.round(2 + (s - 1) * 6);
  return { tickMs, charsPerTick };
}

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

function createStressItem(): MessageItem {
  return {
    key: ++nextKey,
    role: 'system',
    placement: 'start',
    content: '',
    avatar: '',
    itemType: 'stress-thinking',
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
  hasStreamStarted.value = false;
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
  hasStreamStarted.value = true;

  bubbleItems.value.push(
    createMessage(++nextKey, 'user', '请用极端插槽组合压测 SSE 自动触底能力。')
  );

  if (itemStressEnabled.value) bubbleItems.value.push(createStressItem());

  bubbleItems.value.push(createMessage(++nextKey, 'ai', ''));

  isStreaming.value = true;
  eventCount.value = 0;
  let lastReceivedContent = '';

  const { tickMs, charsPerTick } = speedToTiming(speed.value);
  stopSSE = createMockSSE(FINAL_FULL_CONTENT, {
    tickMs,
    charsPerTick,
    onMessage: e => {
      eventCount.value += 1;
      lastEventLength.value = e.content.length;
      const aiItem = latestAiItem.value;
      if (!aiItem) return;

      if (mode.value === 'replace') {
        aiItem.content = e.content;
      } else {
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
  <div class="sse-extreme-demo">
    <div class="tip">
      <strong>极端场景：</strong>
      <span :class="`mode-tag mode-${mode}`">
        {{ mode === 'replace' ? '全量替换' : '增量追加' }}
      </span>
      <span class="hint">
        同时压测 #header、#topStatus、#item 与 Markdown 正文的动态高度变化。
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
        开始极端 SSE 流
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
          speed <= 3 ? '慢' : speed >= 8 ? '快（极端）' : '中'
        }}</span>
      </div>
    </div>

    <div class="switch-row">
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
      <div class="chip switch-chip">
        #header Thinking：
        <el-switch
          v-model="headerStressEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
      <div class="chip switch-chip">
        #topStatus Thinking：
        <el-switch
          v-model="topStatusStressEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
      </div>
      <div class="chip switch-chip">
        #item Thinking：
        <el-switch
          v-model="itemStressEnabled"
          size="small"
          :disabled="isStreaming"
          inline-prompt
          active-text="开"
          inactive-text="关"
        />
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
    </div>

    <div class="stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        :virtual="virtualEnabled"
        :top-status="topStatus"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #topStatus>
          <div class="top-status-stress">
            <Thinking
              :content="topStatusThinkingContent"
              :status="
                currentStreamingThink.status === 'thinking' ? 'thinking' : 'end'
              "
              auto-collapse
              max-width="100%"
            />
          </div>
        </template>

        <template #header="{ item }">
          <Thinking
            v-if="
              headerStressEnabled &&
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
              class="waiting-text"
              >正在等待回复...</span
            >
          </template>
          <template v-else>
            <span class="user-msg-text">{{ item.content }}</span>
          </template>
        </template>

        <template #item="{ item }">
          <div v-if="item.itemType === 'stress-thinking'" class="item-stress">
            <div class="item-stress-title">#item 插槽动态高度节点</div>
            <Thinking
              :content="itemSlotThinkingContent"
              :status="
                currentStreamingThink.status === 'thinking' ? 'thinking' : 'end'
              "
              auto-collapse
              max-width="100%"
            />
          </div>
          <div v-else class="item-stress">
            {{ item.content }}
          </div>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sse-extreme-demo {
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
.toolbar,
.switch-row,
.status-row {
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
.switch-chip {
  padding-right: 8px;
}
.stage {
  min-height: 560px;
  height: 560px;
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
.top-status-stress {
  padding: 8px 12px 6px;
  border-bottom: 1px solid #dbeafe;
  background: #eff6ff;
}
.message-thinking {
  margin-bottom: 8px;
}
.item-stress {
  width: min(720px, calc(100% - 40px));
  margin: 8px auto;
  padding: 12px;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  background: #fff;
}
.item-stress-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
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
.waiting-text {
  color: #999;
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

```

### streaming-replace-sse

```vue
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
const CF = '``​`';

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

```

### theme-overrides

```vue
<docs>
---
title: 自定义主题
---

通过 `ConfigProvider.themeOverrides` 覆盖 `BubbleList` 的 `--elx-*` 变量，并联动 `Bubble` 的主题变量，开关前后会有明显反差。
</docs>

<script setup lang="ts">
import { computed, ref } from 'vue';

const enabled = ref(true);

const list = ref(
  Array.from({ length: 18 }).map((_, i) => ({
    content: `第 ${i + 1} 条消息：用于演示 BubbleList 的滚动与返回按钮。`,
    placement: i % 2 === 0 ? 'start' : 'end'
  }))
);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#f97316',
      'border-color': 'rgba(249, 115, 22, 0.38)',
      'fill-color': 'rgba(249, 115, 22, 0.10)',
      'box-shadow': '0 18px 54px rgba(249, 115, 22, 0.22)'
    },
    components: {
      BubbleList: {
        'bubble-list-max-height': '260px',
        'bubble-list-btn-size': '38px'
      },
      Bubble: {
        'bubble-content-max-width': '420px',
        'bubble-bg':
          'linear-gradient(135deg, rgba(249, 115, 22, 0.16), rgba(245, 158, 11, 0.10))',
        'bubble-border-color': 'rgba(249, 115, 22, 0.30)',
        'bubble-text-color': 'rgba(15, 23, 42, 0.86)',
        'bubble-radius': '18px',
        'bubble-padding-y': '14px',
        'bubble-padding-x': '18px',
        'bubble-shadow': '0 18px 52px rgba(249, 115, 22, 0.18)',
        'bubble-dot-color': '#f97316'
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
      <div>滚动列表，观察最大高度与返回按钮尺寸变化。</div>
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
          height: 360px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--elx-border-color);
          background:
            radial-gradient(
              1200px 280px at 0% 0%,
              rgba(249, 115, 22, 0.22),
              transparent 60%
            ),
            radial-gradient(
              900px 240px at 100% 20%,
              rgba(245, 158, 11, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
        "
      >
        <BubbleList :list="list" always-show-scrollbar />
      </div>
    </ConfigProvider>
  </div>
</template>

```

### with-markdown

```vue
<docs>
---
title: 流式 Markdown 渲染（V2 升级）
---

支持公式、代码块、任务列表的列表渲染，并模拟 AI 逐段输出 Markdown 的实时效果。

::: tip V2 版本升级提示
- **流式跟随**：V2 在流式输出（内容持续变高）时，自动贴底跟随。用户上滑后中断，回到底部后自动恢复。V1 需要手动管理滚动位置。
- **虚拟滚动兼容**：V2 虚拟滚动 + 动态高度测量，流式变高时自动重新测量 item 高度，不会出现滚动位置跳动。
- **状态感知**：通过 `scroll-state-change` 和 `unread-count-change` 事件可实时感知流式输出期间的滚动状态变化。
:::
</docs>

<script setup lang="ts">
import type {
  BubbleListInstance,
  BubbleListScrollState
} from 'vue-element-plus-x/types/BubbleList';
import 'katex/dist/katex.min.css';
import 'shiki';

import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

interface MessageItem {
  key: number;
  role: 'user' | 'ai' | 'system';
  placement: 'start' | 'end';
  content: string;
  avatar: string;
}

// ---- 流式输出相关 ----
const STREAM_TICK_MS = 70;
const STREAM_CHARS_PER_TICK = 8;

const bubbleListRef = ref<BubbleListInstance | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const scrollState = ref<BubbleListScrollState>('AT_BOTTOM');
const unreadCount = ref(0);
const isStreaming = ref(false);
const emittedCharCount = ref(0);
const streamCharTotal = ref(0);
const round = ref(1);
const lastAction = ref(
  '点击"开始流式 Markdown"，观察 AI 消息逐段渲染与滚动跟随效果。'
);

let nextKey = 0;
let streamCharacters: string[] = [];
let streamOffset = 0;
let streamTimer: number | null = null;

function buildStaticMessages(): MessageItem[] {
  return [
    {
      key: 1,
      role: 'ai',
      placement: 'start',
      avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
      content: `### 行内公式
1. 欧拉公式：$e^{i\\pi} + 1 = 0$
2. 二次方程求根公式：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### []包裹公式
\\[ e^{i\\pi} + 1 = 0 \\]
\\[\\boxed{boxed包裹}\\]`
    },
    {
      key: 2,
      role: 'user',
      placement: 'end',
      avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
      content: '请问有什么可以帮助您的？'
    },
    {
      key: 3,
      role: 'ai',
      placement: 'start',
      avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
      content: `### 块级公式与代码块

傅里叶变换：
$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt
$$

矩阵乘法：
$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
\\begin{bmatrix}
x \\\\
y
\\end{bmatrix}
=
\\begin{bmatrix}
ax + by \\\\
cx + dy
\\end{bmatrix}
$$

任务列表：
- [x] Add some task
- [ ] Do some task

\`\`\`typescript
const greeting: string = "Hello World";
console.log(greeting);
\`\`\``
    }
  ];
}

function buildStreamingMarkdown(currentRound: number): string {
  return `### 第 ${currentRound} 轮流式 Markdown 回复

这是一个 **流式输出 + Markdown 渲染** 演示，验证 V2 升级后的能力：

- 输出内容持续变高时，贴底状态是否稳定
- 用户上滑后，是否只累计未读而不强制跳回
- 回到底部后，后续 chunk 是否继续自动跟随

#### 结构化摘要

1. BubbleList 负责虚拟滚动与跟随策略。
2. MarkdownRenderer 负责富文本渲染（标题、列表、代码、公式）。
3. 两者结合后可覆盖真实聊天场景中的长回复。

#### 代码片段

\`\`\`ts
type StreamChunk = {
  text: string;
  index: number;
};

const followWhenAtBottom = (distance: number) => distance <= 4;
\`\`\`

#### 数学公式

$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t)e^{-i\\omega t}\\,dt
$$

> 结论：当消息是持续增量更新时，滚动边界判断需要考虑状态区高度与容差。`;
}

function stopStreaming(reason = '已停止流式 Markdown 输出。') {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer);
    streamTimer = null;
  }

  isStreaming.value = false;
  lastAction.value = reason;
}

function resetConversation() {
  stopStreaming('已重置当前 Markdown 流式会话。');
  bubbleItems.value = buildStaticMessages();
  nextKey = 3;
  round.value = 1;
  emittedCharCount.value = 0;
  streamCharTotal.value = 0;
  scrollState.value = 'AT_BOTTOM';
  unreadCount.value = 0;
  lastAction.value =
    '点击"开始流式 Markdown"，观察 AI 消息逐段渲染与滚动跟随效果。';
  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });
}

function startStreaming() {
  if (isStreaming.value) return;

  const currentRound = round.value;
  round.value += 1;
  emittedCharCount.value = 0;
  streamOffset = 0;

  // 先追加一条用户提问
  nextKey += 1;
  bubbleItems.value.push({
    key: nextKey,
    role: 'user',
    placement: 'end',
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    content: `请用 Markdown 解释第 ${currentRound} 轮 BubbleList 流式跟随验证结论。`
  });

  // 准备流式 Markdown 内容
  const markdown = buildStreamingMarkdown(currentRound);
  streamCharacters = Array.from(markdown);
  streamCharTotal.value = streamCharacters.length;

  // 初始 chunk
  const initialChunk = streamCharacters
    .slice(0, STREAM_CHARS_PER_TICK)
    .join('');
  streamOffset = initialChunk.length;
  emittedCharCount.value = streamOffset;

  // 追加 AI 消息（初始内容）
  nextKey += 1;
  bubbleItems.value.push({
    key: nextKey,
    role: 'ai',
    placement: 'start',
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    content: initialChunk
  });

  isStreaming.value = true;
  lastAction.value = `流式 Markdown 进行中：每 ${STREAM_TICK_MS}ms 追加 ${STREAM_CHARS_PER_TICK} 个字符。`;

  nextTick(() => {
    bubbleListRef.value?.scrollToBottom(false);
  });

  // 定时追加
  streamTimer = window.setInterval(() => {
    const currentItem = bubbleItems.value[bubbleItems.value.length - 1];
    if (!currentItem || currentItem.role !== 'ai') {
      stopStreaming('流式消息已丢失，已终止当前模拟。');
      return;
    }

    if (streamOffset >= streamCharacters.length) {
      stopStreaming('流式 Markdown 输出完成。');
      return;
    }

    const nextChunk = streamCharacters
      .slice(streamOffset, streamOffset + STREAM_CHARS_PER_TICK)
      .join('');

    if (!nextChunk) {
      stopStreaming('流式 Markdown 输出完成。');
      return;
    }

    currentItem.content += nextChunk;
    streamOffset += nextChunk.length;
    emittedCharCount.value = streamOffset;

    if (streamOffset >= streamCharacters.length) {
      stopStreaming('流式 Markdown 输出完成。');
    }
  }, STREAM_TICK_MS);
}

function handleScrollStateChange(state: BubbleListScrollState) {
  scrollState.value = state;
}

function handleUnreadCountChange(count: number) {
  unreadCount.value = count;
}

onMounted(() => {
  resetConversation();
});

onUnmounted(() => {
  stopStreaming('组件卸载，已清理 Markdown 流式定时器。');
});
</script>

<template>
  <div class="markdown-demo-container">
    <div class="tip-banner">
      <span class="tip-icon">▶</span>
      <span
        >先点击"开始流式
        Markdown"，然后尝试<strong>向上滚动</strong>打断跟随，再点"回到底部恢复"观察自动恢复。</span
      >
    </div>

    <div class="toolbar">
      <div class="btn-list">
        <el-button
          type="primary"
          plain
          :disabled="isStreaming"
          @click="startStreaming"
        >
          开始流式 Markdown
        </el-button>
        <el-button
          type="warning"
          plain
          :disabled="!isStreaming"
          @click="bubbleListRef?.scrollToTop(false)"
        >
          模拟上滑中断
        </el-button>
        <el-button
          type="success"
          plain
          @click="bubbleListRef?.scrollToBottom(false)"
        >
          回到底部恢复
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="!isStreaming"
          @click="stopStreaming('已手动停止')"
        >
          停止输出
        </el-button>
        <el-button type="info" plain @click="resetConversation">
          重置会话
        </el-button>
      </div>
    </div>

    <div class="status-row">
      <div class="status-chip">
        <span>滚动状态</span>
        <strong :class="`state-${scrollState.toLowerCase()}`">{{
          scrollState
        }}</strong>
      </div>
      <div class="status-chip">
        <span>未读计数</span>
        <strong>{{ unreadCount }}</strong>
      </div>
      <div class="status-chip">
        <span>流式状态</span>
        <strong :class="isStreaming ? 'streaming' : ''">{{
          isStreaming ? '输出中...' : '空闲'
        }}</strong>
      </div>
      <div class="status-chip">
        <span>已输出字符</span>
        <strong>{{ emittedCharCount }}/{{ streamCharTotal }}</strong>
      </div>
      <div class="status-chip">
        <span>当前轮次</span>
        <strong>{{ Math.max(round - 1, 0) }}</strong>
      </div>
    </div>

    <div class="activity-bar">
      <span>最近动作</span>
      <strong>{{ lastAction }}</strong>
    </div>

    <div class="story-stage">
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        @scroll-state-change="handleScrollStateChange"
        @unread-count-change="handleUnreadCountChange"
      >
        <template #content="{ item }">
          <div v-if="item.role === 'ai'" class="markdown-content-wrapper">
            <component
              :is="MarkdownRenderer"
              v-if="MarkdownRenderer"
              :markdown="item.content || ''"
            />
            <pre v-else>{{ item.content }}</pre>
          </div>
          <span v-else>{{ item.content }}</span>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.markdown-demo-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .story-stage {
    height: 450px;
    padding: 8px 10px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .tip-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ecf5ff 0%, #fef0f0 100%);
    border: 1px solid #d9ecff;
    font-size: 13px;
    color: #409eff;

    .tip-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #409eff;
      color: #fff;
      font-size: 11px;
      flex-shrink: 0;
    }

    strong {
      color: #f56c6c;
    }
  }

  .toolbar {
    .btn-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e4e7ed;

    span {
      font-size: 12px;
      color: #909399;
    }
    strong {
      font-size: 13px;
      color: #303133;
    }

    .state-at_bottom {
      color: #67c23a;
    }
    .state-scrolled_up {
      color: #e6a23c;
    }
    .state-has_new_messages {
      color: #f56c6c;
    }
    .streaming {
      color: #409eff;
      animation: blink 1s ease-in-out infinite;
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .activity-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
    border: 1px solid #dbeafe;

    span {
      font-size: 12px;
      color: #909399;
    }
    strong {
      font-size: 13px;
      color: #1e3a8a;
    }
  }
}

.markdown-content-wrapper {
  word-break: break-word;
  color: #24292e;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.25;
    &:first-child {
      margin-top: 0;
    }
  }

  :deep(p) {
    margin-top: 0;
    margin-bottom: 8px;
    line-height: 1.6;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin-top: 0;
    margin-bottom: 8px;
    ul,
    ol {
      margin-top: 4px;
      margin-bottom: 0;
    }
  }

  :deep(ul) {
    list-style-type: disc;
  }
  :deep(ol) {
    list-style-type: decimal;
  }

  :deep(li) {
    margin: 4px 0;
    line-height: 1.6;
    &.task-list-item {
      list-style-type: none;
      padding-left: 0;
      display: flex;
      align-items: flex-start;
      margin-left: -20px;
      input[type='checkbox'] {
        margin: 5px 8px 0 0;
        flex-shrink: 0;
      }
    }
  }

  :deep(a) {
    color: #0366d6;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  :deep(code):not(pre code) {
    background-color: rgba(27, 31, 35, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 85%;
  }

  :deep(blockquote) {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 8px 0;
  }

  :deep(hr) {
    height: 0.25em;
    padding: 0;
    margin: 16px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  :deep(table) {
    display: block;
    width: 100%;
    overflow: auto;
    margin-top: 0;
    margin-bottom: 16px;
    border-collapse: collapse;
    th,
    td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }
    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }
}

:deep(.x-md-code-block) {
  pre {
    background-color: #f6f8fa !important;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
      .line {
        display: block;
        min-height: 1rem;
      }
    }
  }
}
</style>

```

## API 参考

### 滚动控制方法

### 自动触底控制

### 返回底部按钮

### 流式跟随

### 模拟真实 SSE（全量累计）复现自动触底失效

### 极端场景：动态插槽高度与自动触底压力测试

### 双向分页加载

### 混合节点

### 插槽自定义

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `BubbleList` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#bubblelist)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

### 与 x-markdown-vue 结合使用

从 `v2.0.0` 开始，组件库不再内置 `XMarkdown` / `XMarkdownAsync`。如需 Markdown 渲染，请使用独立包 [x-markdown-vue](https://www.npmjs.com/package/x-markdown-vue)，或查看专属文档：[XMarkdown](/zh/components/xMarkdown/)。

#### 安装

```bash
pnpm add x-markdown-vue
pnpm add katex
pnpm add shiki shiki-stream
```

::: tip
如果需要代码块语法高亮功能，请安装 `shiki` 和 `shiki-stream`。否则控制台可能会报错：`Streaming highlighter initialization failed: Error: Failed to load shiki-stream module`
:::

#### 基础用法

#### 雾化效果

## 属性

| 属性名                    | 类型                 | 是否必填 | 默认值                                         | 说明                                                                                                                                      |
| ------------------------- | -------------------- | -------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `list`                    | `Array`              | 是       | -                                              | 消息数组，每个对象透传给内置 `Bubble` 组件，支持所有 `Bubble` 属性。                                                                      |
| `autoScroll`              | `Boolean`            | 否       | `true`                                         | 追加新消息时是否自动滚到底部。关闭后新消息累计未读计数。                                                                                  |
| `maxHeight`               | `String`             | 否       | -                                              | 列表最大高度，默认撑满父容器。                                                                                                            |
| `virtual`                 | `Boolean`            | 否       | `true`                                         | 是否开启虚拟滚动（基于 `virtua/vue`），大数据量场景推荐保持开启。                                                                         |
| `smoothScroll`            | `Boolean`            | 否       | `false`                                        | 编程式滚动是否默认使用平滑动画。                                                                                                          |
| `itemKey`                 | `string \| Function` | 否       | `'key'`                                        | 节点唯一标识，可传字段名或 `(item, index) => key` 函数。                                                                                  |
| `itemType`                | `string \| Function` | 否       | -                                              | 非气泡节点类型标识，命中后走 `#item` 插槽渲染；可传字段名或函数。                                                                         |
| `showBackButton`          | `Boolean`            | 否       | `true`                                         | 是否显示回底按钮。                                                                                                                        |
| `backButtonThreshold`     | `Number`             | 否       | `80`                                           | 触发显示回底按钮的阈值（距底部 px）。                                                                                                     |
| `backButtonPosition`      | `Object`             | 否       | `{ bottom: '20px', left: 'calc(50% - 19px)' }` | 回底按钮的 CSS 定位，可配置 `top / right / bottom / left / transform`。                                                                   |
| `backButtonSmoothScroll`  | `Boolean`            | 否       | `true`                                         | 点击回底按钮时是否平滑滚动。                                                                                                              |
| `alwaysShowScrollbar`     | `Boolean`            | 否       | `false`                                        | 是否一直显示滚动条。                                                                                                                      |
| `btnLoading`              | `Boolean`            | 否       | `true`                                         | 是否在内置回底按钮上显示 loading 状态。                                                                                                   |
| `btnColor`                | `String`             | 否       | `'#409EFF'`                                    | 内置回底按钮颜色。                                                                                                                        |
| `btnIconSize`             | `Number`             | 否       | `24`                                           | 内置回底按钮图标大小（px）。                                                                                                              |
| `topStatus`               | `{ type, text? }`    | 否       | -                                              | 顶部边界状态，`type` 可选 `idle / loading / no-more / error`。                                                                            |
| `bottomStatus`            | `{ type, text? }`    | 否       | -                                              | 底部边界状态，同 `topStatus`。                                                                                                            |
| `loadMoreTopThreshold`    | `Number`             | 否       | `100`                                          | 触发 `@load-more-top` 的距顶阈值（px）。                                                                                                  |
| `loadMoreBottomThreshold` | `Number`             | 否       | `100`                                          | 触发 `@load-more-bottom` 的距底阈值（px）。                                                                                               |
| `shouldFollowContent`     | `Function`           | 否       | -                                              | 自定义内容跟随策略，返回 `true` 则触底，`false` 则累计未读。回调参数含 `reason / item / index / scrollState / unreadCount / autoScroll`。 |

## 事件

| 事件名                 | 参数                                                          | 说明                                                 |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `@load-more-top`       | -                                                             | 向上滚到顶部达到阈值时触发，可在此请求加载历史消息。 |
| `@load-more-bottom`    | -                                                             | 向下滚到底部达到阈值时触发，可在此请求加载更多消息。 |
| `@scroll-state-change` | `(state: 'AT_BOTTOM' \| 'SCROLLED_UP' \| 'HAS_NEW_MESSAGES')` | 滚动状态变化时触发。                                 |
| `@unread-count-change` | `(count: number)`                                             | 未读计数变化时触发。                                 |

## Ref 实例方法

| 方法 / 属性              | 签名                                        | 说明                                                                      |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------- |
| `scrollToTop`            | `(smooth?: boolean) => void`                | 滚动到顶部，`smooth` 控制是否平滑动画（默认由 `smoothScroll` 属性决定）。 |
| `scrollToBottom`         | `(smooth?: boolean) => void`                | 滚动到底部，同时清零未读计数并重置状态机。                                |
| `scrollToBubble`         | `(index: number, smooth?: boolean) => void` | 滚动到指定索引的消息。                                                    |
| `loadMoreTopComplete`    | `() => void`                                | 顶部数据加载完成后调用，组件自动修复滚动位置。                            |
| `loadMoreBottomComplete` | `() => void`                                | 底部数据加载完成后调用。                                                  |
| `currentScrollState`     | `BubbleListScrollState`                     | 当前滚动状态：`AT_BOTTOM / SCROLLED_UP / HAS_NEW_MESSAGES`。              |
| `currentUnreadCount`     | `number`                                    | 当前未读消息数量。                                                        |

## 插槽

| 插槽名          | 上下文类型                    | 说明                                                                                                                   |
| --------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `#avatar`       | `BubbleListItemContext`       | 自定义气泡头像。                                                                                                       |
| `#header`       | `BubbleListItemContext`       | 自定义气泡顶部区域。                                                                                                   |
| `#content`      | `BubbleListItemContext`       | 自定义气泡内容区域。                                                                                                   |
| `#footer`       | `BubbleListItemContext`       | 自定义气泡底部区域。                                                                                                   |
| `#loading`      | `BubbleListItemContext`       | 自定义气泡加载状态。                                                                                                   |
| `#backToBottom` | `BubbleListBackButtonContext` | 自定义回底按钮，上下文含 `unreadCount / scrollState / label / autoScroll / virtualEnabled / scrollToBottom(smooth?)`。 |
| `#topStatus`    | `BubbleListBoundaryContext`   | 自定义顶部边界状态区，上下文含 `status / position / scrollState / unreadCount / autoScroll`。                          |
| `#bottomStatus` | `BubbleListBoundaryContext`   | 自定义底部边界状态区，同 `#topStatus`。                                                                                |
| `#item`         | `BubbleListItemContext`       | 非气泡类型节点的自定义渲染，由 `itemType` 命中后触发。                                                                 |
---

# ConfigProvider 全局配置

## 介绍

`ConfigProvider` 是一个全局配置组件，用于在应用的最外层提供统一的配置。它支持主题切换（亮色/暗色）、命名空间配置以及主题变量覆盖。

### 基本使用

## 代码示例

### basic

```vue
<script setup>
import { ConfigProvider, Welcome } from 'vue-element-plus-x';
</script>

<template>
  <ConfigProvider>
    <div class="demo-container">
      <p>当前使用默认配置（亮色主题，命名空间：elx）</p>
      <Welcome
        title="Welcome"
        description="这是一个默认配置下的 Welcome 组件示例"
      />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.demo-container {
  padding: 16px;
}
</style>

```

### theme-overrides

```vue
<script setup>
import { ConfigProvider, Welcome } from 'vue-element-plus-x';

const themeOverrides = {
  components: {
    Welcome: {
      'welcome-filled-bg': '#f0f9ff',
      'welcome-filled-border': '#7dd3fc',
      'welcome-title-color': 'rgba(0, 0, 0, 0.88)',
      'welcome-description-color': 'rgba(0, 0, 0, 0.65)'
    }
  }
};
</script>

<template>
  <ConfigProvider :theme-overrides="themeOverrides">
    <div class="demo-container">
      <p>使用自定义主题覆盖</p>
      <Welcome
        variant="filled"
        title="Welcome"
        description="这是使用 themeOverrides 覆盖后的样式示例"
      />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.demo-container {
  padding: 16px;
}
</style>

```

## API 参考

### 主题切换（light / dark）

把 `theme` 设置为 `dark` 即开启暗色；设置为 `light` 即关闭暗色（恢复亮色）。当 `theme='dark'` 时组件库会在 `html` 上添加 `dark` 类名，用于启用暗色变量。

```vue
<template>
  <ConfigProvider :theme="theme">
    <App />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ConfigProvider } from 'vue-element-plus-x';

const theme = ref<'light' | 'dark'>('light');
</script>
```

### 主题覆盖

## 属性

| <div style="width: 130px">属性名</div> |  Type  | 默认值  | 说明                                                                   |
| :------------------------------------- | :----: | :-----: | :--------------------------------------------------------------------- |
| `namespace`                            | String |  'elx'  | 组件的命名空间，用于 CSS 类名前缀                                      |
| `theme`                                | String | 'light' | 主题模式，可选值为 `'light'` 或 `'dark'`                               |
| `themeOverrides`                       | Object |   {}    | 主题变量覆盖配置，用于自定义组件样式                                   |
| `applyTo`                              | String | 'root'  | 主题变量应用范围：`root`（应用到全局 html）/`self`（仅作用于当前包裹） |

## themeOverrides 类型

```typescript
interface ThemeOverrides {
  common?: Record<string, string>; // 通用主题变量
  components?: Record<string, Record<string, string>>; // 组件级别的主题变量
}
```

## 如何配置主题变量

`themeOverrides` 会把 key 转成 `--elx-{key}` 的 CSS 变量。默认 `applyTo="root"` 会应用到全局 `html` 上；设置 `applyTo="self"` 则只作用于当前 `ConfigProvider` 包裹范围。配置时不要写 `--elx-` 前缀。

### 全局覆盖（common）

例如 `color-primary` 会映射为 `--elx-color-primary`：

```ts
const themeOverrides = {
  common: {
    'color-primary': '#7c3aed'
  }
};
```

### 组件覆盖（components）

按组件名分组更方便维护，例如下面会生成 `--elx-attachments-nav-bg` / `--elx-thinking-trigger-bg`：

```ts
const themeOverrides = {
  components: {
    Attachments: {
      'attachments-nav-bg': 'rgba(124, 58, 237, 0.35)',
      'attachments-nav-bg-hover': 'rgba(124, 58, 237, 0.45)',
      'attachments-nav-bg-active': 'rgba(124, 58, 237, 0.55)'
    },
    Thinking: {
      'thinking-trigger-bg': '#f8fafc',
      'thinking-trigger-border-color': 'rgba(15, 23, 42, 0.12)'
    }
  }
};
```

## 主题变量总表（可复制）

所有组件的主题变量总表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

## 插槽

| 插槽名    | 参数 | 类型 | 描述                 |
| --------- | ---- | ---- | -------------------- |
| `default` | -    | Slot | 需要被包裹的组件内容 |

## 功能特性

1. **主题切换** - 支持 `light`（亮色）和 `dark`（暗色）两种主题模式
2. **命名空间** - 可自定义组件的 CSS 类名前缀
3. **主题覆盖** - 支持通过 `themeOverrides` 自定义主题变量
4. **全局生效** - 在组件树中的所有子组件都可获取到配置

## 说明

主题 CSS 变量前缀当前固定为 `--elx-*`（不随 `namespace` 改变）。`namespace` 仅影响组件类名/选择器前缀。

## 使用示例

```vue
<template>
  <ConfigProvider :theme="theme" :namespace="namespace">
    <App />
  </ConfigProvider>
</template>

<script setup>
import { ref } from 'vue';

const theme = ref('light');
const namespace = ref('elx');
</script>
```
---

# Conversations 会话管理

## 介绍

`Conversations` 是一个基于 Vue 3 和 Element Plus 开发的会话管理组件，支持分组展示、菜单交互、滚动加载、自定义样式等功能。适用于消息列表、文件管理、任务分组等场景，通过灵活的配置和插槽扩展，满足多样化的业务需求。

### 基础使用

## 代码示例

### absolute-custom

```vue
<docs>
---
title: 绝对自定义样式与分组标题
---

通过插槽和样式属性自定义会话项外观及分组标题图标，支持悬停、激活、菜单打开状态的样式定制。
</docs>

<script setup lang="ts">
import type { GroupableOptions } from 'vue-element-plus-x/types/Conversations';

const menuTestItems1 = ref([
  {
    key: 'm1',
    label: '菜单测试项目 1 - 长文本效果演示文本长度溢出效果测试'.repeat(2),
    group: '工作'
  },
  {
    key: 'm2',
    label: '菜单测试项目 2',
    disabled: true,
    group: '工作'
  },
  {
    key: 'm3',
    label: '菜单测试项目 3',
    group: '工作'
  },
  {
    key: 'm4',
    label: '菜单测试项目 4',
    group: '学习'
  },
  {
    key: 'm5',
    label: '菜单测试项目 5',
    group: '学习'
  },
  {
    key: 'm6',
    label: '菜单测试项目 6',
    group: '学习'
  },
  {
    key: 'm7',
    label: '菜单测试项目 7',
    group: '学习'
  },
  {
    key: 'm8',
    label: '菜单测试项目 8',
    group: '个人'
  },
  {
    key: 'm9',
    label: '菜单测试项目 9',
    group: '个人'
  },
  {
    key: 'm10',
    label: '菜单测试项目 10',
    group: '个人'
  },
  {
    key: 'm11',
    label: '菜单测试项目 11',
    group: '个人'
  },
  {
    key: 'm12',
    label: '菜单测试项目 12'
  },
  {
    key: 'm13',
    label: '菜单测试项目 13'
  },
  {
    key: 'm14',
    label: '菜单测试项目 14'
  }
]);
const conversationMenuItems1 = [
  {
    key: 'edit',
    label: '编辑',
    icon: '🍉',
    command: {
      self_id: '1',
      self_message: '编辑',
      self_type: 'primary'
    }
  },
  {
    key: 'delete',
    label: '删除',
    icon: '🍎',
    disabled: true,
    divided: true
  },
  {
    key: 'share',
    label: '分享',
    icon: '🍆',
    command: 'share'
  }
];

const activeKey5 = ref('m1');

// 自定义分组选项
const customGroupOptions: GroupableOptions = {
  // 自定义分组排序，学习 > 工作 > 个人 > 未分组
  sort: (a: any, b: any) => {
    const order: Record<string, number> = {
      学习: 0,
      工作: 1,
      个人: 2,
      未分组: 3
    };
    const orderA = order[a] !== undefined ? order[a] : 999;
    const orderB = order[b] !== undefined ? order[b] : 999;
    return orderA - orderB;
  }
};

// 处理菜单点击
function handleMenuClick(menuKey: string, item: any) {
  console.log('菜单点击', menuKey, item);

  switch (menuKey) {
    case 'edit':
      console.log(`编辑: ${item.label}`);
      ElMessage.warning(`编辑: ${item.label}`);
      break;
    case 'delete':
      console.log(`删除: ${item.label}`);
      ElMessage.error(`删除: ${item.label}`);
      break;
    case 'share':
      console.log(`分享: ${item.label}`);
      ElMessage.success(`分享: ${item.label}`);
      break;
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey5"
      :items="menuTestItems1"
      :label-max-width="200"
      :show-tooltip="true"
      tooltip-placement="right"
      :tooltip-offset="35"
      show-built-in-menu
      :groupable="customGroupOptions"
      row-key="key"
      :items-style="{
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
        marginBottom: '20px',
        border: '2px dashed transparent'
      }"
      :items-hover-style="{
        background: '#FAFAD2',
        border: '2px dashed #006400'
      }"
      :items-active-style="{
        background: '#006400',
        color: '#FFFAFA',
        border: '2px dashed transparent'
      }"
      :items-menu-opened-style="{
        border: '2px dashed transparent'
      }"
      :menu-style="{
        backgroundColor: 'red',
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        padding: '10px 20px',
        height: '200px'
      }"
    >
      <template #label="{ item }">
        <div class="custom-label">
          {{ item.label }}
        </div>
      </template>

      <template #groupTitle="{ group }">
        <div class="custom-group-title">
          <!-- 为不同组添加不同的前缀 -->
          <span v-if="group.title === '工作'">📊 </span>
          <span v-else-if="group.title === '学习'">📚 </span>
          <span v-else-if="group.title === '个人'">🏠 </span>
          <span v-else>📁 </span>
          {{ group.title }}
        </div>
      </template>

      <template
        #more-filled="{ item, isHovered, isActive, isMenuOpened, isDisabled }"
      >
        <span v-if="isHovered">✍️</span>
        <span v-if="isActive">✅</span>
        <span v-if="isMenuOpened">🥰</span>
        <span
          v-if="isDisabled"
          :style="{
            background: 'black',
            padding: '5px',
            borderRadius: '10px',
            color: 'white',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }"
        >
          🫥是否禁用：{{ item?.disabled }}
        </span>
      </template>

      <template #menu="{ item }">
        <div class="menu-buttons">
          <div
            v-for="menuItem in conversationMenuItems1"
            :key="menuItem.key"
            class="menu-self-button"
            @click.stop="handleMenuClick(menuItem.key, item)"
          >
            <span v-if="menuItem.icon">{{ menuItem.icon }}</span>
            <span v-if="menuItem.label">{{ menuItem.label }}</span>
          </div>
        </div>
      </template>
    </Conversations>
  </div>
</template>

<style scoped lang="less">
.custom-group-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #409eff;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 12px;

  // 自定义菜单按钮-el-button样式
  .el-button {
    padding: 4px 8px;
    margin-left: 0;

    .el-icon {
      margin-right: 8px;
    }
  }

  // 自定义菜单按钮-自定义样式
  .menu-self-button {
    display: flex;
    padding: 4px 8px;
    align-items: center;
    border-radius: 5px;
    margin-left: 0;
    cursor: pointer;
    gap: 8px;

    &:hover {
      background-color: #f5f7fa;
      color: #409eff;
    }
  }
}

.custom-label {
  display: flex;
  align-items: center;
  // 溢出隐藏
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>

```

### base

```vue
<docs>
---
title: 基础使用
---

通过 `@change` 事件 获取选中的会话信息。 `v-model:active` 绑定当前选中的会话。
</docs>

<script setup lang="ts">
import type { ConversationItem } from 'vue-element-plus-x/types/Conversations';

const timeBasedItems = ref<ConversationItem<{ id: string; label: string }>[]>([
  {
    id: '1',
    label: '今天的会话111111111111111111111111111',
    group: 'today'
  },
  {
    id: '2',
    group: 'today',
    label: '今天的会话2',
    disabled: true
  },
  {
    id: '3',
    group: 'yesterday',
    label: '昨天的会话1'
  },
  {
    id: '4',
    label: '昨天的会话2'
  },
  {
    id: '5',
    label: '一周前的会话'
  },
  {
    id: '6',
    label: '一个月前的会话'
  },
  {
    id: '7',
    label: '很久以前的会话'
  }
]);

const activeKey1 = ref();

function handleChange(item: ConversationItem<{ id: string; label: string }>) {
  ElMessage.success(`选中了: ${item.label}`);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey1"
      :items="timeBasedItems"
      :label-max-width="200"
      :show-tooltip="true"
      row-key="id"
      @change="handleChange"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### built-in-menu-type

```vue
<docs>
---
title: 下拉菜单按钮展示风格
---

使用 `showBuiltInMenuType` 属性，可以设置是否总是显示内置菜单按钮。

`showBuiltInMenuType` 属性的可选值有：

- `hover`：鼠标悬停时显示内置菜单按钮（默认）
- `always`：总是显示内置菜单按钮
</docs>

<script setup lang="ts">
import type {
  ConversationItem,
  ConversationMenuCommand
} from 'vue-element-plus-x/types/Conversations';

const menuTestItems = ref([
  {
    key: 'm1',
    label: '菜单测试项目 1 - 长文本效果演示文本长度溢出效果测试'.repeat(2)
  },
  {
    key: 'm2',
    label: '菜单测试项目 2',
    disabled: true
  },
  {
    key: 'm3',
    label: '菜单测试项目 3'
  },
  {
    key: 'm4',
    label: '菜单测试项目 4'
  },
  {
    key: 'm5',
    label: '菜单测试项目 5'
  },
  {
    key: 'm6',
    label: '菜单测试项目 6'
  },
  {
    key: 'm7',
    label: '菜单测试项目 7'
  },
  {
    key: 'm8',
    label: '菜单测试项目 8'
  },
  {
    key: 'm9',
    label: '菜单测试项目 9'
  },
  {
    key: 'm10',
    label: '菜单测试项目 10'
  },
  {
    key: 'm11',
    label: '菜单测试项目 11'
  },
  {
    key: 'm12',
    label: '菜单测试项目 12'
  },
  {
    key: 'm13',
    label: '菜单测试项目 13'
  },
  {
    key: 'm14',
    label: '菜单测试项目 14'
  }
]);

const activeKey4 = ref('m1');

// 内置菜单点击方法
function handleMenuCommand(
  command: ConversationMenuCommand,
  item: ConversationItem
) {
  console.log('内置菜单点击事件：', command, item);
  // 直接修改 item 是否生效
  if (command === 'delete') {
    const index = menuTestItems.value.findIndex(
      itemSlef => itemSlef.key === item.key
    );

    if (index !== -1) {
      menuTestItems.value.splice(index, 1);
      console.log('删除成功');
      ElMessage.success('删除成功');
    }
  }
  if (command === 'rename') {
    item.label = '已修改';
    console.log('重命名成功');
    ElMessage.success('重命名成功');
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey4"
      :items="menuTestItems"
      :label-max-width="200"
      :show-tooltip="true"
      row-key="key"
      tooltip-placement="right"
      :tooltip-offset="35"
      show-to-top-btn
      show-built-in-menu
      show-built-in-menu-type="always"
      @menu-command="handleMenuCommand"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### built-in-menu

```vue
<docs>
---
title: 内置下拉菜单
---

内置基础菜单功能（重命名、删除），支持菜单命令回调，轻松实现会话项的快捷操作。

`@menu-command` 触发内置的菜单点击事件。
</docs>

<script setup lang="ts">
import type {
  ConversationItem,
  ConversationMenuCommand
} from 'vue-element-plus-x/types/Conversations';

const menuTestItems = ref([
  {
    key: 'm1',
    label: '菜单测试项目 1 - 长文本效果演示文本长度溢出效果测试'.repeat(2)
  },
  {
    key: 'm2',
    label: '菜单测试项目 2',
    disabled: true
  },
  {
    key: 'm3',
    label: '菜单测试项目 3'
  },
  {
    key: 'm4',
    label: '菜单测试项目 4'
  },
  {
    key: 'm5',
    label: '菜单测试项目 5'
  },
  {
    key: 'm6',
    label: '菜单测试项目 6'
  },
  {
    key: 'm7',
    label: '菜单测试项目 7'
  },
  {
    key: 'm8',
    label: '菜单测试项目 8'
  },
  {
    key: 'm9',
    label: '菜单测试项目 9'
  },
  {
    key: 'm10',
    label: '菜单测试项目 10'
  },
  {
    key: 'm11',
    label: '菜单测试项目 11'
  },
  {
    key: 'm12',
    label: '菜单测试项目 12'
  },
  {
    key: 'm13',
    label: '菜单测试项目 13'
  },
  {
    key: 'm14',
    label: '菜单测试项目 14'
  }
]);

const activeKey4 = ref('m1');

// 内置菜单点击方法
function handleMenuCommand(
  command: ConversationMenuCommand,
  item: ConversationItem
) {
  console.log('内置菜单点击事件：', command, item);
  // 直接修改 item 是否生效
  if (command === 'delete') {
    const index = menuTestItems.value.findIndex(
      itemSlef => itemSlef.key === item.key
    );

    if (index !== -1) {
      menuTestItems.value.splice(index, 1);
      console.log('删除成功');
      ElMessage.success('删除成功');
    }
  }
  if (command === 'rename') {
    item.label = '已修改';
    console.log('重命名成功');
    ElMessage.success('重命名成功');
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey4"
      :items="menuTestItems"
      :label-max-width="200"
      :show-tooltip="true"
      row-key="key"
      tooltip-placement="right"
      :tooltip-offset="35"
      show-to-top-btn
      show-built-in-menu
      @menu-command="handleMenuCommand"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### custom-group-sort

```vue
<docs>
---
title: 自定义分组排序
---

通过 `groupable` 属性传入排序函数，自定义分组顺序（如：学习 > 工作 > 个人 > 未分组）。
</docs>

<script setup lang="ts">
import type { GroupableOptions } from 'vue-element-plus-x/types/Conversations';

const groupBasedItems = ref([
  {
    key: 'g1',
    label: '工作文档1',
    group: '工作'
  },
  {
    key: 'g2',
    label: '工作文档11111111111111111111111111111111111111111',
    group: '工作'
  },
  {
    key: 'g3',
    label: '工作文档3',
    group: '工作'
  },
  {
    key: 'g4',
    label: '工作文档4',
    group: '工作'
  },
  {
    key: 'g5',
    label: '工作文档5',
    group: '工作'
  },
  {
    key: 'g6',
    label: '工作文档6',
    group: '工作'
  },
  {
    key: 'g7',
    label: '学习笔记1',
    group: '学习'
  },
  {
    key: 'g8',
    label: '学习笔记2',
    group: '学习'
  },
  {
    key: 'g9',
    label: '个人文档1',
    group: '个人'
  },
  {
    key: 'g10',
    label: '未分组项目'
  }
]);

// 自定义分组选项
const customGroupOptions: GroupableOptions = {
  // 自定义分组排序，学习 > 工作 > 个人 > 未分组
  sort: (a: any, b: any) => {
    const order: Record<string, number> = {
      学习: 0,
      工作: 1,
      个人: 2,
      未分组: 3
    };
    const orderA = order[a] !== undefined ? order[a] : 999;
    const orderB = order[b] !== undefined ? order[b] : 999;
    return orderA - orderB;
  }
};

const activeKey2 = ref('g1');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey2"
      :items="groupBasedItems"
      :groupable="customGroupOptions"
      :label-max-width="200"
      :show-tooltip="true"
      show-to-top-btn
      row-key="key"
    >
      <template #groupTitle="{ group }">
        <div class="custom-group-title">
          <!-- 为不同组添加不同的前缀 -->
          <span v-if="group.title === '工作'">📊 </span>
          <span v-else-if="group.title === '学习'">📚 </span>
          <span v-else-if="group.title === '个人'">🏠 </span>
          <span v-else>📁 </span>
          {{ group.title }}
        </div>
      </template>
    </Conversations>
  </div>
</template>

<style scoped lang="less">
.custom-group-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #409eff;
}
</style>

```

### custom-menu

```vue
<docs>
---
title: 自定义菜单交互
---

通过插槽扩展菜单内容，支持图标、文本及自定义命令，满足复杂业务逻辑。
</docs>

<script setup lang="ts">
import { Delete, Edit, EditPen, Share } from '@element-plus/icons-vue';

const menuTestItems = ref([
  {
    key: 'm1',
    label: '菜单测试项目 1 - 长文本效果演示文本长度溢出效果测试'.repeat(2)
  },
  {
    key: 'm2',
    label: '菜单测试项目 2',
    disabled: true
  },
  {
    key: 'm3',
    label: '菜单测试项目 3'
  },
  {
    key: 'm4',
    label: '菜单测试项目 4'
  },
  {
    key: 'm5',
    label: '菜单测试项目 5'
  },
  {
    key: 'm6',
    label: '菜单测试项目 6'
  },
  {
    key: 'm7',
    label: '菜单测试项目 7'
  },
  {
    key: 'm8',
    label: '菜单测试项目 8'
  },
  {
    key: 'm9',
    label: '菜单测试项目 9'
  },
  {
    key: 'm10',
    label: '菜单测试项目 10'
  },
  {
    key: 'm11',
    label: '菜单测试项目 11'
  },
  {
    key: 'm12',
    label: '菜单测试项目 12'
  },
  {
    key: 'm13',
    label: '菜单测试项目 13'
  },
  {
    key: 'm14',
    label: '菜单测试项目 14'
  }
]);

const conversationMenuItems = [
  {
    key: 'edit',
    label: '编辑',
    icon: Edit,
    command: {
      self_id: '1',
      self_message: '编辑',
      self_type: 'primary'
    }
  },
  {
    key: 'delete',
    label: '删除',
    icon: Delete,
    disabled: true,
    divided: true
  },
  {
    key: 'share',
    label: '分享',
    icon: Share,
    command: 'share'
  }
];

const activeKey4 = ref('m1');

// 处理菜单点击
function handleMenuClick(menuKey: string, item: any) {
  console.log('菜单点击', menuKey, item);

  switch (menuKey) {
    case 'edit':
      console.log(`编辑: ${item.label}`);
      ElMessage.warning(`编辑: ${item.label}`);
      break;
    case 'delete':
      console.log(`删除: ${item.label}`);
      ElMessage.error(`删除: ${item.label}`);
      break;
    case 'share':
      console.log(`分享: ${item.label}`);
      ElMessage.success(`分享: ${item.label}`);
      break;
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey4"
      :items="menuTestItems"
      row-key="key"
      :label-max-width="200"
      :show-tooltip="true"
      show-to-top-btn
      show-built-in-menu
    >
      <template #more-filled>
        <el-icon>
          <EditPen />
        </el-icon>
      </template>

      <template #menu="{ item }">
        <div class="menu-buttons">
          <el-button
            v-for="menuItem in conversationMenuItems"
            :key="menuItem.key"
            link
            size="small"
            @click.stop="handleMenuClick(menuItem.key, item)"
          >
            <el-icon v-if="menuItem.icon">
              <component :is="menuItem.icon" />
            </el-icon>
            <span v-if="menuItem.label">{{ menuItem.label }}</span>
          </el-button>
        </div>
      </template>
    </Conversations>
  </div>
</template>

<style scoped lang="less">
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 12px;

  // 自定义菜单按钮-el-button样式
  .el-button {
    padding: 4px 8px;
    margin-left: 0;

    .el-icon {
      margin-right: 8px;
    }
  }
}
</style>

```

### lazy-loading

```vue
<docs>
---
title: 懒加载功能
---

滚动至底部时自动触发加载更多数据，支持加载状态显示，优化大数据量场景性能。
</docs>

<script setup lang="ts">
import { ChatDotRound, ChatLineRound } from '@element-plus/icons-vue';

const lazyItems = shallowRef([
  {
    key: 'l1',
    label: '初始项目1',
    prefixIcon: ChatLineRound
  },
  {
    key: 'l2',
    label: '初始项目2',
    prefixIcon: ChatDotRound
  },
  {
    key: 'l3',
    label: '初始项目3',
    prefixIcon: ChatLineRound
  },
  {
    key: 'l4',
    label: '初始项目1',
    prefixIcon: ChatLineRound
  },
  {
    key: 'l5',
    label: '初始项目2',
    prefixIcon: ChatDotRound
  },
  {
    key: 'l6',
    label: '初始项目3',
    prefixIcon: ChatLineRound
  },
  {
    key: 'l7',
    label: '初始项目1',
    prefixIcon: ChatLineRound
  },
  {
    key: 'l8',
    label: '初始项目2',
    prefixIcon: ChatDotRound
  },
  {
    key: 'l9',
    label: '初始项目3',
    prefixIcon: ChatLineRound
  }
]);

// 加载更多处理
const isLoading = ref(false);

function loadMoreItems() {
  if (isLoading.value)
    return;

  isLoading.value = true;
  console.log('加载更多数据...');

  // 模拟异步加载
  setTimeout(() => {
    const newItems = [
      {
        key: `l${lazyItems.value.length + 1}`,
        label: `加载的项目${lazyItems.value.length + 1}`,
        prefixIcon: markRaw(ChatLineRound)
      },
      {
        key: `l${lazyItems.value.length + 2}`,
        label: `加载的项目${lazyItems.value.length + 2}`,
        prefixIcon: markRaw(ChatDotRound)
      }
    ];

    lazyItems.value = [...lazyItems.value, ...newItems];
    isLoading.value = false;
  }, 2000);
}

const activeKey6 = ref('l1');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey6"
      :items="lazyItems"
      :label-max-width="200"
      row-key="key"
      :show-tooltip="true"
      :load-more="loadMoreItems"
      :load-more-loading="isLoading"
      show-to-top-btn
    />
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

通过 `ConfigProvider.themeOverrides` 覆盖 `Conversations` 的 `--elx-*` 变量（列表背景、标签高度等）。
</docs>

<script setup lang="ts">
import type { ConversationItem } from 'vue-element-plus-x/types/Conversations';
import { computed, ref } from 'vue';

const enabled = ref(true);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#ec4899',
      'border-color': 'rgba(236, 72, 153, 0.38)',
      'fill-color': 'rgba(236, 72, 153, 0.10)',
      'fill-color-light': 'rgba(236, 72, 153, 0.06)',
      'text-color-primary': 'rgba(15, 23, 42, 0.92)',
      'text-color-regular': 'rgba(15, 23, 42, 0.80)',
      'box-shadow': '0 18px 54px rgba(236, 72, 153, 0.20)'
    },
    components: {
      Conversations: {
        'conversations-list-auto-bg-color': 'rgba(236, 72, 153, 0.06)',
        'conversations-label-height': '32px'
      }
    }
  };
});

const items = ref<ConversationItem<{ id: string; label: string }>[]>([
  { id: '1', label: '新对话', group: 'today' },
  { id: '2', label: '需求讨论', group: 'today' },
  { id: '3', label: '异常排查', group: 'yesterday' },
  { id: '4', label: '版本回归', group: 'last-week' }
]);

const active = ref<string>('2');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>开启覆写后，可看到列表背景与条目高度变化。</div>
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
              1200px 260px at 0% 0%,
              rgba(236, 72, 153, 0.2),
              transparent 60%
            ),
            radial-gradient(
              900px 240px at 100% 20%,
              rgba(168, 85, 247, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
        "
      >
        <Conversations
          v-model:active="active"
          :items="items"
          row-key="id"
          :items-style="{
            borderRadius: '12px',
            margin: '6px 10px',
            padding: '10px 12px',
            background: 'var(--elx-fill-color-light)',
            border: '1px solid var(--elx-border-color)'
          }"
          :items-hover-style="{
            background: 'var(--elx-fill-color)'
          }"
          :items-active-style="{
            background: 'rgba(236, 72, 153, 0.14)',
            border: '1px solid rgba(236, 72, 153, 0.40)'
          }"
          style="width: 340px; height: 300px"
        />
      </div>
    </ConfigProvider>
  </div>
</template>

```

### time-grouping

```vue
<docs>
---
title: 时间分组与吸顶效果
---

自动根据会话项的 `group` 字段分组，滚动时分组标题吸顶显示，提升导航体验。
</docs>

<script setup lang="ts">
import type { ConversationItem } from 'vue-element-plus-x/types/Conversations';

const timeBasedItems = ref<ConversationItem<{ id: string; label: string }>[]>([
  {
    id: '1',
    label: '今天的会话111111111111111111111111111',
    group: 'today',
    disabled: true
  },
  {
    id: '2',
    group: 'today',
    label: '今天的会话2'
  },
  {
    id: '3',
    group: 'yesterday',
    label: '昨天的会话1'
  },
  {
    id: '4',
    label: '昨天的会话2'
  },
  {
    id: '5',
    label: '一周前的会话'
  },
  {
    id: '6',
    label: '一个月前的会话'
  },
  {
    id: '7',
    label: '很久以前的会话'
  }
]);

const activeKey1 = ref('1');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 420px">
    <Conversations
      v-model:active="activeKey1"
      :items="timeBasedItems"
      groupable
      :label-max-width="200"
      :show-tooltip="false"
      row-key="id"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

## API 参考

### 时间分组与吸顶效果

### 自定义分组排序

### 内置下拉菜单

### 内置下拉菜单按钮展示风格

### 自定义菜单交互

### 懒加载功能

### 自定义样式与分组标题

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `Conversations` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#conversations)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

## 属性

| 属性名                 | 类型                          | 是否必填 | 默认值    | 描述                                                      |
| ---------------------- | ----------------------------- | -------- | --------- | --------------------------------------------------------- |
| `items`                | `ConversationItem<T>[]`       | 否       | `[]`      | 会话项数据列表，包含 `label`、`group`、`disabled` 等字段  |
| `groupable`            | `boolean \| GroupableOptions` | 否       | `false`   | 是否启用分组功能，传入对象可自定义分组排序（`sort` 函数） |
| `showBuiltInMenu`      | `boolean`                     | 否       | `false`   | 是否显示内置菜单（重命名、删除）                          |
| `loadMore`             | `() => void`                  | 否       | -         | 懒加载回调函数，滚动至底部时触发                          |
| `loadMoreLoading`      | `boolean`                     | 否       | `false`   | 加载更多状态，控制加载动画显示                            |
| `showToTopBtn`         | `boolean`                     | 否       | `false`   | 是否显示返回顶部按钮                                      |
| `labelKey`             | `string`                      | 否       | `'label'` | 会话项标签字段名                                          |
| `rowKey`               | `string`                      | 否       | `'id'`    | 会话项唯一标识字段名                                      |
| `itemsStyle`           | `CSSProperties`               | 否       | `{}`      | 会话项默认样式                                            |
| `itemsHoverStyle`      | `CSSProperties`               | 否       | `{}`      | 会话项悬停样式                                            |
| `itemsActiveStyle`     | `CSSProperties`               | 否       | `{}`      | 会话项激活样式                                            |
| `itemsMenuOpenedStyle` | `CSSProperties`               | 否       | `{}`      | 会话项菜单打开时样式                                      |

## 插槽

| 插槽名         | 参数                                                      | 描述                                                                                                                         |
| -------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `#groupTitle`  | `{ group: GroupItem }`                                    | 自定义分组标题，支持添加图标或特殊样式                                                                                       |
| `#label`       | `{ item: ConversationItem<T> }`                           | 自定义会话项标签内容，支持文本溢出处理或富文本                                                                               |
| `#more-filled` | `{ item, isHovered, isActive, isMenuOpened, isDisabled }` | 会话项右侧附加内容，显示状态标识（如：禁用标记、操作图标）                                                                   |
| `#menu`        | `{ item: ConversationItem<T>, handleOpen, handleClose }`  | 自定义菜单内容，支持按钮、图标或复杂交互组件,`handleOpen`用来手动控制下拉菜单的开启,`handleClose`用来手动控制下拉菜单的关闭. |
| `#header`      | -                                                         | 容器头部插槽，用于添加搜索栏、筛选按钮等自定义内容                                                                           |
| `#footer`      | -                                                         | 容器底部插槽，用于添加分页、统计信息等自定义内容                                                                             |

## 事件

| 事件           | 参数                                                               | 描述                                                                                                 |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `@menuCommand` | `(command: ConversationMenuCommand, item: ConversationItem): void` | 菜单命令回调，支持重命名、删除等操作。如果你选择自定义菜单，这个方法失效，需要自行处点击菜单的逻辑。 |
| `:loadMore`    | --                                                                 | 绑定懒加载回调，滚动至底部时触发                                                                     |

## 功能特性

1. **灵活分组管理**

- 自动根据 `group` 字段分组，未分组项统一归至“未分组”标题下
- 支持自定义分组排序（通过 `groupable.sort` 函数），实现业务逻辑定制
- 分组标题吸顶显示，滚动时保持导航可见性

2. **丰富的交互支持**

- 内置基础菜单（重命名、删除），支持通过 `@menu-command` 监听命令回调
- 自定义菜单插槽，轻松扩展分享、编辑等复杂操作
- 会话项状态样式独立配置（默认、悬停、激活、菜单打开），视觉反馈清晰

3. **性能优化**

- 懒加载功能：滚动至底部自动加载更多数据，减少初始渲染压力

4. **高度可定制**

- 全量样式属性：通过 `itemsStyle` 系列属性自定义会话项外观
- 深度插槽扩展：标签、分组标题、菜单内容均可通过插槽完全自定义
- 响应式设计：支持自适应宽度和滚动条隐藏，适配不同容器尺寸
---

# FilesCard 文件卡片

## 介绍

`FilesCard` 组件是一个灵活的文件展示组件，支持多种文件类型（图片、文档、压缩包等）的可视化呈现，包含文件图标、名称、描述、状态等信息，同时提供丰富的自定义选项和交互功能，适用于文件管理、上传预览等场景。

### 基本使用

## 代码示例

### base

```vue
<docs>
---
title: 基础用法
---

你可以在 组件实例上拿到 colorMap 内置文件类型 fileType: color 对象。 内置了 16 种文件类型图标。
</docs>

<script setup lang="ts">
import type { FilesType } from 'vue-element-plus-x/types/FilesCard';

const filesCardRef = ref();
const colorMap = ref({}) as Ref<Record<FilesType, string>>;

onMounted(() => {
  // 获取内置颜色
  colorMap.value = filesCardRef.value?.colorMap;
  console.log(colorMap.value);
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <span>设置 name 属性, 且 name 没有后缀。name="测试文件"</span>
    <FilesCard ref="filesCardRef" name="测试文件" />
    <span>设置 name 属性，有文件后缀。name="测试文件.pdf"</span>
    <FilesCard name="测试文件.pdf" />
    <span>支持更据 name 后缀匹配内置图标 </span>
    <div class="files-card-container">
      <FilesCard name="测试doc后缀.doc" />
      <FilesCard name="测试xls后缀.xls" />
      <FilesCard name="测试ppt后缀.ppt" />
      <FilesCard name="测试txt后缀.txt" />
      <FilesCard name="测试pdf后缀.pdf" />
      <FilesCard name="测试png后缀.png" />
      <FilesCard name="测试jpg后缀.jpg" />
      <FilesCard name="测试gif后缀.gif" />
      <FilesCard name="测试mp4后缀.mp4" />
      <FilesCard name="测试mp3后缀.mp3" />
      <FilesCard name="测试zip后缀.zip" />
      <FilesCard name="测试rar后缀.rar" />
      <FilesCard name="测试7z后缀.7z" />
      <FilesCard name="测试lnk后缀.lnk" />
      <FilesCard name="测试obj后缀.obj" />
      <FilesCard name="测试fbx后缀.fbx" />
      <FilesCard name="测试glb后缀.glb" />
      <FilesCard name="测试sql后缀.sql" />
      <FilesCard name="测试db后缀.db" />
      <FilesCard name="测试md后缀.md" />
      <FilesCard name="测试js后缀.js" />
      <FilesCard name="测试py后缀.py" />
      <FilesCard name="测试java后缀.java" />
      <FilesCard name="测试php后缀.php" />
      <FilesCard name="测试json后缀.json" />
    </div>
    <span>如果有后缀，但是匹配不到常用的图标，则默认为 File 文件</span>
    <FilesCard name="https://dd.com多个特殊字符.后缀.self" />
  </div>
</template>

<style scoped lang="less">
.files-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

```

### custom-color

```vue
<docs>
---
title: 自定义内置文件对应的颜色
---
</docs>

<script setup lang="ts">
import type {
  FilesCardProps,
  FilesType
} from 'vue-element-plus-x/types/FilesCard';

// 自己定义文件颜色1
const colorMap1: Record<FilesType, string> = {
  word: '#5E74A8',
  excel: '#4A6B4A',
  ppt: '#C27C40',
  pdf: '#5A6976',
  txt: '#D4C58C',
  mark: '#FFA500',
  image: '#8E7CC3',
  audio: '#A67B5B',
  video: '#4A5568',
  three: '#5F9E86',
  code: '#4B636E',
  database: '#4A5A6B',
  link: '#5D7CBA',
  zip: '#8B5E3C',
  file: '#AAB2BF',
  unknown: '#888888'
};

// 自己定义文件颜色2
const colorMap2: Record<FilesType, string> = {
  word: '#0078D4',
  excel: '#4CB050',
  ppt: '#FF9933',
  pdf: '#E81123',
  txt: '#666666',
  mark: '#FFA500',
  image: '#B490F3',
  audio: '#00B2EE',
  video: '#2EC4B6',
  three: '#00C8FF',
  code: '#00589F',
  database: '#F5A623',
  link: '#007BFF',
  zip: '#888888',
  file: '#F0D9B5',
  unknown: '#D8D8D8'
};

type ColorKey = keyof typeof colorMap1;
const colorKeys = computed(() => Object.keys(colorMap1) as ColorKey[]);

const filesCardProps = ref<FilesCardProps>({
  uid: '1',
  name: '测试名称',
  description: '测试description'
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div class="files-card-container-wrapper">
      <p>自定义颜色1</p>
      <div class="files-card-container">
        <FilesCard
          v-for="items in colorKeys"
          :key="items"
          v-bind="{ ...filesCardProps }"
          :icon-color="colorMap1[items]"
          :file-type="items"
        />
      </div>
      <p>自定义颜色2</p>
      <div class="files-card-container">
        <FilesCard
          v-for="items in colorKeys"
          :key="items"
          v-bind="{ ...filesCardProps }"
          :icon-color="colorMap2[items]"
          :file-type="items"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.files-card-container-wrapper {
  display: flex;
  gap: 12px;
  flex-direction: column;
  .files-card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>

```

### custom-style

```vue
<docs>
---
title: 定制样式
---

通过 `style`/`hoverStyle` 自定义卡片样式，支持悬停删除图标和自定义插槽扩展。
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <FilesCard
      name="自定义style样式.xls"
      style="
        background-color: #f0f9eb;
        border: 2px solid #67c23a;
        border-radius: 20px;
      "
    />
    <FilesCard
      name="自定义hoverStyle样式.xls"
      style="
        background-color: #f0f9eb;
        border: 1px solid #67c23a;
        border-radius: 20px;
      "
      :hover-style="{
        'box-shadow': '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        'border-color': 'red',
        'background-color': 'rgba(255, 0, 0, 0.1)'
      }"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### delete-icon

```vue
<docs>
---
title: 删除图标、删除事件
---

可以设置 `showDelIcon` 属性来显示删除图标，并设置 `@delete` 方法来设置删除事件。
</docs>

<script setup lang="ts">
function handleDel() {
  ElMessage.success('删除成功');
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <FilesCard name="删除测试文件.md" show-del-icon @delete="handleDel" />
  </div>
</template>

<style scoped lang="less"></style>

```

### image-preview

```vue
<docs>
---
title: 图片文件专区
---

支持图片预览、正方形/长方形变体、上传状态覆盖层等功能。同样也可以 通过 status 和 percent 控制。
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div class="files-card-container-wrapper">
      <span>图片文件 <span style="color: red">可预览</span> 和
        <span style="color: red">不可预览</span></span>
      <div class="files-card-container">
        <FilesCard
          name="可预览的图片.jpeg"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard name="无法预览的图片.jpeg" show-del-icon />
      </div>
      <span>图片文件
        <span style="color: red">正方形变体</span>
        其他格式不受变体属性影响</span>
      <div class="files-card-container">
        <FilesCard
          name="可预览的图片.jpeg"
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
          img-variant="square"
          show-del-icon
        />
        <FilesCard
          name="无法预览的图片.jpeg"
          img-variant="square"
          show-del-icon
        />
        <FilesCard
          name="其他文件不受变体影响.txt"
          img-variant="square"
          show-del-icon
          :file-size="30000"
        />
      </div>
      <span>图片文件 默认长方形变体
        <span style="color: red">支持上传状态 、支持预览开启关闭 、支持预览遮罩蒙层开启关闭</span></span>
      <div class="files-card-container">
        <FilesCard
          name="上传进度.jpeg"
          :percent="50"
          status="uploading"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard
          name="上传失败.jpeg"
          status="error"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard
          name="关闭预览悬停遮罩.jpeg"
          :img-preview-mask="false"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard
          name="关闭预览功能.jpeg"
          :img-preview="false"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
      </div>

      <span>图片文件 正方形变体
        <span style="color: red">支持上传状态 、支持预览开启关闭 、支持预览遮罩蒙层开启关闭</span></span>
      <div class="files-card-container">
        <FilesCard
          name="上传进度.jpeg"
          img-variant="square"
          :percent="50"
          status="uploading"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard
          name="上传失败.jpeg"
          img-variant="square"
          status="error"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard
          name="上传完成.jpeg"
          img-variant="square"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard
          name="关闭预览悬停遮罩.jpeg"
          img-variant="square"
          :img-preview-mask="false"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
        <FilesCard
          name="关闭预览功能.jpeg"
          img-variant="square"
          :img-preview="false"
          show-del-icon
          url="https://avatars.githubusercontent.com/u/76239030?v=4"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.files-card-container-wrapper {
  display: flex;
  gap: 12px;
  flex-direction: column;
  .files-card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>

```

### status

```vue
<docs>
---
title: status 和 percent 属性
---

控制文件加载状态（上传中、完成、失败）及进度显示。
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div class="files-card-container-wrapper">
      <span>设置 status 属性，控制文件加载状态 "uploading","done","error"</span>
      <div class="files-card-container">
        <FilesCard name="uploading 测试文件.pdf" status="uploading" />
        <FilesCard name="done 测试文件.pdf" status="done" />
        <FilesCard name="error 测试文件.pdf" status="error" />
      </div>
      <span>"uploading"+"percent"
        控制上传进度，"error"+"errorTip"控制自定义失败提示
      </span>
      <div class="files-card-container">
        <FilesCard
          name="uploading 测试文件.doc"
          status="uploading"
          :percent="50"
        />
        <FilesCard
          name="error 测试文件.doc"
          status="error"
          error-tip="自定义失败提示"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.files-card-container-wrapper {
  display: flex;
  gap: 12px;
  flex-direction: column;

  .files-card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>

```

### theme-overrides

```vue
<docs>
---
title: 自定义主题
---

通过 `ConfigProvider.themeOverrides` 覆盖 `FilesCard` 的 `--elx-*` 变量（背景、边框、删除按钮等）。
</docs>

<script setup lang="ts">
import { computed, ref } from 'vue';

const enabled = ref(true);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#10b981',
      'border-color': 'rgba(16, 185, 129, 0.38)',
      'text-color-regular': 'rgba(15, 23, 42, 0.82)',
      'box-shadow': '0 18px 54px rgba(16, 185, 129, 0.22)'
    },
    components: {
      FilesCard: {
        'files-card-bg':
          'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(20, 184, 166, 0.10))',
        'files-card-border-color': 'rgba(16, 185, 129, 0.32)',
        'files-card-progress-bg': 'rgba(16, 185, 129, 0.18)',
        'files-card-delete-bg':
          'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(20, 184, 166, 0.14))',
        'files-card-delete-border-color': 'rgba(16, 185, 129, 0.55)',
        'files-card-delete-color': '#10b981',
        'files-card-delete-shadow': '0 14px 38px rgba(16, 185, 129, 0.30)',
        'files-card-max-width': '320px'
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
      <div>点击右上角删除按钮，观察覆盖后的样式。</div>
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
              1000px 240px at 0% 0%,
              rgba(16, 185, 129, 0.2),
              transparent 60%
            ),
            radial-gradient(
              800px 220px at 100% 15%,
              rgba(20, 184, 166, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
        "
      >
        <div style="display: flex; flex-direction: column; gap: 12px">
          <FilesCard
            uid="a"
            name="release-notes.pdf"
            :file-size="1024 * 1024 * 2"
            description="上传完成"
            status="done"
            :show-del-icon="true"
          />
          <FilesCard
            uid="b"
            name="model.bin"
            :file-size="1024 * 1024 * 8"
            description="上传中"
            status="uploading"
            :percent="62"
            :show-del-icon="true"
          />
        </div>
      </div>
    </ConfigProvider>
  </div>
</template>

```

## API 参考

### 状态设置

### 展示删除图标

### 图片文件展示

### 自定义样式与交互

### 自定义内置文件颜色

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `FilesCard` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#filescard)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

## 属性

| 属性名           | 类型                               | 是否必填 | 默认值        | 描述                                                               |
| ---------------- | ---------------------------------- | -------- | ------------- | ------------------------------------------------------------------ |
| `uid`            | `string \| number`                 | 是       |               | 文件唯一标识符                                                     |
| `name`           | `string`                           | 否       | `undefined`   | 文件名（支持自动解析后缀匹配图标）                                 |
| `fileSize`       | `number`                           | 否       | `undefined`   | 文件大小（单位：字节，自动转换为易读格式）                         |
| `fileType`       | `string`                           | 否       | `undefined`   | 文件类型（优先级高于 `name` 后缀解析，如 `'image'`、`'document'`） |
| `description`    | `string`                           | 否       | `undefined`   | 描述文本（支持动态生成文件类型和大小信息）                         |
| `url`            | `string`                           | 否       | `undefined`   | 文件访问地址（图片文件可用于预览）                                 |
| `thumbUrl`       | `string`                           | 否       | `undefined`   | 图片缩略图地址                                                     |
| `imgFile`        | `File \| Blob`                     | 否       | `undefined`   | 图片文件流（自动解析为预览地址，仅用于上传前临时展示）             |
| `iconSize`       | `string`                           | 否       | `'42px'`      | 图标/图片尺寸                                                      |
| `iconColor`      | `string`                           | 否       | `undefined`   | 非图片文件的图标颜色（支持自定义色值）                             |
| `showDelIcon`    | `boolean`                          | 否       | `false`       | 是否显示悬停删除图标                                               |
| `maxWidth`       | `string`                           | 否       | `'236px'`     | 卡片最大宽度                                                       |
| `style`          | `CSSProperties`                    | 否       | `undefined`   | 卡片自定义样式                                                     |
| `hoverStyle`     | `CSSProperties`                    | 否       | `undefined`   | 卡片悬停时的自定义样式                                             |
| `imgVariant`     | `'rectangle' \| 'square'`          | 否       | `'rectangle'` | 图片卡片形态（长方形/正方形）                                      |
| `imgPreview`     | `boolean`                          | 否       | `true`        | 是否开启图片预览功能                                               |
| `imgPreviewMask` | `boolean`                          | 否       | `true`        | 是否显示图片预览遮罩蒙层                                           |
| `status`         | `'uploading' \| 'done' \| 'error'` | 否       | `undefined`   | 文件状态（控制进度条、错误提示等视觉反馈）                         |
| `percent`        | `number`                           | 否       | `0`           | 上传进度百分比（配合 `status="uploading"` 使用）                   |
| `errorTip`       | `string`                           | 否       | `'上传失败'`  | 错误状态自定义提示文本                                             |

## 插槽

| 插槽名                   | 插槽参数                                   | 描述                                                                |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| `#icon`                  | `{ item: FilesCardProps }`                 | 自定义图标区域（优先级高于自动解析的内置图标）                      |
| `#content`               | `{ item: FilesCardProps }`                 | 自定义内容区域（覆盖默认的名称和描述展示）                          |
| `#name-prefix`           | `{ item: FilesCardProps, prefix, suffix }` | 文件名前缀自定义（用于截断显示场景）                                |
| `#name-suffix`           | `{ item: FilesCardProps, prefix, suffix }` | 文件名后缀自定义（用于截断显示场景）                                |
| `#description`           | `{ item: FilesCardProps, prefix, suffix }` | 描述文本自定义（覆盖默认生成的描述）                                |
| `#image-preview-actions` | `{ item: FilesCardProps, prefix, suffix }` | 图片预览遮罩层内容（悬停时显示，需配合 `imgPreviewMask` 使用）      |
| `#del-icon`              | `{ item: FilesCardProps }`                 | 自定义删除图标（默认使用 Element Plus 的 `CircleCloseFilled` 图标） |

## 事件

| 事件名          | 回调参数       | 描述                                       |
| --------------- | -------------- | ------------------------------------------ |
| `delete`        | `{ ...props }` | 删除按钮点击时触发，传递当前卡片的完整属性 |
| `image-preview` | `{ ...props }` | 图片预览功能触发时调用（点击图片或遮罩层） |

## 功能特性

1. **文件类型自动识别**根据文件名后缀自动匹配内置图标（支持常见格式如 `.pdf`、`.png`、`.zip` 等），无匹配时显示通用文件图标。
2. **多状态可视化**支持 `uploading`（上传中，带进度条）、`done`（完成）、`error`（失败，带自定义提示）三种状态，状态样式自动切换。
3. **图片文件增强支持**支持图片预览功能（基于 Element Plus 图片预览组件），提供正方形/长方形变体，支持通过 `imgFile` 直接解析本地图片文件流。
4. **高度可定制化**自定义图标颜色、尺寸、卡片样式及悬停效果，通过插槽灵活扩展内容（如文件名截断显示、状态覆盖层）。
5. **响应式设计**支持通过 `maxWidth` 控制卡片最大宽度，适配不同布局场景，文件描述自动截断防止溢出。
---

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

# useRecord 录音

## 介绍

这是一个自动调用 浏览器内置 API 语音转文字的 钩子函数，让用户快速使用 语音转文字功能，并且返回开始、结束、错误等事件，和 loading 状态。方便开发者 集成使用，实现自定义的 语音按钮样式。

结合 `sender` 发送输入框 和 useRecord 钩子函数，可以很好的实现自定义的 语音按钮样式。

## 代码示例

### use

```vue
<docs>
---
title: useRecord 调用浏览器内置 语音识别
---

调用浏览器原生的语音识别 API，在 `谷歌浏览器` 中使用，需要在 `🪄魔法环境` 中才能正常使用。
</docs>

<script setup lang="ts">
import {
  Eleme,
  Loading,
  Mic,
  Microphone,
  RefreshRight,
  Service
} from '@element-plus/icons-vue';
import { useRecord } from 'vue-element-plus-x';

// useRecord 这是常规 写法
// const { start, value, loading, stop } = useRecord({ onEnd: handleEnd })

// useRecord 下面的写法是对 value 的解构赋值，将 value 取名为 text 并赋值给 text，让他和下面的 value 变量名不冲突
const {
  start,
  value: text,
  loading,
  stop
} = useRecord({
  onEnd: handleEnd
});

const value = ref('');
const senderRef = ref();

function handleStart() {
  start();
}

function handleEnd(res: string) {
  console.log('end:', res);
}

function submit() {
  console.log('submit:', text);
}

watch(
  text,
  val => {
    console.log('text:', val);
    value.value = val;
  },
  { deep: true }
);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex">
      <el-button :disabled="loading" @click="handleStart">
        {{ loading ? '录音中' : '开始录音' }}
      </el-button>
      <el-button :disabled="!loading" @click="stop"> 结束录音 </el-button>
    </div>

    <XSender ref="senderRef" v-model="value" @submit="submit">
      <template #action-list>
        <div class="btn-list">
          <el-button
            v-if="!loading"
            :loading="loading"
            type="primary"
            circle
            plain
            color="#EC0078"
            @click="handleStart"
          >
            <el-icon>
              <Mic />
            </el-icon>
          </el-button>

          <el-button
            v-else
            type="primary"
            circle
            color="#EC0078"
            :z-index="99"
            @click="stop"
          >
            <el-icon class="loading">
              <Eleme />
            </el-icon>
          </el-button>
        </div>
      </template>
    </XSender>

    <XSender ref="senderRef" v-model="value" @submit="submit">
      <template #action-list>
        <div class="btn-list">
          <el-button
            v-if="!loading"
            :loading="loading"
            type="primary"
            circle
            color="#626aef"
            @click="handleStart"
          >
            <el-icon><Microphone /></el-icon>
          </el-button>

          <el-button
            v-else
            type="primary"
            circle
            color="#626aef"
            plain
            :z-index="99"
            @click="stop"
          >
            <el-icon class="loading">
              <Loading />
            </el-icon>
          </el-button>
        </div>
      </template>
    </XSender>

    <XSender ref="senderRef" v-model="value" @submit="submit">
      <template #action-list>
        <div class="btn-list">
          <el-button
            v-if="!loading"
            :loading="loading"
            type="primary"
            color="#FE0006"
            test
            @click="handleStart"
          >
            <el-icon><Service /></el-icon>
          </el-button>

          <el-button
            v-else
            type="primary"
            color="#FE0006"
            plain
            :z-index="99"
            @click="stop"
          >
            <el-icon class="loading">
              <RefreshRight />
            </el-icon>
          </el-button>
        </div>
      </template>
    </XSender>
  </div>
</template>

<style scoped lang="less">
// 旋转
.loading {
  animation: rotate 1s linear infinite;
}

// 旋转样式
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

```

## API 参考

## config 配置

| 参数名 | 说明               | 类型                          |
| ------ | ------------------ | ----------------------------- |
| onEnd  | 结束语音的回调函数 | `(res: 语音转换结果) => void` |

## 返回钩子

| 属性名  | 说明               | 类型                         |
| ------- | ------------------ | ---------------------------- |
| start   | 触发开始语音       | `(event:MouseEvent) => void` |
| stop    | 触发开始语音       | `(event:MouseEvent) => void` |
| loading | 是否正在语音中     | `boolean`                    |
| value   | 语音转换的实时文字 | `string`                     |
---

# useSend 发送

## XRequest已废弃，推荐使用 hook-fetch（https://jsonlee12138.github.io/hook-fetch/）

## 背景介绍

基于 `ant-design-x` 的 `XRequest`，`XStream`，我们进行了深入的学习和讨论。

在复刻 `XStream` 后，针对更通用的 **控制请求数据** 和 **中断请求** 的场景，我们将 `ant-design-x` 的 `XRequest` 进行了重构，将其拆分成 **`前端终止场景`** 和 **`请求终止场景`**

两种场景 分别对应

- hooks `useSend` -- 前端终止场景
- 工具类 `XRequest` -- 请求终止场景

**🍒 两者可以单独拆开使用，组合使用可实现 `useXStream`，下面是他们的使用示例**

只需要传一个 `开始方法` ，即可获得 对应的 **loading** 状态，以及 对应的 **finish** 方法。

单个控制，代码不超过 10 行

## 代码示例

### XRequest-base

```vue
<docs>
---
title: XRequest 【单独】 基础用法
---

这样你就简单的使用 `XRequest` 控制了 请求的发起 和 中断请求中的状态。
简单的 `new XRequest()`，实例化对象，然后 `.send()` 开始请求， `.abort()` 停止请求。

我们可以在 `控制台` 查看到，流式请求 **请求被终止**。
</docs>

<script setup lang="ts">
import { XRequest } from 'vue-element-plus-x';

const str = ref('');

const sse = new XRequest({
  baseURL: 'https://node-test.element-plus-x.com',
  onMessage: (msg: { data: string }) => {
    console.log('onMessage:', msg);
    str.value += `
    ${msg.data}`;
  }
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button
        @click="
          () => {
            str = '';
            sse.send('/api/sse');
          }
        "
      >
        发起请求
      </el-button>

      <el-button @click="sse.abort()">
        取消请求
      </el-button>
    </div>

    <div>{{ str }}</div>
  </div>
</template>

```

### XRequest-use

```vue
<docs>
---
title: XRequest【单独】 全部属性
---

在 `new XRequest()` 中传入对应的配置项

`transformer` 可以对内应的响应数据进行转换处理，还提供了很多配置的 `回调方法`，供开发者使用。

大家也可在 `控制台` 查看 回调方法的打印
</docs>

<script setup lang="ts">
import { XRequest } from 'vue-element-plus-x';

const str = ref('');

const sse = new XRequest({
  baseURL: 'https://node-test.element-plus-x.com',
  type: 'fetch',
  transformer: e => {
    console.log('transformer:', e);
    const a = e.trim().split('\n');
    const r = a.pop();
    return r;
  },
  onMessage: msg => {
    console.log('onMessage:', msg);
    str.value += `\n${msg}`;
  },
  onError: (es, e) => {
    console.log('onError:', es, e);
  },
  onOpen: () => {
    console.log('onOpen');
  },
  onAbort: messages => {
    console.log('onAbort', messages);
  },
  onFinish: data => {
    console.log('onFinish:', data);
  }
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button
        @click="
          () => {
            str = '';
            sse.send('/api/sse');
          }
        "
      >
        发起请求
      </el-button>

      <el-button @click="sse.abort()">
        取消请求
      </el-button>
    </div>

    <div>{{ str }}</div>
  </div>
</template>

```

### useSend-XRequest

```vue
<docs>
---
title: useSend & XRequest【组合使用】
---
</docs>

<script setup lang="ts">
import { Promotion, Refresh } from '@element-plus/icons-vue';
import { useSend, XRequest } from 'vue-element-plus-x';

const str = ref<string>('');
let finish = () => {};

const sse = new XRequest({
  baseURL: 'https://node-test.element-plus-x.com',
  type: 'fetch',
  transformer: e => {
    console.log('transformer:', e);
    const a = e.trim().split('\n');
    const r = a.pop();
    return r;
  },
  onMessage: msg => {
    console.log('onMessage:', msg);
    str.value += `\n${msg}`;
  },
  onError: (es, e) => {
    console.log('onError:', es, e);
  },
  onOpen: () => {
    console.log('onOpen');
  },
  onAbort: messages => {
    console.log('onAbort', messages);
  },
  onFinish: data => {
    console.log('onFinish:', data);
    // 这里调用的时候，会报 eslint 错误，说我们在使用前未定义
    // 'finish' was used before it was defined.
    // 我们只有在 上面定义一个 finish 空方法，在下面进行赋值
    // 其实这里就是执行，useSend 的 finish 方法
    finish();
  }
});

function startFn() {
  str.value = '';
  sse.send('/api/sse');
}

// useSend 的 abort 和 finish 是一样的方法。
// 为了体现 这边 xrequest 请求，支持手动中断，和 结束回调。
// 所以 也在 useSend 中，也暴露了一个名字叫 finish 的方法。
const {
  send,
  loading,
  abort,
  finish: _finish
} = useSend({
  sendHandler: startFn,
  abortHandler: sse.abort
});

// 给顶层变量赋值
finish = _finish;
</script>

<template>
  <div class="btn-list">
    <el-button
      v-if="!loading"
      color="#c2306a"
      round
      plain
      size="large"
      @click="send"
    >
      <el-icon><Promotion /></el-icon>
    </el-button>

    <el-button
      v-if="loading"
      color="#c2306a"
      round
      plain
      size="large"
      @click="abort"
    >
      <el-icon class="is-loading">
        <Refresh />
      </el-icon>
    </el-button>

    <div>{{ str }}</div>
  </div>
</template>

```

### useSend-base

```vue
<docs>
---
title: useSend 【单独】 基础用法
---

这个案例可以很好看出，这个 hooks 不与后端请求做交互，只是控制简单的 `loading` 状态。

`send` 方法 触发 `sendHandler` 回调
`finish` 方法 结束 loading 状态
</docs>

<script setup lang="ts">
import { useSend } from 'vue-element-plus-x';

const { send, finish, loading } = useSend({
  sendHandler: startFn
});

async function startFn() {
  // 在这里做一个 异步操作，可以是发请求
  console.log('开始模拟请求');
}
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button :disabled="loading" type="primary" @click="send">
        {{ loading ? '加载中...' : '模拟请求' }}
      </el-button>

      <el-button :disabled="!loading" @click="finish">
        结束请求
      </el-button>
    </div>
  </div>
</template>

```

### useSend-use

```vue
<docs>
---
title: useSend 【单独】 使用场景
---

`sendHandler` 和 `abortHandler` 是两个函数，分别对应 `开始` 和 `中断` 的回调。

`abort` 方法 触发 `abortHandler` 回调

`abort` 方法 同时也会 结束 loading 状态
</docs>

<script setup lang="ts">
import {
  Aim,
  Loading,
  Microphone,
  Promotion,
  Refresh,
  VideoCamera,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue';
import { useSend } from 'vue-element-plus-x';

const { send, abort, loading } = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义语音按钮，结束录音！');
  }
});

const {
  send: send1,
  abort: abort1,
  loading: loading1
} = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义发送按钮，结束发送！');
  }
});

const {
  send: send2,
  abort: abort2,
  loading: loading2
} = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义播放按钮，结束播放！');
  }
});

const {
  send: send3,
  abort: abort3,
  loading: loading3
} = useSend({
  sendHandler: startFn,
  abortHandler: () => {
    ElMessage.info('自定义录制按钮，结束录制！');
  }
});

const type = ref('voice');

function startFn() {
  if (type.value === 'voice') {
    // 在这里做一个 异步操作，可以是发请求
    ElMessage.success('自定义语音按钮，开始录音！');
  }
  else if (type.value === 'sender') {
    ElMessage.success('自定义发送按钮，开始发送文本！');
  }
  else if (type.value === 'read') {
    ElMessage.success('自定义播放，开始播放啦！');
  }
  else if (type.value === 'record') {
    ElMessage.success('自定义录制，开始录制啦！');
  }
}
</script>

<template>
  <div class="btn-list">
    <!-- 语音按钮 -->
    <el-button
      v-if="!loading"
      color="#9145c8"
      circle
      size="large"
      @click="
        () => {
          type = 'voice';
          send();
        }
      "
    >
      <el-icon><Microphone /></el-icon>
    </el-button>

    <el-button
      v-if="loading"
      color="#9145c8"
      circle
      size="large"
      @click="
        () => {
          type = 'voice';
          abort();
        }
      "
    >
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
    </el-button>

    <!-- 发送按钮 -->
    <el-button
      v-if="!loading1"
      color="#c2306a"
      round
      plain
      size="large"
      @click="
        () => {
          type = 'sender';
          send1();
        }
      "
    >
      <el-icon><Promotion /></el-icon>
    </el-button>

    <el-button
      v-if="loading1"
      color="#c2306a"
      round
      plain
      size="large"
      @click="
        () => {
          type = 'sender';
          abort1();
        }
      "
    >
      <el-icon class="is-loading">
        <Refresh />
      </el-icon>
    </el-button>

    <!-- 播放按钮 -->
    <el-button
      v-if="!loading2"
      size="large"
      type="success"
      color="#ff7f7f"
      @click="
        () => {
          type = 'read';
          send2();
        }
      "
    >
      <el-icon style="font-size: 20px; color: #fff">
        <VideoPlay />
      </el-icon>
    </el-button>

    <el-button
      v-if="loading2"
      size="large"
      type="success"
      color="#ff7f7f"
      @click="
        () => {
          type = 'read';
          abort2();
        }
      "
    >
      <el-icon style="font-size: 20px; color: #fff" class="is-loading">
        <VideoPause />
      </el-icon>
    </el-button>

    <!-- 录制按钮 -->
    <el-button
      v-if="!loading3"
      size="large"
      circle
      color="#fff884"
      @click="
        () => {
          type = 'record';
          send3();
        }
      "
    >
      <el-icon style="color: #104674">
        <VideoCamera />
      </el-icon>
    </el-button>

    <el-button
      v-if="loading3"
      size="large"
      circle
      color="#fff884"
      @click="
        () => {
          type = 'record';
          abort3();
        }
      "
    >
      <el-icon style="color: #104674" class="is-loading">
        <Aim />
      </el-icon>
    </el-button>
  </div>
</template>

```

## API 参考

有了对状态的控制，我们可以很方便的，自定义一些按钮的加载状态

知道了 `useSend` 的基本用法后，既然有 `前端加载状态` 的控制，那一定少不了 `请求状态` 控制。接下来我们来介绍一下 工具类 `XRequest` 的简单用法。

::: warning
这里我们为了让大家方便阅读文档，看到请求，简单的写了一个 node 服务。这个案例中，💩 请不要疯狂点击。会疯狂请求接口，请大家节制一点。💩 我们没做任何安全处理 🙉 因为不会

这也可以反向让大家知道更了解，工具类 `XRequest` 的用法，只对 `请求` 处理。
:::

下面介绍一下，`useSend` 和 `useSendStream` 相互结合的用法

**使用 `useSend` 对前端进行状态控制，使用 `useSendStream` 对后端进行状态控制**

## 配置参数 和 返回钩子

#### - `useSend`

- **参数**

| 参数名       | 说明       | 类型         |
| ------------ | ---------- | ------------ |
| sendHandler  | send 方法  | `() => void` |
| abortHandler | abort 方法 | `() => void` |

- **返回值**

| 属性名  | 说明                   | 类型         |
| ------- | ---------------------- | ------------ |
| send    | 开始 加载状态 支持回调 | `() => void` |
| abort   | 中断 加载状态 支持回调 | `() => void` |
| loading | 加载状态               | `boolean`    |
| finish  | 结束 加载状态          | `() => void` |

#### - `XRequest`

- **参数**

| 配置参数名  | 说明                                         | 类型                                                   |
| ----------- | -------------------------------------------- | ------------------------------------------------------ |
| baseURL     | 基础请求地址                                 | `string`                                               |
| type        | 请求类型，默认 SSE                           | `BaseSSEProps<T = string>.type?: SSEType \| undefined` |
| transformer | transformer 回调，在这里可以对数据做解析处理 | `(e: string) => string \| undefined`                   |
| onMessage   | 请求中的回调                                 | `(msg: string \| undefined) => void`                   |
| onError     | 请求报错的回调                               | `(es: EventSource, e: Event) => void`                  |
| onOpen      | SSE Open 状态                                | `SSEWithSSEProps.onOpen?: (() => void) \| undefined`   |
| onAbort     | 请求被终止的回调                             | `(messages: (string \| undefined)[]) => void`          |
| onFinish    | 请求结束的回调                               | `(data: (string \| undefined)[]) => void`              |

- **返回值**

| 属性名 | 说明         | 类型                                                                                                                                     |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| send   | 开始请求接口 | `XRequest<string \| undefined>.send(url: string, options?: EventSourceInit \| BaseFetchOptions): Promise<XRequest<string \| undefined>>` |
| abort  | 中断请求     | `XRequest<string \| undefined>.abort(): void`                                                                                            |

## 总结

`useSend` 可以让用户更方便在前端展示和控制， **加载中** 状态。是一种对 `loading` 状态的封装方案
接受 `发送回调` 和一个`中断回调` ，提供 `发送` ，`中断 loading 状态` ，`结束 loading 状态` ，返回 `loading` 状态。

`XRequest` 是一个请求的封装，提供了更便捷的请求方式，接受一个 `请求配置` ，返回一个 `请求响应` 对象。
---

# useXStream 流式传输

## 介绍

这个钩子函数，可以让用户更方便的控制 **流式请求**。提供 `发起请求` ，`中断请求` ，返回 `loading` 请求状态，返回 SSE 协议 `实时的数据流`，返回请求 `error` 信息。

目前只测试了 SSE 和 SIP 协议请求，其他协议的请求还有待测试，如果您好的想法和发现，欢迎进交流群 👨‍👩‍👧‍👧 **[交流群](https://element-plus-x.com/en/introduce.html#%F0%9F%91%A5-%E7%A4%BE%E5%8C%BA%E6%94%AF%E6%8C%81)**，与我们取得联系，欢迎交流方案，提交 issue 和 pr。提交规范请阅读 👉 **[开发文档](https://element-plus-x.com/guide/develop.html)**

## 代码示例

### useSIP

```vue
<docs>
---
title: SIP 基础使用
---

这里展示对 SIP 协议的支持
</docs>

<script setup lang="ts">
import { useXStream } from 'vue-element-plus-x';

const { startStream, cancel, data, error, isLoading } = useXStream();

async function startSIPStream() {
  try {
    const response = await fetch(
      'https://node-test.element-plus-x.com/api/sip',
      {
        headers: { 'Content-Type': 'application/sip' }
      }
    );
    const readableStream = response.body!;

    // 自定义 transformStream 处理 SIP 数据
    const sipTransformStream = new TransformStream<string, any>({
      transform(chunk, controller) {
        // 这里可以添加 SIP 数据的解析逻辑
        controller.enqueue(chunk);
      }
    });

    await startStream({ readableStream, transformStream: sipTransformStream });
  }
  catch (err) {
    console.error('Fetch error:', err);
  }
}

// 计算属性
const content = computed(() => {
  if (!data.value.length)
    return '';
  let text = '';
  for (let index = 0; index < data.value.length; index++) {
    const chunk = data.value[index];
    try {
      console.log('chunk', chunk);
      text += chunk;
    }
    catch (error) {
      console.error('解析数据时出错:', error);
    }
    // console.log('New chunk:', chunk)
  }
  console.log('Text:', text);
  return text;
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button :disabled="isLoading" @click="startSIPStream">
        {{ isLoading ? '加载中...' : '获取 SIP 协议数据' }}
      </el-button>

      <el-button :disabled="!isLoading" @click="cancel()">
        中断请求
      </el-button>
    </div>
    <div v-if="error" class="error">
      {{ error.message }}
    </div>

    <Bubble
      v-if="content"
      :content="content"
      is-markdown
      style="width: calc(100% - 12px)"
    />
  </div>
</template>

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .el-button {
    width: fit-content;
  }
  :deep(.markdown-body) {
    background-color: transparent;
    padding: 12px;
  }
}
</style>

```

### useSSE

```vue
<docs>
---
title: SSE 基础使用
---

这个钩子函数，是对标 `ant-design-x` 的 `XStream` 方法，我们 融合 `Vue` 的开发范式。

在此基础上，新增了对流式请求的 `中断` 处理，并将 原钩子函数的配置方法，放在了 `startStream` 入参中，让开发者更能理解 这个钩子的作用
</docs>

<script setup lang="ts">
import { useXStream } from 'vue-element-plus-x';

const { startStream, cancel, data, error, isLoading } = useXStream();

// 默认支持 SSE 协议
async function startSSE() {
  try {
    const response = await fetch(
      'https://node-test.element-plus-x.com/api/sse',
      {
        headers: { 'Content-Type': 'text/event-stream' }
      }
    );
    const readableStream = response.body!;
    await startStream({ readableStream });
  }
  catch (err) {
    console.error('Fetch error:', err);
  }
}

// 机器人的 content 计算属性
const content = computed(() => {
  if (!data.value.length)
    return '';
  let text = '';
  for (let index = 0; index < data.value.length; index++) {
    const chunk = data.value[index].data;
    try {
      const parsedChunk = JSON.parse(chunk).content;
      text += parsedChunk;
    }
    catch (error) {
      // 这个 结束标识 是后端给的，所以这里这样判断
      // 实际项目中，以项目需要为准
      if (chunk === ' [DONE]') {
        // 处理数据结束的情况
        // console.log('数据接收完毕')
      }
      else {
        console.error('解析数据时出错:', error);
      }
    }
    // console.log('New chunk:', chunk)
  }
  console.log('Text:', text);
  return text;
});
</script>

<template>
  <div class="container">
    <div class="btn-list">
      <el-button :disabled="isLoading" @click="startSSE">
        {{ isLoading ? '加载中...' : '获取 SSE流数据' }}
      </el-button>

      <el-button :disabled="!isLoading" @click="cancel()">
        中断请求
      </el-button>
    </div>
    <div v-if="error" class="error">
      {{ error.message }}
    </div>

    <Bubble
      v-if="content"
      :content="content"
      is-markdown
      style="width: calc(100% - 12px)"
    />
  </div>
</template>

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .el-button {
    width: fit-content;
  }
  :deep(.markdown-body) {
    background-color: transparent;
    padding: 12px;
  }
}
</style>

```

## API 参考

::: warning
这个 hooks 的解析规则，也和 ant-design-x 一致，都是在内部做了处理。**请放心切换使用**

sseEventPart
**`'event: message\ndata: {"id":"${i}","content":"${contentChunks[i]}"}\n\n'`**

```ts
// 数据流默认分隔符（使用两个换行符，分割一条流数据）
const DEFAULT_STREAM_SEPARATOR = '\n\n';
// 分段默认分隔符（使用单个换行符，换行当前数据）
const DEFAULT_PART_SEPARATOR = '\n';
// 键值对默认分隔符（使用冒号）
const DEFAULT_KV_SEPARATOR = ':';
```

:::

## 返回钩子

| 属性名      | 说明                 | 类型                                          |
| ----------- | -------------------- | --------------------------------------------- |
| startStream | 开始请求流模式接口   | `({readableStream, transformStream}) => void` |
| cancel      | 中断流式请求         | `() => void`                                  |
| loading     | 是否正在请求流式数据 | `boolean`                                     |
| data        | 实时返回的流式数据   | `string`                                      |
| error       | 流式请求报错信息     | `string`                                      |
---

# Welcome 欢迎页

## 介绍

`Welcome` 这个组件可以清晰传达给用户可实现的意图范围和预期功能。使用合适的欢迎推荐组件，可以有效降低用户学习成本，让用户快速了解并顺利开始。

### 基本使用

## 代码示例

### base

```vue
<docs>
---
title: 基础用法
---

快速创建一个 欢迎卡片
</docs>

<script setup lang="ts"></script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Welcome title="欢迎来到 Element Plus X 🦋" />

    <Welcome title="欢迎使用 Element Plus X 💖" description="这是描述信息 ~" />

    <Welcome
      icon="/logo.png"
      title="欢迎使用 Element Plus X 💖"
      description="这是描述信息 ~"
    />

    <Welcome
      icon="/logo.png"
      title="欢迎使用 Element Plus X 💖"
      extra="副标题"
      description="这是描述信息 ~"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### bg

```vue
<docs>
---
title: direction 属性
---

设置 布局方法 `ltr` 从左到右 和 `rtl` 从右到左，更多属性，控制样式，详情可查看 属性 列表。
</docs>

<script setup lang="ts">
import type { WelcomeProps } from 'vue-element-plus-x/types/Welcome';
import { Refresh } from '@element-plus/icons-vue';

const bgColor = ref(
  'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)'
);
const value = ref<WelcomeProps['direction']>('ltr');

// 生成随机的渐变颜色
function generateGradientColor(): string {
  const randomBrightColor = () => {
    // 为了保证颜色是亮色调，将取值范围设置为 128 - 255
    const r = Math.floor(Math.random() * 128) + 128;
    const g = Math.floor(Math.random() * 128) + 128;
    const b = Math.floor(Math.random() * 128) + 128;
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  };

  const color1 = randomBrightColor();
  const color2 = randomBrightColor();
  const color3 = randomBrightColor();

  return `linear-gradient(to bottom right, ${color1}, ${color2}, ${color3})`;
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 12px; align-items: center">
      <el-button
        type="warning"
        style="width: fit-content"
        @click="bgColor = generateGradientColor()"
      >
        设置你喜欢的背景颜色 <el-icon><Refresh /></el-icon>
      </el-button>

      <span>切换布局：</span>
      <el-switch v-model="value" active-value="ltr" inactive-value="rtl" />
    </div>

    <Welcome
      :direction="value"
      title="欢迎来到 Element Plus X 🦋"
      :style="{ background: bgColor }"
    />

    <Welcome
      :direction="value"
      title="欢迎使用 Element Plus X 💖"
      description="这是描述信息 ~"
      :style="{ background: bgColor }"
    />

    <Welcome
      :direction="value"
      icon="/logo.png"
      title="欢迎使用 Element Plus X 💖"
      description="这是描述信息 ~"
      :style="{ background: bgColor }"
    />

    <Welcome
      :direction="value"
      icon="/logo.png"
      title="欢迎使用 Element Plus X 💖"
      extra="副标题"
      description="这是描述信息 ~"
      :style="{ background: bgColor }"
    />

    <Welcome
      :direction="value"
      variant="borderless"
      title="欢迎来到 Element Plus X 🦋"
      :style="{ background: bgColor }"
    />

    <Welcome
      :direction="value"
      variant="borderless"
      title="欢迎使用 Element Plus X 💖"
      description="这是描述信息 ~"
      :style="{ background: bgColor }"
    />

    <Welcome
      :direction="value"
      icon="/logo.png"
      variant="borderless"
      title="欢迎使用 Element Plus X 💖"
      description="这是描述信息 ~"
      :style="{ background: bgColor }"
    />

    <Welcome
      :direction="value"
      icon="/logo.png"
      variant="borderless"
      title="欢迎使用 Element Plus X 💖"
      extra="副标题"
      description="这是描述信息 ~"
      :style="{ background: bgColor }"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

### extra

```vue
<docs>
---
title: extra 插槽
---

方便自己定义 副标题内容
</docs>

<script setup lang="ts">
const bgColor =
  'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Welcome
      direction="rtl"
      icon="/logo.png"
      variant="borderless"
      :style="{ background: bgColor }"
      title="欢迎使用 Element Plus X 💖"
      description="用 vue3 对 ant-design-x 的复刻。后续将会集成 AI 工作流编排组件 和 md 多功能渲染组件，给 Vue 开发社区 一个好用的 AI 组件库"
    >
      <template #extra>
        <el-button link type="primary"> 关于我 </el-button>
      </template>
    </Welcome>
  </div>
</template>

<style scoped lang="less"></style>

```

### image

```vue
<docs>
---
title: image 插槽
---

方便更换自定义的 图片
</docs>

<script setup lang="ts">
const bgColor =
  'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Welcome
      variant="borderless"
      :style="{ background: bgColor }"
      title="欢迎使用 Element Plus X 💖"
      description="用 vue3 对 ant-design-x 的复刻。后续将会集成 AI 工作流编排组件 和 md 多功能渲染组件，给 Vue 开发社区 一个好用的 AI 组件库"
    >
      <template #image>
        <img src="/logo.png" style="width: 80px" />
      </template>
    </Welcome>
  </div>
</template>

<style scoped lang="less"></style>

```

### theme

```vue
<docs>
---
title: 自定义主题
---

通过 `ConfigProvider.themeOverrides` 覆写 `Welcome` 的 `--elx-*` 变量，实时观察样式变化。
</docs>

<script setup lang="ts">
import { computed, ref } from 'vue';

const enabled = ref(true);

const themeOverrides = computed(() => {
  if (!enabled.value) return {};
  return {
    common: {
      'color-primary': '#7c3aed',
      'border-color': 'rgba(124, 58, 237, 0.32)',
      'box-shadow': '0 18px 54px rgba(124, 58, 237, 0.22)'
    },
    components: {
      Welcome: {
        'welcome-filled-bg': 'rgba(255, 255, 255, 0.9)',
        'welcome-filled-border': 'rgba(124, 58, 237, 0.45)',
        'welcome-title-color': 'rgba(15, 23, 42, 0.92)',
        'welcome-description-color': 'rgba(15, 23, 42, 0.72)',
        'welcome-border-radius': '16px',
        'welcome-padding': '28px',
        'welcome-gap': '18px',
        'welcome-icon-size': '72px'
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
      <div>点击右侧按钮切换覆写效果。</div>
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
          border-radius: 18px;
          border: 1px solid var(--elx-border-color);
          background:
            radial-gradient(
              1200px 260px at 0% 0%,
              rgba(124, 58, 237, 0.2),
              transparent 60%
            ),
            radial-gradient(
              900px 240px at 100% 20%,
              rgba(59, 130, 246, 0.14),
              transparent 55%
            ),
            rgba(0, 0, 0, 0.02);
          box-shadow: var(--elx-box-shadow);
        "
      >
        <Welcome
          title="欢迎使用 Element Plus X"
          description="开关前后会看到整体间距、圆角、边框与“卡片质感”变化。"
          variant="filled"
        />
      </div>
    </ConfigProvider>
  </div>
</template>

```

### variant

```vue
<docs>
---
title: variant 属性
---

快速切换多种样式，目前只有两种，`filled` 和 `borderless`。默认为 `filled`。
</docs>

<script setup lang="ts"></script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <Welcome title="欢迎来到 Element Plus X 🦋" />

    <Welcome title="欢迎使用 Element Plus X 💖" description="这是描述信息 ~" />

    <Welcome
      icon="/logo.png"
      title="欢迎使用 Element Plus X 💖"
      description="这是描述信息 ~"
    />

    <Welcome
      icon="/logo.png"
      variant="borderless"
      title="欢迎使用 Element Plus X 💖"
      extra="副标题"
      description="这是描述信息 ~"
    />
  </div>
</template>

<style scoped lang="less"></style>

```

## API 参考

### 样式变体

### 背景颜色

### 自定义图片

### 自定义副标题

### 自定义主题

通过 `ConfigProvider.themeOverrides` 覆盖 `Welcome` 的主题变量。完整变量表与可复制模板见：

- [主题变量总表](/zh/guide/theme-tokens#welcome)
- [/theme-overrides.template.ts](/theme-overrides.template.ts)

## 属性

| 属性名          | 类型   | 是否必填 | 默认值  | 描述                                                    |
| --------------- | ------ | -------- | ------- | ------------------------------------------------------- |
| `variant`       | string | 否       | filled  | 组件样式变体（filled/borderless）                       |
| `direction`     | string | 否       | ltr     | 文本方向（ltr/rtl）                                     |
| `icon`          | string | 否       | -       | 图标URL地址                                             |
| `title`         | string | 否       | -       | 主标题文本内容                                          |
| `extra`         | string | 否       | -       | 副标题文本内容                                          |
| `description`   | string | 否       | -       | 描述文本内容                                            |
| `className`     | string | 否       | -       | 容器外层自定义类名                                      |
| `rootClassName` | string | 否       | -       | 根节点自定义类名                                        |
| `classNames`    | object | 否       | -       | 各部分自定义类名（{ icon, title, extra, description }） |
| `style`         | object | 否       | -       | 容器外层自定义样式                                      |
| `styles`        | object | 否       | -       | 各部分自定义样式（{ icon, title, extra, description }） |
| `prefixCls`     | string | 否       | welcome | 组件类名前缀                                            |

## 插槽

| 插槽名   | 参数 | 类型 | 描述               |
| -------- | ---- | ---- | ------------------ |
| `#image` | -    | Slot | 自定义欢迎图片内容 |
| `#extra` | -    | Slot | 自定义副标题内容   |

## 功能特性

1. 通过 `variant` 属性目前暂时支持 `filled`（填充）和 `borderless`（无边框）两种视觉风格
2. 支持 `direction` 属性控制文本方向
3. 可通过 `classNames` 和 `styles` 细粒度控制样式
4. 支持 `image` 、 `extra` 插槽扩展自定义内容
---

# XMarkdown Markdown渲染

﻿---
title: 'XMarkdown'

## 代码示例

### basic

```vue
<docs>
---
title: 基础用法
---

使用 `MarkdownRenderer` 渲染静态 Markdown 内容，支持 GFM、任务列表、表格、代码高亮等。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `# Hello, Element Plus X 👋

这是 **加粗**、*斜体*、~~删除线~~ 和 \`行内代码\`。

## 任务列表

- [x] 已完成任务
- [ ] 待完成任务

## 表格

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| markdown | string | \`''\` | Markdown 内容 |
| is-dark | boolean | \`false\` | 深色模式 |
| enable-animate | boolean | \`false\` | 流式动画 |

## 代码块

\`\`\`typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const messages: ChatMessage[] = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help you?' },
];
\`\`\`
`;
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### bubble-list-sticky

```vue
<docs>
---
title: 搭配 BubbleList 使用粘性代码头部
---

将 `MarkdownRenderer` 放在 `BubbleList` 的 `#content` 插槽中，以 BubbleList 自身作为滚动容器。滚动列表时，代码块顶部的语言标签与操作栏会吸附到 **BubbleList 可视区域顶部**，而非页面顶部，不受文档导航栏遮挡。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

interface MessageItem {
  key: number;
  placement: 'start' | 'end';
  content: string;
  avatar: string;
}

const messages: MessageItem[] = [
  {
    key: 1,
    placement: 'end',
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    content: '请给我写一段完整的 TypeScript 用户管理模块示例。'
  },
  {
    key: 2,
    placement: 'start',
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    content: `好的，下面是一个完整的 TypeScript 用户管理模块示例：

\`\`\`typescript
// user.ts — 用户管理模块

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
}

const store = new Map<number, User>();
let nextId = 1;

export function createUser(dto: CreateUserDTO): User {
  const now = new Date();
  const user: User = {
    id: nextId++,
    name: dto.name,
    email: dto.email,
    role: dto.role ?? 'viewer',
    createdAt: now,
    updatedAt: now,
  };
  store.set(user.id, user);
  return user;
}

export function getUserById(id: number): User | undefined {
  return store.get(id);
}

export function updateUser(id: number, dto: UpdateUserDTO): User {
  const user = store.get(id);
  if (!user) throw new Error(\`User \${id} not found\`);
  Object.assign(user, dto, { updatedAt: new Date() });
  return user;
}

export function deleteUser(id: number): boolean {
  return store.delete(id);
}

export function listUsers(role?: UserRole): User[] {
  const all = Array.from(store.values());
  return role ? all.filter(u => u.role === role) : all;
}

// 使用示例
const alice = createUser({ name: 'Alice', email: 'alice@example.com', role: 'admin' });
const bob   = createUser({ name: 'Bob',   email: 'bob@example.com' });

console.log(listUsers());          // [alice, bob]
console.log(listUsers('admin'));   // [alice]

updateUser(bob.id, { role: 'editor' });
console.log(getUserById(bob.id));  // { ...bob, role: 'editor' }

deleteUser(alice.id);
console.log(listUsers());          // [bob]
\`\`\`

以上代码包含：类型定义、CRUD 操作、简单内存存储，可按需替换为数据库实现。`
  },
  {
    key: 3,
    placement: 'end',
    avatar: 'https://avatars.githubusercontent.com/u/1?s=40&v=4',
    content: '再来一个 Vue 3 组合式 API 的计数器组件示例。'
  },
  {
    key: 4,
    placement: 'start',
    avatar: 'https://avatars.githubusercontent.com/u/76239030?s=40&v=4',
    content: `当然，这是一个使用 Vue 3 组合式 API 的计数器组件：

\`\`\`vue
<!-- Counter.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  min?: number;
  max?: number;
  step?: number;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
});

const emit = defineEmits<{
  change: [value: number];
}>();

const count = ref(props.min);

const canDecrement = computed(() => count.value - props.step >= props.min);
const canIncrement = computed(() => count.value + props.step <= props.max);

function decrement() {
  if (canDecrement.value) {
    count.value -= props.step;
    emit('change', count.value);
  }
}

function increment() {
  if (canIncrement.value) {
    count.value += props.step;
    emit('change', count.value);
  }
}

function reset() {
  count.value = props.min;
  emit('change', count.value);
}
<\/script>

<template>
  <div class="counter">
    <button :disabled="!canDecrement" @click="decrement">－</button>
    <span class="value">{{ count }}</span>
    <button :disabled="!canIncrement" @click="increment">＋</button>
    <button class="reset" @click="reset">重置</button>
  </div>
</template>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.value {
  min-width: 3ch;
  text-align: center;
  font-size: 1.2em;
  font-weight: 600;
}
button {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.reset {
  font-size: 0.85em;
  color: #666;
}
</style>
\`\`\`

该组件支持 \`min\`、\`max\`、\`step\` 属性，并通过 \`change\` 事件向父组件传递最新值。`
  }
];

const rendererProps = computed(() => ({
  showCodeBlockHeader: true,
  stickyCodeBlockHeader: true,
  enableCodeLineNumber: true
}));
</script>

<template>
  <div class="bubble-sticky-demo">
    <div class="hint">
      💡 向下滚动列表，代码块顶部的语言标签将吸附到
      <strong>BubbleList 可视区顶部</strong>，而非页面顶部。
    </div>
    <div class="list-stage">
      <BubbleList :list="messages">
        <template #content="{ item }">
          <component
            :is="MarkdownRenderer"
            v-if="item.placement === 'start' && MarkdownRenderer"
            :markdown="item.content"
            v-bind="rendererProps"
          />
          <span v-else>{{ item.content }}</span>
        </template>
      </BubbleList>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bubble-sticky-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .hint {
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
    border: 1px solid #d9ecff;
    font-size: 13px;
    color: #409eff;

    strong {
      color: #67c23a;
    }
  }

  .list-stage {
    height: 460px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    padding: 8px 10px;
  }
}
</style>

```

### code-block-actions

```vue
<docs>
---
title: 自定义代码块操作按钮
---

通过 `code-block-actions` 传入自定义按钮数组，可在代码块头部添加任意操作，按钮的 `show` 函数可控制其显示条件。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`
`;

const lastAction = ref('');

const codeBlockActions = [
  {
    key: 'run',
    title: '运行代码',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>`,
    show: (props: any) =>
      ['typescript', 'ts', 'javascript', 'js'].includes(props.language),
    onClick: (props: any) => {
      lastAction.value = `运行了 ${props.language} 代码（${props.code.length} 字符）`;
    }
  },
  {
    key: 'insert',
    title: '插入到编辑器',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    onClick: (props: any) => {
      lastAction.value = `已插入 ${props.language} 代码块到编辑器`;
    }
  }
];
</script>

<template>
  <div>
    <div
      v-if="lastAction"
      style="
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #f0f9ff;
        border-radius: 4px;
        color: #0369a1;
        font-size: 13px;
      "
    >
      操作记录：{{ lastAction }}
    </div>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="content"
      :code-block-actions="codeBlockActions"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### code-block-config

```vue
<docs>
---
title: 代码块配置
---

支持配置是否显示头部、最大高度、粘性头部等代码块相关选项。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`typescript
// 一个较长的代码块，用于演示最大高度和行号效果
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

function createUser(data: Partial<User>): User {
  return {
    id: Math.floor(Math.random() * 10000),
    name: data.name ?? 'Anonymous',
    email: data.email ?? '',
    role: data.role ?? 'user',
    createdAt: new Date(),
  };
}

const user = createUser({ name: 'Alice', email: 'alice@example.com' });
console.log(user);
\`\`\``;

const showHeader = ref(true);
const stickyHeader = ref(false);
const codeMaxHeight = ref('200px');
const enableLineNumber = ref(true);

const rendererProps = computed(() => ({
  markdown: content,
  showCodeBlockHeader: showHeader.value,
  stickyCodeBlockHeader: stickyHeader.value,
  codeMaxHeight: codeMaxHeight.value,
  enableCodeLineNumber: enableLineNumber.value
}));
</script>

<template>
  <div>
    <div
      style="
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 12px;
        align-items: center;
      "
    >
      <el-checkbox v-model="showHeader"> 显示头部 </el-checkbox>
      <el-checkbox v-model="stickyHeader">
        粘性头部（页面滚动时固定）
      </el-checkbox>
      <el-checkbox v-model="enableLineNumber"> 显示行号 </el-checkbox>
      <span>
        最大高度：
        <el-input v-model="codeMaxHeight" size="small" style="width: 100px" />
      </span>
    </div>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      v-bind="rendererProps"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### code-x-render

```vue
<docs>
---
title: 自定义代码块渲染器
---

通过 `code-x-render` 对特定语言的代码块进行完全自定义渲染，适用于 JSON 可视化、图表渲染等场景。
</docs>

<script setup lang="ts">
import { h } from 'vue';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `以下 JSON 块将使用自定义渲染器展示：

\`\`\`json
{
  "name": "element-plus-x",
  "version": "2.0.0",
  "description": "Vue 3 AI 组件库",
  "keywords": ["vue", "ai", "markdown", "chat"],
  "dependencies": {
    "x-markdown-vue": "^1.0.0"
  }
}
\`\`\`

普通代码块不受影响：

\`\`\`typescript
console.log('Hello World');
\`\`\`
`;

const codeXRender = {
  json: (props: any) => {
    try {
      const formatted = JSON.stringify(JSON.parse(props.raw.content), null, 2);
      return h(
        'div',
        {
          style: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            overflow: 'auto',
            color: '#a8ff78',
            border: '1px solid #2d2d5e'
          }
        },
        [
          h(
            'div',
            { style: 'color: #888; margin-bottom: 8px; font-size: 11px;' },
            '📋 JSON 查看器'
          ),
          h('pre', { style: 'margin: 0; white-space: pre-wrap;' }, formatted)
        ]
      );
    } catch {
      return null;
    }
  }
};
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :code-x-render="codeXRender"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-attrs

```vue
<docs>
---
title: 自定义属性
---

通过 `custom-attrs` 为特定 Markdown 元素添加 HTML 属性，如为链接添加 `target="_blank"`、为标题添加自定义 class 等。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `# 一级标题（蓝色）

## 二级标题（绿色）

这是一个 [外部链接](https://github.com/element-plus-x/x-markdown)，会在新窗口打开。

![示例图片](https://picsum.photos/seed/elx/400/160)
`;

const customAttrs = {
  heading: (_node: any, { level }: { level: number }) => ({
    style:
      level === 1
        ? 'color: #409eff;'
        : level === 2
          ? 'color: #67c23a;'
          : undefined,
    class: `custom-heading-${level}`
  }),
  a: () => ({
    target: '_blank',
    rel: 'noopener noreferrer'
  }),
  img: () => ({
    loading: 'lazy',
    style: 'max-width: 100%; border-radius: 8px;'
  })
};
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :custom-attrs="customAttrs"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-code-components

```vue
<docs>
---
title: 自定义代码块组件（el-table & my-echarts）
---

通过 `code-x-render` 将特定语言的代码块渲染为 Vue 组件。本示例中：

- **`el-table`** 语言块 — 将 JSON 数据渲染为 Element Plus 表格
- **`my-echarts`** 语言块 — 将 ECharts JSON 配置渲染为交互式图表
</docs>

<script setup lang="ts">
import { ElTable, ElTableColumn } from 'element-plus';
import {
  defineComponent,
  h,
  computed as vComputed,
  onMounted as vOnMounted,
  ref as vRef
} from 'vue';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `## 使用 \`el-table\` 展示员工数据

在代码块中写入 JSON，语言设为 \`el-table\`，自动渲染为 Element Plus 表格：

\`\`\`el-table
{
  "columns": ["姓名", "职位", "部门", "入职年份", "状态"],
  "rows": [
    { "姓名": "张三", "职位": "前端工程师", "部门": "研发部", "入职年份": "2021", "状态": "在职" },
    { "姓名": "李四", "职位": "产品经理", "部门": "产品部", "入职年份": "2020", "状态": "在职" },
    { "姓名": "王五", "职位": "UI 设计师", "部门": "设计部", "入职年份": "2022", "状态": "在职" },
    { "姓名": "赵六", "职位": "后端工程师", "部门": "研发部", "入职年份": "2019", "状态": "在职" },
    { "姓名": "陈七", "职位": "测试工程师", "部门": "测试部", "入职年份": "2023", "状态": "试用" }
  ]
}
\`\`\`

## 使用 \`my-echarts\` 展示图表

在代码块中写入 ECharts option JSON，语言设为 \`my-echarts\`，自动渲染为交互式图表：

\`\`\`my-echarts
{
  "title": { "text": "各部门人员分布", "left": "center" },
  "tooltip": { "trigger": "item", "formatter": "{b}: {c} 人 ({d}%)" },
  "legend": { "bottom": "5%" },
  "series": [{
    "type": "pie",
    "radius": ["40%", "70%"],
    "avoidLabelOverlap": true,
    "itemStyle": { "borderRadius": 8, "borderWidth": 2 },
    "label": { "show": true },
    "data": [
      { "value": 45, "name": "研发部" },
      { "value": 20, "name": "产品部" },
      { "value": 15, "name": "设计部" },
      { "value": 12, "name": "测试部" },
      { "value": 8,  "name": "市场部" }
    ]
  }]
}
\`\`\`
`;

// ─── el-table 组件 ───────────────────────────────────────────────────────────
const ElTableBlock = defineComponent({
  name: 'ElTableBlock',
  props: {
    rawJson: { type: String, required: true }
  },
  setup(props) {
    const parsed = vComputed(() => {
      try {
        const v = JSON.parse(props.rawJson);
        return {
          columns: Array.isArray(v.columns) ? v.columns : [],
          rows: Array.isArray(v.rows) ? v.rows : []
        };
      } catch {
        return { columns: [] as string[], rows: [] as any[] };
      }
    });
    return () =>
      h('div', { style: 'margin:16px 0;' }, [
        h(
          ElTable as any,
          {
            data: parsed.value.rows,
            border: true,
            stripe: true,
            style: { width: '100%' },
            size: 'small'
          },
          {
            default: () =>
              parsed.value.columns.map((col: string) =>
                h(ElTableColumn as any, {
                  key: col,
                  prop: col,
                  label: col,
                  minWidth: 100
                })
              )
          }
        )
      ]);
  }
});

// ─── ECharts 组件 ────────────────────────────────────────────────────────────
const MyEchartsBlock = defineComponent({
  name: 'MyEchartsBlock',
  props: {
    option: { type: Object, required: true }
  },
  setup(props) {
    const chartEl = vRef<HTMLDivElement>();

    vOnMounted(async () => {
      if (!chartEl.value) return;
      try {
        const echarts = await import('echarts');
        const chart = echarts.init(chartEl.value);
        chart.setOption(props.option);
        // 响应式宽度
        const ro = new ResizeObserver(() => chart.resize());
        ro.observe(chartEl.value);
      } catch (e) {
        console.warn('[my-echarts] echarts init failed', e);
      }
    });

    return () =>
      h('div', {
        ref: chartEl,
        style: 'width:100%;height:320px;margin:16px 0;'
      });
  }
});

// ─── codeXRender 映射 ────────────────────────────────────────────────────────
const codeXRender = {
  'el-table': (props: any) => h(ElTableBlock, { rawJson: props.raw.content }),

  'my-echarts': (props: any) => {
    try {
      const option = JSON.parse(props.raw.content);
      return h(MyEchartsBlock, { option });
    } catch {
      return h(
        'div',
        {
          style:
            'color:#f56c6c;padding:8px;border:1px dashed #f56c6c;border-radius:4px;'
        },
        '⚠ 图表 JSON 解析失败，请检查语法'
      );
    }
  }
};
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :code-x-render="codeXRender"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-slots

```vue
<docs>
---
title: 自定义插槽
---

通过具名插槽自定义特定 Markdown 元素的渲染方式，可完全控制 HTML 输出结构和样式。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `# 自定义标题插槽

## 二级标题

> 这是一段引用文字，将使用自定义引用块渲染，带有图标和渐变背景。

访问 [Element Plus X](https://github.com/element-plus-x) 了解更多。
`;
</script>

<template>
  <component :is="MarkdownRenderer" v-if="MarkdownRenderer" :markdown="content">
    <!-- 自定义标题：左侧彩色边框 -->
    <template #heading="{ level, children }">
      <component
        :is="`h${level}`"
        :style="{
          borderLeft: level === 1 ? '4px solid #409eff' : '3px solid #67c23a',
          paddingLeft: '12px',
          margin: '16px 0 8px'
        }"
      >
        <component :is="children" />
      </component>
    </template>

    <!-- 自定义引用块：渐变背景 + 图标 -->
    <template #blockquote="{ children }">
      <blockquote
        style="
          background: linear-gradient(135deg, #e8f4ff, #f0f8ff);
          border-left: 4px solid #409eff;
          border-radius: 0 8px 8px 0;
          padding: 12px 16px;
          margin: 8px 0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        "
      >
        <span>💡</span>
        <div><component :is="children" /></div>
      </blockquote>
    </template>

    <!-- 自定义链接：新窗口 + 外链图标 -->
    <template #a="{ node, children }">
      <a
        :href="node?.properties?.href"
        target="_blank"
        rel="noopener noreferrer"
        style="
          color: #409eff;
          text-decoration: none;
          border-bottom: 1px dashed #409eff;
        "
      >
        <component :is="children" />↗
      </a>
    </template>
  </component>
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### custom-streaming-blocks

```vue
<docs>
---
title: 流式自定义代码块（骨架屏占位）
---

模拟 AI 流式输出的真实场景：当 \`el-table\` / \`el-form\` / \`my-echarts\` 代码块的 JSON 还在拼接中时，用 **el-skeleton 骨架屏** 占位；一旦 JSON 完整可解析，立刻切换为对应的真实组件回显。

判定方式：在 `code-x-render` 里尝试 `JSON.parse(props.raw.content)`，**解析失败 → 骨架屏；解析成功 → 真实组件**，配合流式更新自然呈现"骨架屏 → 内容"的过渡。
</docs>

<script setup lang="ts">
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSkeleton,
  ElTable,
  ElTableColumn
} from 'element-plus';
import { defineComponent, h, onMounted as vOnMounted, ref as vRef } from 'vue';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const fullText = `## 流式输出示例

下面三个代码块会随着流式拼接，先显示骨架屏，等 JSON 完整后切换为真实组件：

\`\`\`el-table
{
  "columns": ["姓名", "职位", "部门"],
  "rows": [
    { "姓名": "张三", "职位": "前端工程师", "部门": "研发部" },
    { "姓名": "李四", "职位": "产品经理", "部门": "产品部" },
    { "姓名": "王五", "职位": "UI 设计师", "部门": "设计部" }
  ]
}
\`\`\`

\`\`\`el-form
{
  "fields": [
    { "label": "姓名", "value": "张三" },
    { "label": "邮箱", "value": "zhangsan@example.com" },
    { "label": "部门", "value": "研发部" }
  ]
}
\`\`\`

\`\`\`my-echarts
{
  "title": { "text": "季度销售额", "left": "center" },
  "tooltip": {},
  "xAxis": { "type": "category", "data": ["Q1","Q2","Q3","Q4"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [120, 200, 150, 320], "itemStyle": { "borderRadius": 6 } }]
}
\`\`\`
`;

const streamContent = ref('');
let intervalId: ReturnType<typeof setInterval> | null = null;
const isStreaming = ref(false);

function startStream() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  streamContent.value = '';
  isStreaming.value = true;
  let index = 0;
  intervalId = setInterval(() => {
    if (index < fullText.length) {
      // 一次推进若干字符，让流式更顺滑
      const step = 4;
      streamContent.value += fullText.slice(index, index + step);
      index += step;
    } else {
      clearInterval(intervalId!);
      intervalId = null;
      isStreaming.value = false;
    }
  }, 40);
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

// ─── 真实组件 ────────────────────────────────────────────────────────────────
const ElTableBlock = defineComponent({
  name: 'ElTableBlock',
  props: { data: { type: Object, required: true } },
  setup(props) {
    return () =>
      h('div', { style: 'margin:16px 0;' }, [
        h(
          ElTable as any,
          {
            data: props.data.rows ?? [],
            border: true,
            stripe: true,
            style: { width: '100%' },
            size: 'small'
          },
          {
            default: () =>
              (props.data.columns ?? []).map((col: string) =>
                h(ElTableColumn as any, {
                  key: col,
                  prop: col,
                  label: col,
                  minWidth: 100
                })
              )
          }
        )
      ]);
  }
});

const ElFormBlock = defineComponent({
  name: 'ElFormBlock',
  props: { data: { type: Object, required: true } },
  setup(props) {
    return () =>
      h(
        'div',
        {
          style:
            'margin:16px 0;padding:12px;border:1px solid #ebeef5;border-radius:6px;'
        },
        [
          h(
            ElForm as any,
            { labelWidth: '80px', size: 'small' },
            {
              default: () =>
                (props.data.fields ?? []).map((f: any, i: number) =>
                  h(
                    ElFormItem as any,
                    { key: i, label: f.label },
                    {
                      default: () =>
                        h(ElInput as any, {
                          modelValue: f.value,
                          'onUpdate:modelValue': () => {}
                        })
                    }
                  )
                )
            }
          )
        ]
      );
  }
});

const MyEchartsBlock = defineComponent({
  name: 'MyEchartsBlock',
  props: { option: { type: Object, required: true } },
  setup(props) {
    const chartEl = vRef<HTMLDivElement>();
    vOnMounted(async () => {
      if (!chartEl.value) return;
      try {
        const echarts = await import('echarts');
        const chart = echarts.init(chartEl.value);
        chart.setOption(props.option);
        const ro = new ResizeObserver(() => chart.resize());
        ro.observe(chartEl.value);
      } catch (e) {
        console.warn('[my-echarts] init failed', e);
      }
    });
    return () =>
      h('div', {
        ref: chartEl,
        style: 'width:100%;height:300px;margin:16px 0;'
      });
  }
});

// ─── 骨架屏占位 ─────────────────────────────────────────────────────────────
function skeletonOf(kind: 'el-table' | 'el-form' | 'my-echarts') {
  const rows = kind === 'my-echarts' ? 6 : 4;
  return h(
    'div',
    {
      style:
        'margin:16px 0;padding:12px;border:1px dashed #dcdfe6;border-radius:6px;background:#fafafa;'
    },
    [
      h(
        'div',
        { style: 'font-size:12px;color:#909399;margin-bottom:8px;' },
        `⏳ ${kind} 数据流式加载中…`
      ),
      h(ElSkeleton as any, { rows, animated: true })
    ]
  );
}

// ─── codeXRender：解析失败 → 骨架屏；成功 → 真实组件 ─────────────────────────
function safeParse(s: string): { ok: true; value: any } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch {
    return { ok: false };
  }
}

const codeXRender = {
  'el-table': (props: any) => {
    const r = safeParse(props.raw.content);
    return r.ok ? h(ElTableBlock, { data: r.value }) : skeletonOf('el-table');
  },
  'el-form': (props: any) => {
    const r = safeParse(props.raw.content);
    return r.ok ? h(ElFormBlock, { data: r.value }) : skeletonOf('el-form');
  },
  'my-echarts': (props: any) => {
    const r = safeParse(props.raw.content);
    return r.ok
      ? h(MyEchartsBlock, { option: r.value })
      : skeletonOf('my-echarts');
  }
};
</script>

<template>
  <div>
    <el-button
      type="primary"
      :loading="isStreaming"
      style="margin-bottom: 12px"
      @click="startStream"
    >
      {{ isStreaming ? '流式输出中...' : '开始流式输出' }}
    </el-button>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="streamContent"
      :code-x-render="codeXRender"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### custom-table

```vue
<docs>
---
title: 自定义表格（el-table 插槽）
---

通过 `#table` 插槽拦截 Markdown 中的 GFM 表格。插槽暴露 `children`（一个返回 VNode 数组的函数），递归读取 `<thead>` / `<tbody>` 即可拿到列与行，再用 `el-table` 渲染获得边框、条纹等能力。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `## 前端框架对比

| 框架 | 最新版本 | GitHub Stars | 学习曲线 | TypeScript |
|------|----------|-------------|----------|-----------|
| Vue | 3.4 | 48k | 低 | ✅ |
| React | 18.3 | 225k | 中 | ✅ |
| Angular | 17 | 93k | 高 | ✅ |
| Svelte | 5.0 | 78k | 低 | ✅ |

## 组件库对比

| 组件库 | 所属框架 | 主题定制 | 企业级支持 | 国际化 |
|--------|----------|----------|----------|--------|
| Element Plus | Vue 3 | ✅ | ✅ | ✅ |
| Ant Design | React | ✅ | ✅ | ✅ |
| Vuetify | Vue 3 | ✅ | ✅ | ✅ |
| Naive UI | Vue 3 | ✅ | ❌ | ✅ |
`;

// 递归从 VNode 子树提取纯文本
function vnodeText(vn: any): string {
  if (vn == null || vn === false || vn === true) return '';
  if (typeof vn === 'string' || typeof vn === 'number') return String(vn);
  if (Array.isArray(vn)) return vn.map(vnodeText).join('');
  if (typeof vn === 'object' && 'children' in vn)
    return vnodeText((vn as any).children);
  return '';
}

function findByTag(children: any, tag: string): any[] {
  if (!children) return [];
  const list = Array.isArray(children) ? children : [children];
  return list.filter(
    c => c && typeof c === 'object' && (c as any).type === tag
  );
}

function extractTableData(children: any) {
  const columns: string[] = [];
  const rows: Record<string, string>[] = [];
  const top = Array.isArray(children) ? children : [children];

  for (const section of top) {
    if (!section || typeof section !== 'object') continue;
    if ((section as any).type === 'thead') {
      const tr = findByTag((section as any).children, 'tr')[0];
      const ths = findByTag(tr?.children, 'th');
      for (const th of ths) columns.push(vnodeText(th.children));
    } else if ((section as any).type === 'tbody') {
      const trs = findByTag((section as any).children, 'tr');
      for (const tr of trs) {
        const tds = findByTag(tr.children, 'td');
        const row: Record<string, string> = {};
        tds.forEach((td, i) => {
          row[columns[i] ?? String(i)] = vnodeText(td.children);
        });
        rows.push(row);
      }
    }
  }
  return { columns, rows };
}
</script>

<template>
  <component :is="MarkdownRenderer" v-if="MarkdownRenderer" :markdown="content">
    <!-- 用 el-table 替换所有 Markdown 表格 -->
    <template #table="{ children }">
      <div style="margin: 16px 0">
        <template v-if="children">
          <el-table
            :data="extractTableData(children()).rows"
            border
            stripe
            style="width: 100%"
            size="small"
          >
            <el-table-column
              v-for="col in extractTableData(children()).columns"
              :key="col"
              :prop="col"
              :label="col"
              min-width="100"
            />
          </el-table>
        </template>
      </div>
    </template>
  </component>
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### dark-mode

```vue
<docs>
---
title: 深色模式
---

通过 `is-dark` prop 切换深浅色主题，代码块语法高亮主题也会随之自动切换。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const isDark = ref(false);

const content = `# 深色模式示例

这是一段带有代码块的内容：

\`\`\`typescript
const isDark: boolean = true;
const theme = isDark ? 'vitesse-dark' : 'vitesse-light';
console.log(\`当前高亮主题：\${theme}\`);
\`\`\`

> 深色模式下，代码高亮主题也会自动切换为深色风格。
`;
</script>

<template>
  <div>
    <el-switch
      v-model="isDark"
      active-text="深色"
      inactive-text="浅色"
      style="margin-bottom: 12px"
    />
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="content"
      :is-dark="isDark"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### latex

```vue
<docs>
---
title: LaTeX 数学公式
---

通过 `enable-latex` 启用数学公式渲染，需安装 `katex` 并引入其样式文件。
</docs>

<script setup lang="ts">
import 'katex/dist/katex.min.css';
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `### 行内公式

欧拉公式：$e^{i\\pi} + 1 = 0$

二次方程：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

向量点积：$\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y + a_z b_z$

### 块级公式

傅里叶变换：

$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt
$$

矩阵乘法：

$$
\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\cdot \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} ax+by \\\\ cx+dy \\end{bmatrix}
$$

Boxed 公式：

$$\\boxed{E = mc^2}$$
`;
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :enable-latex="true"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### mermaid-actions

```vue
<docs>
---
title: 自定义 Mermaid 操作按钮
---

通过 `mermaid-actions` 传入自定义按钮数组，可在 Mermaid 图表工具栏添加自定义操作。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`mermaid
graph LR
    A[客户端] --> B[负载均衡]
    B --> C[服务A]
    B --> D[服务B]
    C --> E[(数据库)]
    D --> E
\`\`\`
`;

const lastAction = ref('');

const mermaidActions = [
  {
    key: 'share',
    title: '分享图表',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>`,
    onClick: (props: any) => {
      lastAction.value = `分享图表，SVG 长度：${props.svg.length} 字符`;
    }
  },
  {
    key: 'edit-online',
    title: '在线编辑',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    show: (props: any) => !props.showSourceCode,
    onClick: (props: any) => {
      lastAction.value = `打开编辑器，原始内容：${props.rawContent.substring(0, 40)}...`;
    }
  }
];
</script>

<template>
  <div>
    <div
      v-if="lastAction"
      style="
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #f0f9ff;
        border-radius: 4px;
        color: #0369a1;
        font-size: 13px;
      "
    >
      操作记录：{{ lastAction }}
    </div>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="content"
      :mermaid-actions="mermaidActions"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

### mermaid

```vue
<docs>
---
title: Mermaid 图表
---

开启 `enable-mermaid` 后可渲染流程图、时序图等，需安装 `mermaid`。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const content = `\`\`\`mermaid
graph TD
    A[开始] --> B{已登录?}
    B -->|是| C[进入首页]
    B -->|否| D[跳转登录页]
    D --> E[输入凭据]
    E --> F{验证通过?}
    F -->|是| C
    F -->|否| G[提示错误]
    G --> D
\`\`\`

\`\`\`mermaid
sequenceDiagram
    用户->>前端: 点击发送
    前端->>服务端: POST /api/chat
    服务端-->>前端: 流式响应 (SSE)
    前端-->>用户: 实时渲染 Markdown
\`\`\`
`;
</script>

<template>
  <component
    :is="MarkdownRenderer"
    v-if="MarkdownRenderer"
    :markdown="content"
    :enable-mermaid="true"
  />
  <div v-else style="padding: 16px; color: #999">加载中...</div>
</template>

```

### streaming

```vue
<docs>
---
title: 流式渲染动画
---

开启 `enable-animate` 后，新增内容将以逐字淡入动画效果呈现，非常适合 AI 流式输出场景。
</docs>

<script setup lang="ts">
import 'shiki';
import 'shiki-stream';

const MarkdownRenderer = shallowRef();
onMounted(async () => {
  if (typeof window === 'undefined') return;
  await import('x-markdown-vue/style');
  const mod = await import('x-markdown-vue');
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod.default ?? mod;
});

const fullText = `# AI 助手回复

正在流式输出 Markdown 内容...

- 支持 **加粗** 和 *斜体*
- 支持 \`行内代码\`
- 支持任务列表

- [x] 已完成的步骤
- [ ] 待处理的任务

\`\`\`typescript
const greeting: string = 'Hello World';
console.log(greeting);
\`\`\`
`;

const streamContent = ref('');
let intervalId: ReturnType<typeof setInterval> | null = null;
const isStreaming = ref(false);

function startStream() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  streamContent.value = '';
  isStreaming.value = true;
  let index = 0;
  intervalId = setInterval(() => {
    if (index < fullText.length) {
      streamContent.value += fullText[index++];
    } else {
      clearInterval(intervalId!);
      intervalId = null;
      isStreaming.value = false;
    }
  }, 30);
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div>
    <el-button
      type="primary"
      :loading="isStreaming"
      style="margin-bottom: 12px"
      @click="startStream"
    >
      {{ isStreaming ? '输出中...' : '开始流式输出' }}
    </el-button>
    <component
      :is="MarkdownRenderer"
      v-if="MarkdownRenderer"
      :markdown="streamContent"
      :enable-animate="true"
    />
    <div v-else style="padding: 16px; color: #999">加载中...</div>
  </div>
</template>

```

## API 参考


---

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

# Web-DeepSeek Hook-Fetch 模块

## 模块概述

Web-DeepSeek 项目基于独立请求库 [hook-fetch](https://jsonlee12138.github.io/hook-fetch/) 封装了统一的 HTTP 客户端（`src/utils/http.ts`），实现了**插件化拦截器架构**，通过 Auth 插件注入 Bearer Token、Error 插件统一错误处理，向上层 API 模块暴露 `http.post` / `http.get` 等标准方法。

hook-fetch 是一个基于原生 `fetch` API 的轻量 HTTP 客户端，支持请求/响应拦截器 (Plugin)、超时控制、baseURL 等现代特性。Web-DeepSeek 在其基础上封装了 `chatApi` 模块（`src/api/chat-api.ts`），提供流式/非流式对话补全接口，供 Pinia Store 层调用。

**架构分层**：

```
stores/chat.ts  (Pinia Store — 业务层)
    │ import { chatApi, ChatRequestParams }
    ▼
api/chat-api.ts  (API 封装层 — chatStream / chat)
    │ import http from '@/utils/http'
    ▼
utils/http.ts  (HTTP 客户端层 — hook-fetch.create)
    │ import hookFetch from 'hook-fetch'
    ▼
hook-fetch  (第三方库 — 底层 fetch 封装)
```

---

## 核心 API

### 1. HTTP 客户端初始化 (`src/utils/http.ts`)

```typescript
import hookFetch from 'hook-fetch'
import type { HookFetchPlugin } from 'hook-fetch'

const http = hookFetch.create({
  baseURL: import.meta.env.VITE_AI_API_BASE || '/ai-api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  plugins: [authPlugin, errorPlugin],
})

export default http
```

**配置项**：

| 配置 | 类型 | 说明 |
|------|------|------|
| `baseURL` | `string` | 基础 API 路径，由环境变量 `VITE_AI_API_BASE` 提供，默认 `/ai-api` |
| `timeout` | `number` | 请求超时（毫秒），默认 30000ms |
| `headers` | `HeadersInit` | 默认请求头，`Content-Type: application/json` |
| `withCredentials` | `boolean` | 是否携带跨域凭证，设为 `false` |
| `plugins` | `HookFetchPlugin[]` | 插件（拦截器）列表 |

### 2. Auth 插件

```typescript
const authPlugin: HookFetchPlugin = {
  name: 'auth',
  priority: 100,
  beforeRequest(config) {
    const apiKey = import.meta.env.VITE_AI_API_KEY || ''
    if (apiKey) {
      const headers = new Headers(config.headers)
      headers.set('Authorization', `Bearer ${apiKey}`)
      config.headers = headers
    }
    return config
  },
}
```

**功能**：在每次请求前自动注入 `Authorization: Bearer <API_KEY>` 请求头。API Key 从环境变量 `VITE_AI_API_KEY` 读取。优先级 100。

### 3. Error 插件

```typescript
const errorPlugin: HookFetchPlugin = {
  name: 'error',
  priority: 50,
  onError(error, config) {
    console.error(
      `[HTTP Error] ${config.method} ${config.url}`,
      error.message,
      error.status,
    )
  },
}
```

**功能**：统一捕获并打印 HTTP 错误日志，格式为 `[HTTP Error] METHOD URL message status`。优先级 50。

### 4. Plugins 执行顺序

插件按 `priority` 从高到低执行：
1. `auth` (priority: 100) → 注入 Bearer Token
2. `error` (priority: 50) → 错误日志

---

## Chat API 封装 (`src/api/chat-api.ts`)

### 请求参数类型

```typescript
export interface ChatRequestParams {
  messages: { role: string; content: string }[]
  model: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
  providerId?: string
  apiHost?: string
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `messages` | `{ role, content }[]` | 是 | 对话消息数组 |
| `model` | `string` | 是 | 模型 ID，如 `deepseek-chat` |
| `temperature` | `number` | 否 | 采样温度 |
| `maxTokens` | `number` | 否 | 最大 token 数 |
| `signal` | `AbortSignal` | 否 | 取消信号，用于中止请求 |
| `providerId` | `string` | 否 | 多 Provider 支持，指定 Provider ID |
| `apiHost` | `string` | 否 | 自定义 API 主机地址 |

### `chatStream()` — 流式对话补全

```typescript
async chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>>
```

发送流式请求，返回 `ReadableStream<Uint8Array>`（SSE 原始字节流）。调用方通过 `getReader()` 逐块读取，手动解析 SSE 的 `data:` 行和 `[DONE]` 终止标记。

请求体自动附加 `stream: true`，可选字段 `temperature` / `max_tokens` / `provider_id` / `api_host` 仅在传值时添加。

### `chat()` — 非流式对话补全

```typescript
async chat(params: ChatRequestParams): Promise<ChatCompletionResponse>
```

发送非流式请求，返回解析后的 JSON 响应（`ChatCompletionResponse`）。请求体附加 `stream: false`。

---

## 类型定义

### Chat API 类型 (`src/types/index.ts`)

```typescript
export interface ChatCompletionMessage {
  role: MessageRole  // 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatCompletionMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export interface ChatCompletionChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: MessageRole
      content?: string
      reasoning_content?: string
    }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatCompletionMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Stream delta — 用于 SSE 逐块解析
export interface ChatStreamDelta {
  id?: string
  content?: string
  reasoning_content?: string
  model?: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

// 模型列表响应
export interface ModelListResponse {
  data: Array<{
    id: string
    object?: string
    owned_by?: string
  }>
}
```

### hook-fetch Plugin 类型（来自 hook-fetch 第三方库）

```typescript
export interface HookFetchPlugin {
  name: string
  priority?: number
  beforeRequest?: (config: RequestConfig) => RequestConfig
  afterResponse?: (response: Response, config: RequestConfig) => Response
  onError?: (error: HookFetchError, config: RequestConfig) => void
}
```

---

## 使用示例

### 示例 1：流式对话 — Chat Store (`src/stores/chat.ts`)

这是项目中 hook-fetch 最核心的使用场景。Pinia Store 的 `streamChat` 方法调用 `chatApi.chatStream()` 发起流式请求，手动解析 SSE 字节流：

```typescript
import { chatApi, type ChatRequestParams } from '@/api/chat-api'

// 构建请求参数
const params: ChatRequestParams = {
  messages: messages.value
    .filter(m => m.status === 'complete' || m.status === 'streaming')
    .map(m => ({ role: m.role, content: m.content })),
  model: uiStore.selectedModel?.id ?? 'deepseek-chat',
  signal: abortController.value.signal,   // 支持中止
}

try {
  const stream = await chatApi.chatStream(params)
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue
      const json = trimmed.slice(6)
      if (json === '[DONE]') continue
      const delta = JSON.parse(json) as ChatStreamDelta
      if (delta.reasoning_content) {
        assistantMsg.reasoningContent += delta.reasoning_content
      }
      if (delta.content) {
        assistantMsg.content += delta.content
      }
    }
  }

  assistantMsg.status = 'complete'
} catch (err) {
  if ((err as Error).name === 'AbortError') {
    assistantMsg.status = 'stopped'
  } else {
    assistantMsg.status = 'error'
    assistantMsg.error = (err as Error).message
  }
}
```

**关键点**：
- 通过 `signal: abortController.value.signal` 传入 `AbortSignal`，实现用户点击停止时取消请求
- 手动处理 SSE `data:` 行，解析 `ChatStreamDelta` 提取 `content` 和 `reasoning_content`
- `[DONE]` 标记表示流结束
- `AbortError` 单独处理，标记为 `stopped` 而非 `error`

### 示例 2：重新生成 — 同一 Store 的再生方法

当用户点击"重新生成"时，清理上一条 assistant 消息后重新发起流式请求：

```typescript
// 重置 assistant 消息
msg.content = ''
msg.reasoningContent = ''
msg.status = 'sending'
msg.loading = true
msg.error = undefined

// 重新构建上下文 + 发起请求
abortController.value = new AbortController()
const params: ChatRequestParams = {
  messages: messages.value
    .slice(0, idx)   // 只传目标消息之前的历史
    .filter(m => m.status === 'complete' || m.status === 'stopped')
    .map(m => ({ role: m.role, content: m.content })),
  model: uiStore.selectedModel?.id ?? 'deepseek-chat',
  signal: abortController.value.signal,
}

generating.value = true
chatApi.chatStream(params).then(async (stream) => {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  // ... 同示例 1 的 SSE 解析逻辑
  msg.status = 'complete'
}).catch((err) => {
  if ((err as Error).name === 'AbortError') {
    msg.status = 'stopped'
  } else {
    msg.status = 'error'
    msg.error = (err as Error).message
  }
})
```

### 示例 3：非流式请求 — Chat API 封装层

`chatApi.chat()` 的实现展示了如何用 `http.post().json()` 获取完整 JSON 响应：

```typescript
import http from '@/utils/http'

async chat(params: ChatRequestParams): Promise<ChatCompletionResponse> {
  const { messages, model, temperature, maxTokens, signal, providerId, apiHost } = params

  const body = {
    model,
    messages,
    stream: false,
    ...(temperature !== undefined && { temperature }),
    ...(maxTokens !== undefined && { max_tokens: maxTokens }),
    ...(providerId && { provider_id: providerId }),
    ...(apiHost && { api_host: apiHost }),
  }

  const request = http.post('/chat/completions', body, {
    headers: { 'Content-Type': 'application/json' },
    ...(signal && { signal }),
  })

  return request.json() as Promise<ChatCompletionResponse>
}
```

**关键点**：
- `http.post(url, body, options)` 返回 hook-fetch Request 对象
- 通过 `.json()` 方法直接解析 JSON 响应体并返回类型化结果
- 可选参数通过对象展开有条件地添加，保持请求体干净

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_AI_API_BASE` | API 基础 URL（baseURL） | `/ai-api` |
| `VITE_AI_API_KEY` | API 密钥（Bearer Token） | 空（不注入 Auth 头） |

---

## 插件扩展指南

如需新增自定义拦截器，在 `src/utils/http.ts` 的 `plugins` 数组中追加 `HookFetchPlugin` 对象：

```typescript
const logPlugin: HookFetchPlugin = {
  name: 'logger',
  priority: 80,
  beforeRequest(config) {
    console.log(`[HTTP] ${config.method} ${config.url}`)
    return config
  },
  afterResponse(response, config) {
    console.log(`[HTTP] ${response.status} ${config.url}`)
    return response
  },
}

// 注册到 http 实例
const http = hookFetch.create({
  // ...
  plugins: [authPlugin, logPlugin, errorPlugin],
})
```

**优先级建议**：
- 90-100：认证/鉴权类
- 70-89：日志/监控类
- 50-69：错误处理类
- 0-49：其他业务拦截
*（内容由AI生成，仅供参考）*
