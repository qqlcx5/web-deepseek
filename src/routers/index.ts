import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useNProgress } from '@vueuse/integrations/useNProgress';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTER_WHITE_LIST } from '@/config';
import { errorRouter, layoutRouter, staticRouter } from '@/routers/modules/staticRouter';
import { chatRouter } from '@/routers/modules/chat';
import { useUserStore, useWorkspaceStore } from '@/stores';
import { ElMessage } from 'element-plus';

const { start, done } = useNProgress(0, {
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
});

const router = createRouter({
  history: createWebHistory(),
  routes: [...chatRouter, ...layoutRouter, ...staticRouter, ...errorRouter],
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// ---- 路由守卫 ----

/**
 * authGuard — 登录状态检查
 * 未登录重定向 /login，白名单路径放行
 */
function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some((r) => r.meta.auth === true);

  if (requiresAuth && !userStore.token) {
    ElMessage.warning('请先登录');
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  next();
}

/**
 * workspaceGuard — 工作区存在性校验
 * 确保 URL 中的 workspaceId 在 store 中存在
 */
function workspaceGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const workspaceStore = useWorkspaceStore();
  const workspaceId = to.params.workspaceId as string | undefined;

  if (!workspaceId) return next();

  // 如果 workspace store 已加载且不包含此 ID，回退到默认
  if (workspaceStore.workspaces.length > 0 && !workspaceStore.workspaces.find((w) => w.id === workspaceId)) {
    ElMessage.warning('工作区不存在，已跳转到默认工作区');
    return next({ path: '/chat' });
  }
  next();
}

/**
 * adminGuard — 管理员权限检查
 * 检查用户 role === 'admin'
 */
function adminGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const userStore = useUserStore();
  const requiresAdmin = to.matched.some((r) => r.meta.admin === true);

  if (requiresAdmin && userStore.role !== 'admin') {
    ElMessage.warning('无权访问管理后台');
    return next('/chat');
  }
  next();
}

// 路由前置守卫
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const userStore = useUserStore();

    // 1、NProgress 开始
    start();

    // 2、标题
    document.title = (to.meta.title as string) || (import.meta.env.VITE_WEB_TITLE as string);

    // 3、路由守卫链
    authGuard(to, from, (authNextArg) => {
      if (authNextArg === false || (typeof authNextArg === 'object' && authNextArg !== to)) {
        return next(authNextArg);
      }

      workspaceGuard(to, from, (wsNextArg) => {
        if (wsNextArg === false || (typeof wsNextArg === 'object' && wsNextArg !== to)) {
          return next(wsNextArg);
        }

        adminGuard(to, from, (adminNextArg) => {
          return next(adminNextArg);
        });
      });
    });
  },
);

// 路由跳转错误
router.onError((error) => {
  // 结束全屏动画
  done();
  console.warn('路由错误', error.message);
});

// 后置路由
router.afterEach(() => {
  // 结束全屏动画
  done();
});

export default router;
