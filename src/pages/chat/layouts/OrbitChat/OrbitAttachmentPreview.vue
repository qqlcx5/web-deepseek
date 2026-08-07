<!--
  Orbita AI 附件预览 & 图片灯箱
  支持：大图灯箱模式（暗色遮罩 + 居中大图 + 左右切换 + Esc/箭头键）
-->
<script setup lang="ts">
import type { OrbitState } from './useOrbitState';
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{ state: OrbitState }>();
const { state } = props;

const preview = computed(() => state.attachmentPreview.value);
const hasMultiple = computed(() => preview.files && preview.files.length > 1);

function onKeyDown(e: KeyboardEvent) {
  if (!preview.open) return;
  if (e.key === 'Escape') state.closePreview();
  if (e.key === 'ArrowRight') state.nextPreview();
  if (e.key === 'ArrowLeft') state.prevPreview();
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

function isImage(file: { type?: string }) {
  return file.type?.startsWith('image/');
}

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('orbit-lightbox-backdrop')) {
    state.closePreview();
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="preview.open"
      class="orbit-lightbox-backdrop"
      @click="onBackdropClick"
      @keydown="onKeyDown"
    >
      <div class="orbit-lightbox">
        <!-- 关闭按钮 -->
        <button class="orbit-lightbox-close" @click="state.closePreview()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <!-- 左箭头 -->
        <button
          v-if="hasMultiple"
          class="orbit-lightbox-arrow orbit-lightbox-arrow-left"
          @click.stop="state.prevPreview()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <!-- 内容区 -->
        <div class="orbit-lightbox-content">
          <template v-if="preview.files.length">
            <template v-if="isImage(preview.files[preview.index])">
              <img
                :src="preview.files[preview.index].dataUrl"
                :alt="preview.files[preview.index].name"
              />
            </template>
            <template v-else>
              <div class="orbit-lightbox-file-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
                <div class="orbit-lightbox-filename">{{ preview.files[preview.index].name }}</div>
                <div class="orbit-lightbox-filesize">
                  {{ preview.files[preview.index].size ? `${(preview.files[preview.index].size / 1024).toFixed(1)} KB` : '' }}
                </div>
                <div class="orbit-lightbox-filetype">{{ preview.files[preview.index].type || '未知类型' }}</div>
              </div>
            </template>
          </template>
        </div>

        <!-- 右箭头 -->
        <button
          v-if="hasMultiple"
          class="orbit-lightbox-arrow orbit-lightbox-arrow-right"
          @click.stop="state.nextPreview()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <!-- 计数器 -->
        <div v-if="hasMultiple" class="orbit-lightbox-counter">
          {{ preview.index + 1 }} / {{ preview.files.length }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.orbit-lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(10px);
}

.orbit-lightbox {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.orbit-lightbox-close {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.24);
  }
  svg {
    width: 18px;
    height: 18px;
  }
}

.orbit-lightbox-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.24);
  }
  svg {
    width: 20px;
    height: 20px;
  }
}
.orbit-lightbox-arrow-left {
  left: 18px;
}
.orbit-lightbox-arrow-right {
  right: 18px;
}

.orbit-lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90%;
  max-height: 85%;

  img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 6px;
  }
}

.orbit-lightbox-file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-align: center;

  svg {
    width: 64px;
    height: 64px;
    opacity: 0.6;
  }
}
.orbit-lightbox-filename {
  font-size: 18px;
  font-weight: 600;
}
.orbit-lightbox-filesize {
  font-size: 13px;
  opacity: 0.7;
}
.orbit-lightbox-filetype {
  font-size: 11px;
  opacity: 0.5;
  text-transform: uppercase;
}

.orbit-lightbox-counter {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 99px;
}
</style>
