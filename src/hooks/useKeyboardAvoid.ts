import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * 移动端键盘避让 composable。
 * 使用 visualViewport API 检测键盘弹出/收起，
 * 返回键盘偏移量 offsetY，可用于调整输入框位置。
 */
export function useKeyboardAvoid() {
  const offsetY = ref(0);
  const isKeyboardVisible = ref(false);

  let initialHeight = 0;

  function handleResize(): void {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const diff = initialHeight - viewport.height;
    if (diff > 100) {
      // 键盘弹出
      offsetY.value = diff;
      isKeyboardVisible.value = true;
    } else {
      // 键盘收起
      offsetY.value = 0;
      isKeyboardVisible.value = false;
    }
  }

  onMounted(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    initialHeight = viewport.height;
    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);
  });

  onBeforeUnmount(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    viewport.removeEventListener('resize', handleResize);
    viewport.removeEventListener('scroll', handleResize);
  });

  return { offsetY, isKeyboardVisible };
}
