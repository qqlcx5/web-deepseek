// ─── UI Store: Layout, interactions, static data ──────────────────────────────
// All UI state lives here. Components import useUiStore for layout/modal/toast/model.

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useAppStore } from './app'
import { onlineRef } from '@/composables/useNetwork'
import { TABLET_BREAKPOINT, MOBILE_BREAKPOINT } from '@/config/breakpoints'
import { COMMANDS, PROMPT_PRESETS } from '@/config/commands'
import { loadPromptDraft, savePromptDraft } from '@/utils/storage'
import type { Model, Command, ModalType } from '@/types'

export const useUiStore = defineStore('ui', () => {
  const appStore = useAppStore()

  // ─── Constants ───
  const tabletBreakpoint = TABLET_BREAKPOINT
  const mobileBreakpoint = MOBILE_BREAKPOINT

  // ─── Static Data (sourced from @/config) ───
  const promptPresets = PROMPT_PRESETS
  const commands = COMMANDS

  // ─── Layout State ───
  const sidebarOpen = ref(false)
  const inspectorOpen = ref(false)
  const inspectorVisible = ref(true)
  const focusMode = ref(false)
  const online = onlineRef
  const saving = ref(false)

  // ─── Modal ───
  const modal = ref<ModalType>('')

  // ─── Toast ───
  const toast = ref('')
  const undoAction = ref<(() => void) | null>(null)

  // ─── Input State ───
  const commandQuery = ref('')
  const nearBottom = ref(true)
  const promptDraft = ref(
    loadPromptDraft() ||
    '你是一名资深AI助手。先给明确结论，再说明关键约束、风险和可执行步骤。',
  )

  // ─── Model Selection (dynamic from providers) ───
  const models = computed<Model[]>(() => {
    return appStore.providers
      .filter(p => p.enabled)
      .flatMap(p =>
        p.models
          .filter(m => m.enabled)
          .map(m => ({
            id: m.id,
            name: m.name,
            providerId: p.id,
            color: '#4d6bfe',
            description: m.description ?? `${p.name} · ${m.name}`,
            tags: [p.name, ...(m.contextLength ? [`${Math.round(m.contextLength / 1000)}K`] : [])],
            contextLength: m.contextLength,
          })),
      )
  })

  const selectedModel = ref<Model | null>(null)

  // Whether the currently selected model's provider is ready for chat
  const selectedModelReady = computed(() => {
    if (!selectedModel.value) return false
    const provider = appStore.providers.find(p => p.id === selectedModel.value!.providerId)
    if (!provider || !provider.enabled) return false
    return Boolean(provider.apiKey)
  })

  // Initialize selectedModel from first enabled provider's first model
  function initSelectedModel() {
    if (selectedModel.value) return
    const firstProvider = appStore.providers.find(p => p.enabled && p.models.some(m => m.enabled))
    if (firstProvider) {
      const firstModel = firstProvider.models.find(m => m.enabled)
      if (firstModel) {
        selectedModel.value = {
          id: firstModel.id,
          name: firstModel.name,
          providerId: firstProvider.id,
          color: '#4d6bfe',
          description: firstModel.description ?? `${firstProvider.name} · ${firstModel.name}`,
          tags: [firstProvider.name],
          contextLength: firstModel.contextLength,
        }
      }
    }
    // Fallback to hardcoded if no providers loaded
    if (!selectedModel.value) {
      selectedModel.value = {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        providerId: '',
        color: '#4d6bfe',
        description: '默认模型',
        tags: [],
        contextLength: 64000,
      }
    }
  }

  // ─── Getters ───
  const filteredCommands = computed(() => {
    const q = commandQuery.value.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(c =>
      `${c.title} ${c.description}`.toLowerCase().includes(q),
    )
  })

  const filteredCommandChats = computed(() => {
    // Placeholder: chat store will override via its own getter
    return []
  })

  // ─── Toast Actions ───
  function showToast(message: string, undo?: () => void) {
    toast.value = message
    undoAction.value = undo ?? null
    setTimeout(() => {
      if (toast.value === message) {
        toast.value = ''
        undoAction.value = null
      }
    }, 3200)
  }

  function undo() {
    undoAction.value?.()
    toast.value = ''
    undoAction.value = null
  }

  // ─── Model Actions ───
  function selectModel(model: Model) {
    selectedModel.value = model
    modal.value = ''
    showToast(`已切换到 ${model.name}`)
  }

  function selectModelById(modelId: string, providerId: string) {
    const provider = appStore.providers.find(p => p.id === providerId)
    if (!provider) return
    const modelInfo = provider.models.find(m => m.id === modelId)
    if (!modelInfo) return
    selectedModel.value = {
      id: modelInfo.id,
      name: modelInfo.name,
      providerId: provider.id,
      color: '#4d6bfe',
      description: modelInfo.description ?? `${provider.name} · ${modelInfo.name}`,
      tags: [provider.name],
      contextLength: modelInfo.contextLength,
    }
    modal.value = ''
    showToast(`已切换到 ${modelInfo.name}`)
  }

  // ─── Layout Actions ───
  function toggleFocusMode() {
    focusMode.value = !focusMode.value
    if (focusMode.value) {
      inspectorVisible.value = false
      inspectorOpen.value = false
    } else if (window.innerWidth > tabletBreakpoint) {
      inspectorVisible.value = true
    }
  }

  function toggleInspector() {
    if (window.innerWidth <= tabletBreakpoint) {
      inspectorOpen.value = !inspectorOpen.value
    } else {
      inspectorVisible.value = !inspectorVisible.value
    }
  }

  function closeInspector() {
    inspectorOpen.value = false
    inspectorVisible.value = false
  }

  function closeDrawers() {
    sidebarOpen.value = false
    inspectorOpen.value = false
  }

  function handleResize() {
    if (window.innerWidth > tabletBreakpoint && !focusMode.value) {
      inspectorVisible.value = true
      inspectorOpen.value = false
    } else {
      inspectorVisible.value = false
    }
    if (window.innerWidth > mobileBreakpoint) {
      sidebarOpen.value = false
    }
  }

  // ─── Command Actions ───
  function runCommand(command: Command) {
    modal.value = ''
    if (command.action === 'model') modal.value = 'model'
    else if (command.action === 'prompt') modal.value = 'prompt'
    else if (command.action === 'settings') modal.value = 'settings'
    else if (command.action === 'provider') modal.value = 'provider'
    else if (command.action === 'assistant') modal.value = 'assistant'
    else if (command.action === 'focus') toggleFocusMode()
    else if (command.action === 'theme') {
      const { toggleTheme } = useTheme()
      toggleTheme()
    }
    // 'new' is handled by chat store
  }

  function savePrompt() {
    modal.value = ''
    savePromptDraft(promptDraft.value)
    showToast('系统提示词新版本已保存')
  }

  // ─── Network Monitoring (state lives in useNetwork; we only surface toasts) ───
  watch(online, isOnline => {
    showToast(isOnline ? '网络已恢复' : '网络已断开，消息将保存在本地')
  })

  return {
    // Constants
    tabletBreakpoint, mobileBreakpoint,
    // Static Data
    models, promptPresets, commands,
    // Layout State
    sidebarOpen, inspectorOpen, inspectorVisible, focusMode,
    online, saving, modal, toast, undoAction,
    // Input State
    commandQuery, nearBottom, promptDraft,
    selectedModel, selectedModelReady,
    // Getters
    filteredCommands, filteredCommandChats,
    // Actions
    showToast, undo,
    selectModel, selectModelById, initSelectedModel,
    toggleFocusMode, toggleInspector, closeInspector, closeDrawers, handleResize,
    runCommand, savePrompt,
  }
})
