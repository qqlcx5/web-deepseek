<script setup lang="ts">
/**
 * ChatPage — 对话页（AppLayout 子路由）
 */
import ChatView from './components/ChatView.vue'
</script>

<template>
  <div class="chat-page">
    <ChatView />
  </div>
</template>

<style scoped lang="scss">
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
