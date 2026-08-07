import { useBreakpoints } from '@vueuse/core';
import { reactive, ref, onMounted } from 'vue';

// ============================================================================
// 断点定义
// ============================================================================

export const breakpointsEnum = {
  xl: 1600,
  lg: 1199,
  md: 991,
  sm: 767,
  xs: 575,
} as const;

export type BreakpointKey = keyof typeof breakpointsEnum;

// ============================================================================
// 响应式断点类型
// ============================================================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// ============================================================================
// useScreenStore — 兼容现有代码
// ============================================================================

export function useScreenStore() {
  const breakpoints = reactive(useBreakpoints(breakpointsEnum));
  const isMobile = breakpoints.smaller('sm');
  const isPad = breakpoints.between('sm', 'md');
  const isDesktop = breakpoints.greater('md');
  const isScreen = breakpoints.smaller('lg');

  return { breakpoints, isMobile, isPad, isDesktop, isScreen };
}

// ============================================================================
// useBreakpoint — 语义化断点 composable
// ============================================================================

/**
 * 返回当前断点：'mobile' | 'tablet' | 'desktop'
 *
 * 断点规则：
 * - mobile:  < 768px
 * - tablet:   768px ~ 991px
 * - desktop: >= 992px
 *
 * SSR 安全：onMounted 中初始化，hydration 前返回 'desktop'
 */
export function useBreakpoint() {
  const breakpoint = ref<Breakpoint>('desktop');

  onMounted(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqTablet = window.matchMedia('(min-width: 768px) and (max-width: 991px)');

    const update = () => {
      if (mqMobile.matches) {
        breakpoint.value = 'mobile';
      } else if (mqTablet.matches) {
        breakpoint.value = 'tablet';
      } else {
        breakpoint.value = 'desktop';
      }
    };

    update();

    mqMobile.addEventListener('change', update);
    mqTablet.addEventListener('change', update);
  });

  return breakpoint;
}

// ============================================================================
// useIsMobile / useIsTablet — 便捷布尔 composable
// ============================================================================

export function useIsMobile() {
  const bp = useBreakpoint();
  return computed(() => bp.value === 'mobile');
}

export function useIsTablet() {
  const bp = useBreakpoint();
  return computed(() => bp.value === 'tablet');
}
