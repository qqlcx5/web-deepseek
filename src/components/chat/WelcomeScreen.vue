<script setup lang="ts">
import { Welcome } from 'vue-element-plus-x'

interface Props {
  icon?: string
  title?: string
  description?: string
  extra?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'tabler:sparkles',
  title: '开始新对话',
  description: '输入消息或粘贴文件，AI 将为你解答',
  extra: '',
})
</script>

<template>
  <div class="welcome-wrap">
    <Welcome
      :icon="icon"
      :title="title"
      :description="description"
      :extra="extra || undefined"
      variant="filled"
    />
  </div>
</template>

<style scoped>
.welcome-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: var(--message-max, 820px);
  margin: 0 auto;
  padding: 48px 24px;
}
</style>
