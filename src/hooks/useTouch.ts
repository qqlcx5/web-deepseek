import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue';

// ============================================================================
// useTouchSwipe — 触摸左滑手势（用于对话列表操作菜单）
// ============================================================================

export interface SwipeOptions {
  /** 触发左滑的最小距离（px），默认 60 */
  threshold?: number;
  /** 最大可滑动距离（px），默认 120 */
  maxDistance?: number;
  /** 滑动方向：'left' 仅左滑 | 'both' 双向 */
  direction?: 'left' | 'both';
}

export function useTouchSwipe(
  elRef: Ref<HTMLElement | null>,
  options: SwipeOptions = {},
) {
  const { threshold = 60, maxDistance = 120, direction = 'left' } = options;

  const translateX = ref(0);
  const isOpen = ref(false);

  let startX = 0;
  let startY = 0;
  let currentX = 0;

  function onTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    currentX = translateX.value;
  }

  function onTouchMove(e: TouchEvent): void {
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // 垂直滑动优先（不处理）
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (direction === 'left' && dx > 0) return;

    // 限制滑动范围
    const targetX = currentX + dx;
    translateX.value = Math.max(-maxDistance, Math.min(0, targetX));
  }

  function onTouchEnd(): void {
    if (translateX.value < -threshold) {
      translateX.value = -maxDistance;
      isOpen.value = true;
    } else {
      translateX.value = 0;
      isOpen.value = false;
    }
  }

  function reset(): void {
    translateX.value = 0;
    isOpen.value = false;
  }

  onMounted(() => {
    const el = elRef.value;
    if (!el) return;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
  });

  onBeforeUnmount(() => {
    const el = elRef.value;
    if (!el) return;
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
  });

  return { translateX, isOpen, reset };
}

// ============================================================================
// useLongPress — 长按检测（用于消息操作菜单）
// ============================================================================

export interface LongPressOptions {
  /** 触发长按的时长（ms），默认 500 */
  duration?: number;
  /** 移动容差（px），超过此值视为取消 */
  tolerance?: number;
}

export function useLongPress(
  callback: () => void,
  options: LongPressOptions = {},
) {
  const { duration = 500, tolerance = 10 } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let triggered = false;

  function start(e: TouchEvent | MouseEvent): void {
    triggered = false;
    const pos = 'touches' in e ? e.touches[0] : e;
    startX = pos.clientX;
    startY = pos.clientY;

    timer = setTimeout(() => {
      triggered = true;
      callback();
    }, duration);
  }

  function move(e: TouchEvent | MouseEvent): void {
    const pos = 'touches' in e ? e.touches[0] : e;
    const dx = Math.abs(pos.clientX - startX);
    const dy = Math.abs(pos.clientY - startY);

    if (dx > tolerance || dy > tolerance) {
      cancel();
    }
  }

  function cancel(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function end(): void {
    cancel();
  }

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: cancel,
  };
}
