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

