<script setup lang="ts">
import { h } from 'vue'
import { Welcome, Prompts } from 'vue-element-plus-x'
import type { PromptsItemsProps } from 'vue-element-plus-x/types/components/Prompts/types'
import { Icon } from '@iconify/vue'

interface Props {
  icon?: string
  title?: string
  description?: string
  extra?: string
  prompts?: PromptsItemsProps[]
}

withDefaults(defineProps<Props>(), {
  icon: '',
  title: '开始新对话',
  description: '输入消息或粘贴文件，AI 将为你解答',
  extra: '',
  prompts: () => [],
})

const emit = defineEmits<{
  (event: 'itemClick', item: PromptsItemsProps): void
}>()

function onItemClick(item: PromptsItemsProps) {
  emit('itemClick', item)
}
</script>

<template>
  <div class="welcome-wrap">
    <Welcome
      :title="title"
      :description="description"
      :extra="extra || undefined"
      variant="filled"
    >
      <template #image>
        <div class="welcome-icon">
          <Icon :icon="icon || 'tabler:sparkles'" width="48" />
        </div>
      </template>
    </Welcome>

    <Prompts
      v-if="prompts.length"
      class="welcome-prompts"
      :items="prompts"
      :vertical="true"
      :wrap="false"
      @item-click="onItemClick"
    />
  </div>
</template>

<style scoped>
.welcome-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  width: 100%;
  max-width: var(--message-max, 820px);
  margin: 0 auto;
  padding: 48px 24px;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--line-strong);
  border-radius: 16px;
}

.welcome-prompts {
  width: 100%;
  max-width: 560px;
}
</style>
