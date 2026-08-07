<!--
  路由入口页面
  未导入数据时显示导入视图，已导入则进入聊天
-->
<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app';
import OrbitImportView from './cherry/OrbitImportView.vue';
import OrbitChatView from './cherry/OrbitChatView.vue';

const store = useAppStore();
store.init();
</script>

<template>
  <OrbitImportView v-if="!store.isImported" />
  <OrbitChatView v-else-if="store.appData" />
  <div v-else class="orbit-loading">加载中…</div>
</template>

<style scoped>
.orbit-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #667085;
  font-size: 15px;
}
</style>
