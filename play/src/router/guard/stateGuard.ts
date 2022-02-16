import type { Router } from 'vue-router';
import { useAppStore } from 'fe-ent-core/store/modules/app';
import { useMultipleTabStore } from 'fe-ent-core/store/modules/multipleTab';
import { useUserStore } from 'fe-ent-core/store/modules/user';
import { usePermissionStore } from 'fe-ent-core/store/modules/permission';
import { PageEnum } from 'fe-ent-core/enums/pageEnum';
import { removeTabChangeListener } from 'fe-ent-core/logics/mitt/routeChange';

export function createStateGuard(router: Router) {
  router.afterEach((to) => {
    // Just enter the login page and clear the authentication information
    if (to.path === PageEnum.BASE_LOGIN) {
      const tabStore = useMultipleTabStore();
      const userStore = useUserStore();
      const appStore = useAppStore();
      const permissionStore = usePermissionStore();
      appStore.resetAllState();
      permissionStore.resetState();
      tabStore.resetState();
      userStore.resetState();
      removeTabChangeListener();
    }
  });
}