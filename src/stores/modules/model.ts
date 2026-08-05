import type { GetSessionListVO } from '@/api/model/types';
import { defineStore } from 'pinia';
import { getAiModels } from '@/api/ai';

export const useModelStore = defineStore('model', () => {
  const currentModelInfo = ref<GetSessionListVO>({});
  const modelList = ref<GetSessionListVO[]>([]);
  const setCurrentModelInfo = (modelInfo: GetSessionListVO) => { currentModelInfo.value = modelInfo; };
  const requestModelList = async () => {
    try {
      const models = await getAiModels();
      modelList.value = models.map(model => ({ modelName: model.id, remark: model.owned_by }));
      if (modelList.value.length) {
        const preferred = modelList.value.find(item => item.modelName === import.meta.env.VITE_AI_DEFAULT_MODEL);
        setCurrentModelInfo(preferred || modelList.value[0]);
      }
    }
    catch (error) { console.error('requestModelList错误', error); }
  };
  return { currentModelInfo, setCurrentModelInfo, modelList, requestModelList };
});
