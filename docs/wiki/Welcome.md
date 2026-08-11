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

