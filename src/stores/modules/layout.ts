import { defineStore } from 'pinia';
import type { Breakpoint } from '@/hooks/useScreen';

// ============================================================================
// 类型定义
// ============================================================================

export type RightPanelContent = 'context' | 'attachments' | null;

export interface LayoutState {
  /** 当前断点 */
  breakpoint: Breakpoint;
  /** 移动端 Drawer 侧边栏是否打开 */
  drawerOpen: boolean;
  /** 桌面端侧边栏是否折叠 */
  sidebarCollapsed: boolean;
  /** 右侧面板是否打开 */
  rightPanelOpen: boolean;
  /** 右侧面板当前内容 */
  rightPanelContent: RightPanelContent;
}

// ============================================================================
// Store 定义
// ============================================================================

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutState => ({
    breakpoint: 'desktop',
    drawerOpen: false,
    sidebarCollapsed: false,
    rightPanelOpen: false,
    rightPanelContent: null,
  }),

  getters: {
    /** 是否为移动端 */
    isMobile(): boolean {
      return this.breakpoint === 'mobile';
    },

    /** 是否为平板 */
    isTablet(): boolean {
      return this.breakpoint === 'tablet';
    },

    /** 是否为桌面端 */
    isDesktop(): boolean {
      return this.breakpoint === 'desktop';
    },
  },

  actions: {
    // ==================== 侧边栏 / Drawer ====================

    /**
     * 切换侧边栏状态。
     * - 移动端：切换 Drawer 开/关
     * - 桌面端/平板：切换侧边栏折叠/展开
     */
    toggleSidebar(): void {
      if (this.breakpoint === 'mobile') {
        this.drawerOpen = !this.drawerOpen;
      } else {
        this.sidebarCollapsed = !this.sidebarCollapsed;
      }
    },

    /** 关闭 Drawer */
    closeDrawer(): void {
      this.drawerOpen = false;
    },

    /** 打开 Drawer */
    openDrawer(): void {
      this.drawerOpen = true;
    },

    // ==================== 右侧面板 ====================

    /**
     * 切换右侧面板。
     * 传入 content 时打开/切换到指定内容；
     * 不传或传入与当前相同内容时关闭面板。
     */
    toggleRightPanel(content?: RightPanelContent): void {
      if (content && this.rightPanelContent !== content) {
        this.rightPanelOpen = true;
        this.rightPanelContent = content;
      } else if (content && this.rightPanelContent === content && this.rightPanelOpen) {
        this.rightPanelOpen = false;
        this.rightPanelContent = null;
      } else if (!content) {
        this.rightPanelOpen = !this.rightPanelOpen;
      }
    },

    /** 关闭右侧面板 */
    closeRightPanel(): void {
      this.rightPanelOpen = false;
      this.rightPanelContent = null;
    },

    // ==================== 断点 ====================

    /** 响应断点变化更新 store */
    setBreakpoint(bp: Breakpoint): void {
      this.breakpoint = bp;

      // 切换到桌面时自动关闭 Drawer
      if (bp !== 'mobile') {
        this.drawerOpen = false;
      }
    },
  },
});
