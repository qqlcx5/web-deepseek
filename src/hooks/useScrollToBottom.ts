import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

/**
 * 触底检测 composable。
 * 使用 IntersectionObserver 监听哨兵元素，当哨兵进入视口时触发回调。
 */
export function useScrollToBottom(
  callback: () => void,
  options: {
    /** 提前触发的距离（px），默认 100 */
    threshold?: number;
    /** 是否启用，默认 true */
    enabled?: Ref<boolean>;
  } = {},
) {
  const { threshold = 100, enabled = ref(true) } = options;

  const sentinelRef = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!sentinelRef.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (!enabled.value) return;
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          callback();
        }
      },
      {
        rootMargin: `${threshold}px`,
      },
    );

    observer.observe(sentinelRef.value);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { sentinelRef };
}
