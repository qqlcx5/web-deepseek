<script setup lang="ts">
import type { BubbleProps } from 'vue-element-plus-x/types/Bubble';
import type { BubbleListInstance } from 'vue-element-plus-x/types/BubbleList';
import type { ThinkingStatus } from 'vue-element-plus-x/types/Thinking';
import type { AiMessage } from '@/api/ai';
import { ElMessage } from 'element-plus';
import { Sender } from 'vue-element-plus-x';
import { useRoute } from 'vue-router';
import { streamAiChat } from '@/api/ai';
import FilesSelect from '@/components/FilesSelect/index.vue';
import ModelSelect from '@/components/ModelSelect/index.vue';
import { useChatStore } from '@/stores/modules/chat';
import { useFilesStore } from '@/stores/modules/files';
import { useModelStore } from '@/stores/modules/model';
import { useUserStore } from '@/stores/modules/user';

type MessageItem = BubbleProps & { key: number; role: 'ai' | 'user' | 'system'; avatar: string; reasoning_content?: string; thinlCollapse?: boolean; thinkingStatus?: ThinkingStatus; apiContent?: AiMessage['content']; imageUrls?: string[] };
const route = useRoute();
const chatStore = useChatStore();
const modelStore = useModelStore();
const filesStore = useFilesStore();
const userStore = useUserStore();
const inputValue = ref('');
const isLoading = ref(false);
const bubbleItems = ref<MessageItem[]>([]);
const bubbleListRef = ref<BubbleListInstance | null>(null);
const senderRef = ref<InstanceType<typeof Sender> | null>(null);
const avatar = computed(() => userStore.userInfo?.avatar || 'https://avatars.githubusercontent.com/u/76239030?v=4');
let controller: AbortController | null = null;
let thinking = false;

watch(() => route.params.id, async id => {
  if (!id) return;
  if (id !== 'not_login') {
    await chatStore.requestChatList(String(id));
    bubbleItems.value = (chatStore.chatMap[String(id)] || []) as MessageItem[];
  }
  const pending = localStorage.getItem('chatPending');
  if (pending) {
    const data = JSON.parse(pending) as { text?: string; images?: string[] };
    localStorage.removeItem('chatPending');
    setTimeout(() => startSSE(data.text || '', data.images || []), 350);
  }
}, { immediate: true });

