import { useAppStoreWithOut } from '@ent-core/store/modules/app';
import { usePermissionStore } from '@ent-core/store/modules/permission';
import { getAllParentPath, transformMenuModule } from '@ent-core/router/helper/menu-helper';
import { filter } from '@ent-core/utils/helper/tree-helper';
import { isUrl } from '@ent-core/utils/is';
import { useEntRouter } from '@ent-core/router/base';
import { PermissionModeEnum } from '@ent-core/logics/enums/app-enum';
import { pathToRegexp } from 'path-to-regexp';
import type { RouteRecordNormalized } from 'vue-router';
import type { Menu } from '@ent-core/router/types';

export const importMenuModules = (modules: Record<string, { [key: string]: any }>) => {
  const permissionStore = usePermissionStore();
  permissionStore.importMenuModules(modules);
};

// ===========================
// ==========Helper===========
// ===========================

const getPermissionMode = () => {
  const appStore = useAppStoreWithOut();
  return appStore.getProjectConfig.permissionMode;
};
const isBackMode = () => {
  return getPermissionMode() === PermissionModeEnum.BACK;
};

const isRouteMappingMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROUTE_MAPPING;
};

const isRoleMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROLE;
};

const getStaticMenus = (): Menu[] => {
  const permissionStore = usePermissionStore();
  const menuModules = permissionStore.getMenuModules;
  const staticMenus: Menu[] = [];
  menuModules.sort((a, b) => {
    return (b.orderNo || 0) - (a.orderNo || 0);
  });

  for (const menu of menuModules) {
    staticMenus.push(transformMenuModule(menu));
  }
  return staticMenus;
};

function getAsyncMenus() {
  const permissionStore = usePermissionStore();
  //递归过滤所有隐藏的菜单
  const menuFilter = (items) => {
    return items.filter((item) => {
      const show = !item.meta?.hideMenu && !item.hideMenu;
      if (show && item.children) {
        item.children = menuFilter(item.children);
      }
      return show;
    });
  };
  if (isBackMode()) {
    return menuFilter(permissionStore.getBackMenuList);
  }
  if (isRouteMappingMode()) {
    return menuFilter(permissionStore.getFrontMenuList);
  }
  return getStaticMenus();
}

export const getMenus = async (): Promise<Menu[]> => {
  const menus = getAsyncMenus();
  if (isRoleMode()) {
    const entRouter = useEntRouter();
    const routes = entRouter.getRoutes();
    return filter(menus, basicFilter(routes));
  }
  return menus;
};

export function getCurrentParentPath(currentPath: string) {
  const menus = getAsyncMenus();
  const allParentPath = getAllParentPath(menus, currentPath);
  return allParentPath?.[0];
}

// Get the level 1 menu, delete children
export async function getShallowMenus(): Promise<Menu[]> {
  const menus = await getAsyncMenus();
  const shallowMenuList = menus.map((item) => ({ ...item, children: undefined }));
  if (isRoleMode()) {
    const entRouter = useEntRouter();
    const routes = entRouter.getRoutes();
    return shallowMenuList.filter(basicFilter(routes));
  }
  return shallowMenuList;
}

// Get the children of the menu
export async function getChildrenMenus(parentPath: string) {
  const menus = await getMenus();
  const parent = menus.find((item) => item.path === parentPath);
  if (!parent || !parent.children || !!parent?.meta?.hideChildrenInMenu) {
    return [] as Menu[];
  }
  if (isRoleMode()) {
    const entRouter = useEntRouter();
    const routes = entRouter.getRoutes();
    return filter(parent.children, basicFilter(routes));
  }
  return parent.children;
}

function basicFilter(routes: RouteRecordNormalized[]) {
  return (menu: Menu) => {
    const matchRoute = routes.find((route) => {
      if (isUrl(menu.path)) return true;

      if (route.meta?.carryParam) {
        return pathToRegexp(route.path).test(menu.path);
      }
      const isSame = route.path === menu.path;
      if (!isSame) return false;

      if (route.meta?.ignoreAuth) return true;

      return isSame || pathToRegexp(route.path).test(menu.path);
    });

    if (!matchRoute) return false;
    menu.icon = (menu.icon || matchRoute.meta.icon) as string;
    menu.meta = matchRoute.meta;
    return true;
  };
}
