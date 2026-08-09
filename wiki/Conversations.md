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

