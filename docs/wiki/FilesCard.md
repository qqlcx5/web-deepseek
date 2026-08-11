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

