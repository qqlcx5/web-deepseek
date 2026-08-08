<!-- 切换模型 — 增强版：Provider 分组 + 搜索 + 能力标签 -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { GetSessionListVO } from '@/api/model/types'
import type { ModelCapability } from '@/types/model'
import Popover from '@/components/Popover/index.vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import { useModelStore } from '@/stores/modules/model'

const emit = defineEmits<{
  (e: 'addProvider'): void
}>()

const modelStore = useModelStore()

const searchText = ref('')
const popoverRef = ref()

const currentModelName = computed(
  () => modelStore.currentModelInfo?.modelName || '选择模型',
)

const currentProviderName = computed(() => {
  const pid = modelStore.currentProviderId
  if (!pid) return ''
  const provider = modelStore.providers.find(p => p.id === pid)
  return provider?.name || ''
})

// 获取有 Provider 的模型分组
const providerGroups = computed(() => {
  if (modelStore.providers.length > 0) {
    return modelStore.providers.map(p => ({
      ...p,
      filteredModels: searchText.value
        ? p.models.filter(m => m.name.toLowerCase().includes(searchText.value.toLowerCase()))
        : p.models,
    })).filter(g => g.filteredModels.length > 0)
  }
  return []
})

// 兼容旧版 modelList（无 Provider 时）
const filteredModelList = computed(() => {
  if (!searchText.value) return modelStore.modelList
  return modelStore.modelList.filter(
    m => m.modelName?.toLowerCase().includes(searchText.value.toLowerCase()),
  )
})

// 是否有 Provider 数据
const hasProviders = computed(() => modelStore.providers.length > 0)

const popoverStyle = ref({
  width: '260px',
  padding: '0',
  height: 'fit-content',
  maxHeight: '400px',
  background: 'var(--el-bg-color, #fff)',
  border: '1px solid var(--el-border-color-light)',
  borderRadius: '8px',
  boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
})

async function showPopover() {
  searchText.value = ''
  if (modelStore.providers.length === 0) {
    await modelStore.fetchProviders()
  }
  // 同时保持旧版兼容
  if (modelStore.modelList.length === 0) {
    await modelStore.requestModelList()
  }
}

function handleClick(item: GetSessionListVO) {
  modelStore.setCurrentModelInfo(item)
  popoverRef.value?.hide?.()
}

function handleProviderModelClick(model: { id: string; name: string }, providerId: string) {
  modelStore.setModel(model.id || model.name, providerId)
  modelStore.currentModelInfo = { modelName: model.name }
  popoverRef.value?.hide?.()
}

function handleAddProvider() {
  emit('addProvider')
  popoverRef.value?.hide?.()
}

function connectionColor(status?: string): string {
  if (status === 'connected') return '#67c23a'
  if (status === 'disconnected') return '#f56c6c'
  return '#c0c4cc'
}

const CAPABILITY_LABELS: Record<ModelCapability, string> = {
  vision: 'V',
  'tool-call': 'T',
  reasoning: 'R',
  embedding: 'E',
}

onMounted(async () => {
  if (modelStore.modelList.length === 0) {
    await modelStore.requestModelList()
  }
  if (!modelStore.currentModelInfo?.modelName && modelStore.modelList.length > 0) {
    modelStore.setCurrentModelInfo(modelStore.modelList[0])
  }
})
</script>

<template>
  <div class="model-select">
    <Popover
      ref="popoverRef"
      placement="top-start"
      :offset="[4, 0]"
      popover-class="popover-content"
      :popover-style="popoverStyle"
      trigger="clickTarget"
      @show="showPopover"
    >
      <template #trigger>
        <div
          class="model-select-box select-none flex items-center gap-4px p-10px rounded-10px cursor-pointer font-size-12px"
        >
          <div class="model-select-box-icon">
            <SvgIcon name="models" size="12" />
          </div>
          <div class="model-select-box-text font-size-12px">
            {{ currentModelName }}
          </div>
          <div
            v-if="currentProviderName"
            class="model-select-box-provider"
          >
            {{ currentProviderName }}
          </div>
        </div>
      </template>

      <div class="popover-content-box">
        <!-- 搜索框 -->
        <div class="search-box">
          <input
            v-model="searchText"
            class="search-input"
            placeholder="搜索模型..."
            @click.stop
          />
        </div>

        <!-- Provider 分组模式 -->
        <template v-if="hasProviders">
          <div
            v-for="group in providerGroups"
            :key="group.id"
            class="provider-group"
          >
            <div class="provider-group__header">
              <span
                class="provider-group__dot"
                :style="{ backgroundColor: connectionColor(group.connectionStatus) }"
              />
              <span class="provider-group__name">{{ group.name }}</span>
            </div>
            <div
              v-for="model in group.filteredModels"
              :key="model.id"
              class="provider-group__model"
              :class="{
                'is-active': model.id === modelStore.currentModelId || model.name === currentModelName,
              }"
              @click="handleProviderModelClick(model, group.id)"
            >
              <span class="provider-group__model-name">{{ model.name }}</span>
              <span
                v-for="cap in (model.capabilities || [])"
                :key="cap"
                class="capability-tag"
              >
                {{ CAPABILITY_LABELS[cap] || cap }}
              </span>
            </div>
          </div>
        </template>

        <!-- 兼容旧版：无 Provider 时的扁平列表 -->
        <template v-else>
          <div
            v-for="item in filteredModelList"
            :key="item.id"
            class="popover-content-box-items"
          >
            <Popover
              trigger-class="popover-trigger-item-text"
              popover-class="rounded-tooltip"
              placement="right"
              trigger="hover"
              :offset="[12, 0]"
            >
              <template #trigger>
                <div
                  class="popover-content-box-item p-4px font-size-12px text-overflow line-height-16px"
                  :class="{ 'is-select': item.modelName === currentModelName }"
                  @click="handleClick(item)"
                >
                  {{ item.modelName }}
                </div>
              </template>
              <div class="popover-content-box-item-text">
                {{ item.remark }}
              </div>
            </Popover>
          </div>
        </template>

        <!-- 添加自定义 Provider 入口 -->
        <div class="add-provider-entry" @click="handleAddProvider">
          + 添加自定义 Provider
        </div>
      </div>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.model-select-box {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary);
  border-radius: 10px;
}

.model-select-box-provider {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  padding: 1px 6px;
  border-radius: 4px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popover-content-box {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-box {
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: sticky;
  top: 0;
  background: var(--el-bg-color);
  z-index: 1;
}

.search-input {
  width: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  outline: none;
  background: transparent;
  color: var(--el-text-color-primary);
  box-sizing: border-box;

  &:focus {
    border-color: var(--el-color-primary);
  }

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
}

.provider-group {
  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px 4px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__name {
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__model {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px 6px 24px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }

  &__model-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.capability-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  flex-shrink: 0;
}

// 兼容旧版扁平列表
.popover-content-box-items {
  width: 100%;
  :deep() {
    .popover-trigger-item-text {
      width: 100%;
    }
  }
}

.popover-content-box-item {
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &.is-select {
    font-weight: 700;
    color: var(--el-color-primary);
  }
}

.popover-content-box-item-text {
  color: white;
  background-color: black;
  max-width: 200px;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  line-height: 1.4;
}

.add-provider-entry {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: center;
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--el-color-primary-light-9);
  }
}

// 滚动条
.popover-content-box::-webkit-scrollbar {
  width: 4px;
}

.popover-content-box::-webkit-scrollbar-track {
  background: transparent;
}

.popover-content-box::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
