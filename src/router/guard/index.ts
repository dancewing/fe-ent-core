import { unref } from 'vue';
import { useAppStore } from '../../store/modules/app';
import { useSessionStore } from '../../store/modules/session';
import { useTransitionSetting } from '../../hooks/setting/use-transition-setting';
import { AxiosCanceler } from '../../utils/http/axios-cancel';
import { warn } from '../../utils/log';
import { defaultProjectSetting } from '../../logics/settings/project-setting';
import { useI18n, useMessage } from '../../hooks';
import { createPermissionGuard } from './permission-guard';
import { createStateGuard } from './state-guard';
import { createParamMenuGuard } from './param-menu-guard';
import type { RouteLocationNormalized, Router } from 'vue-router';
import type { Nullable } from '../../types';

// Don't change the order of creation
export function setupRouterGuard(router: Router) {
  createPageGuard(router);
  createPageLoadingGuard(router);
  createHttpGuard(router);
  createScrollGuard(router);
  createMessageGuard(router);
  createProgressGuard(router);
  createSessionGuard(router);
  createPermissionGuard(router);
  createParamMenuGuard(router); // must after createPermissionGuard (menu has been built.)
  createStateGuard(router);
}

/**
 * Hooks for handling page state
 */
export function createPageGuard(router: Router) {
  const loadedPageMap = new Map<string, boolean>();

  router.beforeEach(async (to) => {
    // The page has already been loaded, it will be faster to open it again, you don’t need to do loading and other processing
    to.meta.loaded = !!loadedPageMap.get(to.path);
    // Notify routing changes
    //setRouteChange(to);

    return true;
  });

  router.afterEach((to) => {
    loadedPageMap.set(to.path, true);
  });
}

// Used to handle page loading status
export function createPageLoadingGuard(router: Router) {
  const appStore = useAppStore();
  const { getOpenPageLoading } = useTransitionSetting();
  router.beforeEach(async (to) => {
    const sessionStore = useSessionStore();
    if (!sessionStore.getToken) {
      return true;
    }
    if (to.meta.loaded) {
      return true;
    }

    if (unref(getOpenPageLoading)) {
      appStore.setPageLoadingAction(true);
      return true;
    }

    return true;
  });
  router.afterEach(async () => {
    if (unref(getOpenPageLoading)) {
      // TODO Looking for a better way
      // The timer simulates the loading time to prevent flashing too fast,
      setTimeout(() => {
        appStore.setPageLoading(false);
      }, 220);
    }
    return true;
  });
}

/**
 * The interface used to close the current page to complete the request when the route is switched
 * @param router
 */
export function createHttpGuard(router: Router) {
  const { removeAllHttpPending } = defaultProjectSetting;
  let axiosCanceler: Nullable<AxiosCanceler>;
  if (removeAllHttpPending) {
    axiosCanceler = new AxiosCanceler();
  }
  router.beforeEach(async () => {
    // Switching the route will delete the previous request
    axiosCanceler?.removeAllPending();
    return true;
  });
}

// Routing switch back to the top
export function createScrollGuard(router: Router) {
  const isHash = (href: string) => {
    return href.startsWith('#');
  };

  const body = document.body;

  router.afterEach(async (to) => {
    // scroll top
    isHash((to as RouteLocationNormalized & { href: string })?.href) && body.scrollTo(0, 0);
    return true;
  });
}

/**
 * Used to close the message instance when the route is switched
 * @param router
 */
export function createMessageGuard(router: Router) {
  const { closeMessageOnSwitch } = defaultProjectSetting;

  router.beforeEach(async () => {
    try {
      if (closeMessageOnSwitch) {
        window.$notification?.destroyAll();
        window.$message?.destroyAll();
      }
    } catch (error) {
      warn(`message guard error:${error}`);
    }
    return true;
  });
}

export function createProgressGuard(router: Router) {
  const { getOpenNProgress } = useTransitionSetting();
  router.beforeEach(async (to) => {
    if (to.meta.loaded) {
      return true;
    }
    unref(getOpenNProgress) && window.$loadingBar?.start();
    return true;
  });

  router.afterEach(async () => {
    unref(getOpenNProgress) && window.$loadingBar?.finish();
    return true;
  });
}

export function createSessionGuard(router: Router) {
  router.beforeEach(async () => {
    const sessionStore = useSessionStore();
    try {
      if (!sessionStore.isSessionLoaded) {
        await sessionStore.receiveSession();
      }
    } catch (error) {
      const { createMessage } = useMessage();
      const { t } = useI18n();
      createMessage.info(t('sys.app.sessionLoadingError'), {
        type: 'loading',
        duration: 2,
      });
      warn(`message guard error:${error}`);
      return false;
    }
    return true;
  });
}
