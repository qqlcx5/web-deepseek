<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRecord } from 'vue-element-plus-x'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: string
  language?: 'zh-CN' | 'en-US'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isSupported = ref(false)
const inputValue = ref(props.modelValue)

onMounted(() => {
  // Check browser support for Web Speech API
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  isSupported.value = !!SpeechRecognition
})

const { start, stop, value: recognizedText, loading } = useRecord({
  onEnd(res: string) {
    if (res) {
      const current = inputValue.value
      inputValue.value = current ? `${current} ${res}` : res
      emit('update:modelValue', inputValue.value)
    }
  },
})

// Watch recognized text for real-time update
watch(recognizedText, (val) => {
  if (val) {
    const current = props.modelValue
    inputValue.value = current ? `${current} ${val}` : val
    emit('update:modelValue', inputValue.value)
  }
})

watch(() => props.modelValue, (val) => {
  inputValue.value = val
})

function toggleRecording() {
  if (!isSupported.value) {
    ElMessage.warning('当前浏览器不支持语音识别，请使用 Chrome 浏览器')
    return
  }
  if (loading.value) {
    stop()
  } else {
    try {
      start()
    } catch (e) {
      ElMessage.error('麦克风权限被拒绝，请在浏览器设置中授权')
    }
  }
}

defineExpose({ isSupported, loading, toggleRecording })
</script>

<template>
  <button
    v-if="isSupported"
    class="voice-btn"
    :class="{ recording: loading }"
    :title="loading ? '停止录音' : '语音输入'"
    @click="toggleRecording"
  >
    <i :class="loading ? 'i-tabler-player-stop-filled' : 'i-tabler-microphone'" class="text-base" />
  </button>
</template>

<style scoped lang="scss">
.voice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  color: #667085;
  background: transparent;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #5b56d6;
  }

  &.recording {
    color: #ef4444;
    background: #fef2f2;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}
</style>
