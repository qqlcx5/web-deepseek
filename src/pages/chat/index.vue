<!--
  聊天入口：按 route.params.id 分发
  - 默认（无 id）→ ChatDefaul（欢迎页 + Sender）
  - 带 id        → OrbitChat（Orbit AI 三栏风格）
-->
<script setup lang="ts">
import { useRoute } from 'vue-router';
import ChatDefaul from '@/pages/chat/layouts/chatDefaul/index.vue';
import OrbitChat from '@/pages/chat/layouts/OrbitChat/index.vue';

const route = useRoute();
const sessionId = computed(() => route.params?.id);
</script>

<template>
  <div class="chat-container">
    <OrbitChat v-if="sessionId" />
    <ChatDefaul v-else />
  </div>
</template>

<style lang="scss" scoped>
.chat-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>