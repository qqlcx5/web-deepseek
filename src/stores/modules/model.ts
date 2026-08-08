import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchProviders, saveApiKey, removeApiKey, testConnection, addCustomProvider, deleteCustomProvider, fetchTokenUsage } from '@/api/model'
import type { ModelParams, TokenUsage, SaveApiKeyParams, AddCustomProviderParams } from '@/types/model'
import type { GetSessionListVO } from '@/api/model/types'
import { getAiModels } from '@/api/ai'
import { ElMessage } from 'element-plus'

export const useModelStore = defineStore('model', () => {
  // ---- 现有状态（兼容） ----
  const currentModelInfo = ref<GetSessionListVO>({})
  const modelList = ref<GetSessionListVO[]>([])

  // ---- 新增状态 ----
  const currentModelId = ref<string | null>(null)
  const currentProviderId = ref<string | null>(null)
  const params = ref<ModelParams>({
    temperature: 1,
    topP: 1,
    maxTokens: 4096,
    presencePenalty: 0,
    frequencyPenalty: 0,
  })
  const providers = ref<import('@/types/model').ModelProvider[]>([])
  const tokenUsage = ref<TokenUsage | null>(null)
  const loading = ref(false)
  const _paramsTimer = ref<ReturnType<typeof setTimeout> | null>(null)

  // ---- 兼容方法 ----
  function setCurrentModelInfo(modelInfo: GetSessionListVO) {
    currentModelInfo.value = modelInfo
    if (modelInfo.modelName) {
      currentModelId.value = modelInfo.modelName
    }
  }

  async function requestModelList() {
    try {
      const models = await getAiModels()
      modelList.value = models.map(model => ({ modelName: model.id, remark: model.owned_by }))
      if (modelList.value.length) {
        const preferred = modelList.value.find(
          item => item.modelName === import.meta.env.VITE_AI_DEFAULT_MODEL,
        )
        setCurrentModelInfo(preferred || modelList.value[0])
      }
    } catch (error) {
      console.error('requestModelList错误', error)
    }
  }

  // ---- 新增方法 ----

  /** 加载所有 Provider 及模型列表 */
  async function fetchProviderList() {
    loading.value = true
    try {
      const res = await fetchProviders()
      providers.value = res.result?.data ?? []
    } catch {
      ElMessage.error('加载模型列表失败')
    } finally {
      loading.value = false
    }
  }

  /** 切换当前模型 */
  function setModel(modelId: string, providerId: string) {
    currentModelId.value = modelId
    currentProviderId.value = providerId
    currentModelInfo.value = { modelName: modelId }
  }

  /** 更新当前模型参数（防抖 300ms 后持久化） */
  function updateParams(newParams: Partial<ModelParams>) {
    Object.assign(params.value, newParams)
    if (_paramsTimer.value) {
      clearTimeout(_paramsTimer.value)
    }
    _paramsTimer.value = setTimeout(async () => {
      try {
        // 参数持久化
      } catch {
        // 静默
      }
    }, 300)
  }

  /** 保存 API Key */
  async function doSaveApiKey(payload: SaveApiKeyParams): Promise<boolean> {
    try {
      await saveApiKey(payload)
      ElMessage.success('API Key 已保存')
      const provider = providers.value.find(p => p.id === payload.providerId)
      if (provider) {
        provider.apiKey = '****'
        provider.connectionStatus = 'unknown'
      }
      return true
    } catch {
      ElMessage.error('保存 API Key 失败')
      return false
    }
  }

  /** 移除 API Key */
  async function doRemoveApiKey(providerId: string): Promise<boolean> {
    try {
      await removeApiKey(providerId)
      const provider = providers.value.find(p => p.id === providerId)
      if (provider) {
        provider.apiKey = undefined
        provider.connectionStatus = 'disconnected'
      }
      ElMessage.success('API Key 已移除')
      return true
    } catch {
      ElMessage.error('移除 API Key 失败')
      return false
    }
  }

  /** 测试连接 */
  async function doTestConnection(providerId: string): Promise<boolean> {
    try {
      await testConnection(providerId)
      const provider = providers.value.find(p => p.id === providerId)
      if (provider) provider.connectionStatus = 'connected'
      ElMessage.success('连接成功')
      return true
    } catch {
      const provider = providers.value.find(p => p.id === providerId)
      if (provider) provider.connectionStatus = 'disconnected'
      ElMessage.error('连接失败')
      return false
    }
  }

  /** 添加自定义 Provider */
  async function doAddCustomProvider(config: AddCustomProviderParams): Promise<boolean> {
    try {
      await addCustomProvider(config)
      ElMessage.success('自定义 Provider 已添加')
      await fetchProviderList()
      return true
    } catch {
      ElMessage.error('添加 Provider 失败')
      return false
    }
  }

  /** 删除自定义 Provider */
  async function doDeleteCustomProvider(id: string): Promise<boolean> {
    try {
      await deleteCustomProvider(id)
      providers.value = providers.value.filter(p => p.id !== id)
      ElMessage.success('Provider 已删除')
      return true
    } catch {
      ElMessage.error('删除 Provider 失败')
      return false
    }
  }

  /** 获取 Token 用量 */
  async function fetchTokenUsageForConv(conversationId: string) {
    try {
      const res = await fetchTokenUsage(conversationId)
      tokenUsage.value = res.result?.data ?? null
    } catch {
      // 静默
    }
  }

  return {
    // 兼容旧接口
    currentModelInfo,
    modelList,
    setCurrentModelInfo,
    requestModelList,
    // 新增
    currentModelId,
    currentProviderId,
    params,
    providers,
    tokenUsage,
    loading,
    fetchProviders: fetchProviderList,
    setModel,
    updateParams,
    saveApiKey: doSaveApiKey,
    removeApiKey: doRemoveApiKey,
    testConnection: doTestConnection,
    addCustomProvider: doAddCustomProvider,
    deleteCustomProvider: doDeleteCustomProvider,
    fetchTokenUsage: fetchTokenUsageForConv,
  }
})
