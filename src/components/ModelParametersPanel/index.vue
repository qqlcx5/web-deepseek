<template>
  <div class="model-params-panel">
    <div class="param-group">
      <div class="param-label">
        <span>Temperature</span>
        <span class="param-value">{{ params.temperature?.toFixed(1) }}</span>
      </div>
      <div class="param-control">
        <ElSlider
          :model-value="params.temperature ?? 1"
          :min="0"
          :max="2"
          :step="0.1"
          :show-tooltip="false"
          @input="onParamChange('temperature', $event)"
        />
        <ElInputNumber
          :model-value="params.temperature ?? 1"
          :min="0"
          :max="2"
          :step="0.1"
          :precision="1"
          size="small"
          controls-position="right"
          @change="onParamChange('temperature', $event)"
        />
      </div>
    </div>

    <div class="param-group">
      <div class="param-label">
        <span>Top-P</span>
        <span class="param-value">{{ params.topP?.toFixed(2) }}</span>
      </div>
      <div class="param-control">
        <ElSlider
          :model-value="params.topP ?? 1"
          :min="0"
          :max="1"
          :step="0.01"
          :show-tooltip="false"
          @input="onParamChange('topP', $event)"
        />
        <ElInputNumber
          :model-value="params.topP ?? 1"
          :min="0"
          :max="1"
          :step="0.01"
          :precision="2"
          size="small"
          controls-position="right"
          @change="onParamChange('topP', $event)"
        />
      </div>
    </div>

    <div class="param-group">
      <div class="param-label">
        <span>Max Tokens</span>
      </div>
      <div class="param-control param-control--single">
        <ElInputNumber
          :model-value="params.maxTokens ?? 4096"
          :min="1"
          :max="128000"
          :step="256"
          size="small"
          controls-position="right"
          @change="onParamChange('maxTokens', $event)"
        />
      </div>
    </div>

    <ElCollapse v-model="advancedOpen">
      <ElCollapseItem title="高级参数" name="advanced">
        <div class="param-group">
          <div class="param-label">
            <span>Presence Penalty</span>
          </div>
          <div class="param-control param-control--single">
            <ElInputNumber
              :model-value="params.presencePenalty ?? 0"
              :min="-2"
              :max="2"
              :step="0.1"
              :precision="1"
              size="small"
              controls-position="right"
              @change="onParamChange('presencePenalty', $event)"
            />
          </div>
        </div>

        <div class="param-group">
          <div class="param-label">
            <span>Frequency Penalty</span>
          </div>
          <div class="param-control param-control--single">
            <ElInputNumber
              :model-value="params.frequencyPenalty ?? 0"
              :min="-2"
              :max="2"
              :step="0.1"
              :precision="1"
              size="small"
              controls-position="right"
              @change="onParamChange('frequencyPenalty', $event)"
            />
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElSlider, ElInputNumber, ElCollapse, ElCollapseItem } from 'element-plus'
import { useModelStore } from '@/stores/modules/model'
import type { ModelParams } from '@/types/model'

const modelStore = useModelStore()
const params = computed(() => modelStore.params)

const advancedOpen = ref<string[]>([])

function onParamChange(key: keyof ModelParams, value: number | undefined) {
  modelStore.updateParams({ [key]: value })
}
</script>

<script lang="ts">
import { computed } from 'vue'
export default { name: 'ModelParametersPanel' }
</script>

<style lang="scss" scoped>
.model-params-panel {
  padding: 4px 0;
}

.param-group {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.param-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.param-value {
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 12px;

  .el-slider {
    flex: 1;
  }

  .el-input-number {
    width: 100px;
    flex-shrink: 0;
  }

  &--single {
    .el-input-number {
      width: 100%;
    }
  }
}
</style>
