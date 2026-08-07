/**
 * 系统状态 Store（Pinia）
 *
 * 管理全局 Toast 通知、确认对话框、全局错误状态。
 * Toast 内部调用 Element Plus ElMessage/ElNotification，
 * 确认对话框内部调用 ElMessageBox。
 */

import { defineStore } from 'pinia';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';

// ============================================================================
// 类型定义
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export interface ConfirmDialogOptions {
  type: 'info' | 'danger';
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  closeOnClickModal?: boolean;
}

// ============================================================================
// Store 定义
// ============================================================================

let _toastIdCounter = 0;
function genToastId(): string {
  return `toast-${++_toastIdCounter}`;
}

let _confirmIdCounter = 0;
function genConfirmId(): string {
  return `confirm-${++_confirmIdCounter}`;
}

export const useSystemStore = defineStore('system', {
  // --------------------------------------------------------------------------
  // 状态
  // --------------------------------------------------------------------------

  state: () => ({
    /** 活跃的 Toast 列表 */
    toasts: [] as Toast[],
    /** 当前活跃的确认对话框 ID */
    activeConfirmId: null as string | null,
    /** 全局错误 */
    globalError: null as Error | null,
  }),

  // --------------------------------------------------------------------------
  // 动作
  // --------------------------------------------------------------------------

  actions: {
    // ==================== Toast ====================

    /**
     * 显示 Toast 通知。
     * 简单提示用 ElMessage，带操作按钮用 ElNotification。
     */
    showToast(toast: Omit<Toast, 'id'>): string {
      const id = genToastId();
      const duration = toast.duration ?? 3000;

      this.toasts.push({ ...toast, id });

      if (toast.action) {
        // 带操作按钮 → ElNotification
        const instance = ElNotification({
          title: toast.title,
          message: toast.description ?? '',
          type: toast.type,
          duration,
          onClose: () => this.dismissToast(id),
        });
        // 操作按钮通过自定义消息段区分，这里暂不支持内联 action 按钮
        // ElNotification 原生的 onClick 可作为兜底
      } else {
        // 纯消息 → ElMessage
        ElMessage({
          message: toast.title,
          type: toast.type,
          duration,
          onClose: () => this.dismissToast(id),
        });
      }

      return id;
    },

    /**
     * 手动关闭指定 Toast。
     */
    dismissToast(id: string): void {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },

    // ==================== 确认对话框 ====================

    /**
     * 弹出确认对话框，返回 Promise<boolean>。
     * 用户点击"确认"返回 true，点击"取消"或关闭返回 false。
     */
    async showConfirm(dialog: ConfirmDialogOptions): Promise<boolean> {
      const id = genConfirmId();
      this.activeConfirmId = id;

      try {
        await ElMessageBox.confirm(dialog.description, dialog.title, {
          confirmButtonText: dialog.confirmText ?? '确认',
          cancelButtonText: dialog.cancelText ?? '取消',
          type: dialog.type === 'danger' ? 'error' : 'info',
          closeOnClickModal: dialog.closeOnClickModal ?? true,
          distinguishCancelAndClose: true,
        });
        return true;
      } catch (action: unknown) {
        // 'cancel' = 点击取消, 'close' = 点击遮罩/关闭按钮
        if (action === 'cancel' || action === 'close') {
          return false;
        }
        // 其他异常也视为取消
        return false;
      } finally {
        if (this.activeConfirmId === id) {
          this.activeConfirmId = null;
        }
      }
    },

    /**
     * 手动关闭确认对话框。
     */
    closeConfirm(): void {
      this.activeConfirmId = null;
    },

    // ==================== 全局错误 ====================

    /**
     * 设置全局错误状态。
     */
    setGlobalError(error: Error): void {
      this.globalError = error;
      console.error('[SystemStore] 全局错误：', error);
    },

    /**
     * 清除全局错误状态。
     */
    clearGlobalError(): void {
      this.globalError = null;
    },
  },
});