function consume(delta: any) {
  const last = bubbleItems.value[bubbleItems.value.length - 1];
  if (!last) return;
  if (delta.reasoning_content) {
    last.reasoning_content = `${last.reasoning_content || ''}${delta.reasoning_content}`;
    last.thinkingStatus = 'thinking'; last.thinlCollapse = true; last.loading = true;
  }
  if (!delta.content) return;
  const text = String(delta.content);
  if (text.includes('<think>')) thinking = true;
  if (text.includes('</think>')) thinking = false;
  if (thinking) {
    last.reasoning_content = `${last.reasoning_content || ''}${text.replace('<think>', '').replace('</think>', '')}`;
    last.thinkingStatus = 'thinking';
  }
  else {
    last.content = `${last.content || ''}${text}`;
    last.thinkingStatus = 'end'; last.loading = false;
  }
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
}
async function handleSubmit(value?: string) {
  const text = typeof value === 'string' ? value : inputValue.value;
  if (isLoading.value) return;
  try {
    const images = await Promise.all(filesStore.filesList.filter(item => item.file?.type.startsWith('image/')).map(item => fileToDataUrl(item.file)));
    if (images.length) filesStore.setFilesList([]);
    await startSSE(text, images);
  }
  catch (error) { ElMessage.error((error as Error).message || '发送消息失败'); }
}
async function startSSE(text = '', images: string[] = []) {
  if (isLoading.value || (!text.trim() && !images.length)) return;
  isLoading.value = true; thinking = false;
  if (!modelStore.currentModelInfo.modelName) await modelStore.requestModelList();
  const model = modelStore.currentModelInfo.modelName;
  if (!model) { ElMessage.error('模型加载失败，请检查模型服务配置'); isLoading.value = false; return; }
  controller = new AbortController();
  try {
    inputValue.value = '';
    addMessage(text, true, images); addMessage('', false);
    const messages: AiMessage[] = bubbleItems.value.filter(item => (item.role === 'user' || item.role === 'system') && (item.apiContent || item.content)).map(item => ({ role: item.role === 'system' ? 'assistant' : 'user', content: item.apiContent || item.content || '' }));
    for await (const delta of streamAiChat(messages, model, controller.signal)) consume(delta);
  }
  catch (error) {
    if ((error as Error).name !== 'AbortError') { ElMessage.error((error as Error).message || '对话请求失败'); const last = bubbleItems.value[bubbleItems.value.length - 1]; if (last?.role === 'system' && !last.content) bubbleItems.value.pop(); }
  }
  finally { isLoading.value = false; controller = null; const last = bubbleItems.value[bubbleItems.value.length - 1]; if (last) { last.loading = false; last.typing = false; last.thinkingStatus = 'end'; } }
}
function cancelSSE() { controller?.abort(); }
function addMessage(text: string, isUser: boolean, images: string[] = []) {
  const apiContent: AiMessage['content'] = images.length ? [...(text ? [{ type: 'text' as const, text }] : []), ...images.map(url => ({ type: 'image_url' as const, image_url: { url } }))] : text;
  bubbleItems.value.push({ key: bubbleItems.value.length, avatar: isUser ? avatar.value : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', avatarSize: '32px', role: isUser ? 'user' : 'system', placement: isUser ? 'end' : 'start', isMarkdown: !isUser, loading: !isUser, content: text, apiContent, imageUrls: images, reasoning_content: '', thinkingStatus: 'start', thinlCollapse: false, noStyle: !isUser });
}
function deleteFile(_item: any, index: number) { filesStore.deleteFileByIndex(index); }
</script>
<template>
  <div class="chat-with-id-container"><div class="chat-warp">
    <BubbleList ref="bubbleListRef" :list="bubbleItems" max-height="calc(100vh - 240px)">
      <template #header="{ item }"><Thinking v-if="item.reasoning_content" v-model="item.thinlCollapse" :content="item.reasoning_content" :status="item.thinkingStatus" /></template>
      <template #content="{ item }"><XMarkdown v-if="item.content && item.role === 'system'" :markdown="item.content" class="markdown-body" /><div v-if="item.role === 'user'" class="user-content"><img v-for="url in item.imageUrls" :key="url" :src="url" class="message-image" alt="上传图片"><div v-if="item.content">{{ item.content }}</div></div></template>
    </BubbleList>
    <Sender ref="senderRef" v-model="inputValue" class="chat-defaul-sender" :auto-size="{ maxRows: 6, minRows: 2 }" variant="updown" clearable allow-speech :loading="isLoading" @submit="handleSubmit" @cancel="cancelSSE">
      <template #header><div class="sender-header p-12px pt-6px pb-0px"><Attachments :items="filesStore.filesList" :hide-upload="true" @delete-card="deleteFile" /></div></template>
      <template #prefix><div class="flex-1 flex items-center gap-8px flex-none w-fit overflow-hidden"><FilesSelect /><ModelSelect /></div></template>
    </Sender>
  </div></div>
</template>
<style scoped lang="scss">
.chat-with-id-container { position: relative; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 800px; height: 100%; .chat-warp { display: flex; flex-direction: column; justify-content: space-between; width: 100%; height: calc(100vh - 60px); } .chat-defaul-sender { width: 100%; margin-bottom: 22px; } :deep(.el-bubble) { padding: 0 12px 24px; } :deep(.user-content) { white-space: pre-wrap; } :deep(.message-image) { display: block; max-width: 240px; max-height: 240px; margin-bottom: 8px; border-radius: 8px; object-fit: contain; } :deep(.markdown-body) { background: transparent; } }
</style>
