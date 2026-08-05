<!-- 默认消息列表页 -->
<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { useRouter } from 'vue-router';
import FilesSelect from '@/components/FilesSelect/index.vue';
import ModelSelect from '@/components/ModelSelect/index.vue';
import WelecomeText from '@/components/WelecomeText/index.vue';
import { useFilesStore } from '@/stores/modules/files';

const router = useRouter();
const filesStore = useFilesStore();

const senderValue = ref('');
const senderRef = ref();

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleSend() {
  if (!senderValue.value.trim() && !filesStore.filesList.length)
    return;
  const images = await Promise.all(filesStore.filesList.filter(item => item.file?.type.startsWith('image/')).map(item => fileToDataUrl(item.file)));
  localStorage.setItem('chatPending', JSON.stringify({ text: senderValue.value, images }));
  await router.replace({ name: 'chatWithId', params: { id: crypto.randomUUID() } });
}

function handleDeleteCard(_item: FilesCardProps, index: number) {
  filesStore.deleteFileByIndex(index);
}

watch(
  () => filesStore.filesList.length,
  (val) => {
    if (val > 0) {
      nextTick(() => {
        senderRef.value.openHeader();
      });
    }
    else {
      nextTick(() => {
        senderRef.value.closeHeader();
      });
    }
  },
);
</script>

<template>
  <div class="chat-defaul-wrap">
    <WelecomeText />
    <Sender
      ref="senderRef"
      v-model="senderValue"
      class="chat-defaul-sender"
      :auto-size="{
        maxRows: 9,
        minRows: 3,
      }"
      variant="updown"
      clearable
      allow-speech
      @submit="handleSend"
    >
      <template #header>
        <div class="sender-header p-12px pt-6px pb-0px">
          <Attachments
            :items="filesStore.filesList"
            :hide-upload="true"
            @delete-card="handleDeleteCard"
          >
            <template #prev-button="{ show, onScrollLeft }">
              <div
                v-if="show"
                class="prev-next-btn left-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
                @click="onScrollLeft"
              >
                <el-icon>
                  <ArrowLeftBold />
                </el-icon>
              </div>
            </template>

            <template #next-button="{ show, onScrollRight }">
              <div
                v-if="show"
                class="prev-next-btn right-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
                @click="onScrollRight"
              >
                <el-icon>
                  <ArrowRightBold />
                </el-icon>
              </div>
            </template>
          </Attachments>
        </div>
      </template>
      <template #prefix>
        <div class="flex-1 flex items-center gap-8px flex-none w-fit overflow-hidden">
          <FilesSelect />
          <ModelSelect />
        </div>
      </template>
    </Sender>
  </div>
</template>

<style scoped lang="scss">
.chat-defaul-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  min-height: 450px;
  .chat-defaul-sender {
    width: 100%;
  }
}
</style>
