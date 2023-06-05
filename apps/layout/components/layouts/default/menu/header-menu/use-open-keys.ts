import { computed, toRaw, unref } from 'vue';
import { uniq } from 'lodash-es';
import { MenuModeEnum } from 'fe-ent-core/es/logics/enums/menu-enum';
import { useMenuSetting } from 'fe-ent-core/es/hooks/setting/use-menu-setting';
import { getAllParentPath } from 'fe-ent-core/es/router/helper/menu-helper';
import { useTimeoutFn } from 'fe-ent-core/es/hooks/core/use-timeout';
import type { Ref } from 'vue';
import type { MenuState } from './types';
import type { Menu as MenuType } from 'fe-ent-core/es/router/types';

export function useOpenKeys(
  menuState: MenuState,
  menus: Ref<MenuType[]>,
  mode: Ref<MenuModeEnum>,
  accordion: Ref<boolean>,
) {
  const { getCollapsed, getIsMixSidebar } = useMenuSetting();

  async function setOpenKeys(path: string) {
    if (mode.value === MenuModeEnum.HORIZONTAL) {
      return;
    }
    const native = unref(getIsMixSidebar);
    const handle = () => {
      const menuList = toRaw(menus.value);
      if (menuList?.length === 0) {
        menuState.openKeys = [];
        return;
      }
      if (!unref(accordion)) {
        menuState.openKeys = uniq([...menuState.openKeys, ...getAllParentPath(menuList, path)]);
      } else {
        menuState.openKeys = getAllParentPath(menuList, path);
      }
    };
    if (native) {
      handle();
    } else {
      useTimeoutFn(handle, 16);
    }
  }

  const getOpenKeys = computed(() => {
    const collapse = unref(getIsMixSidebar) ? false : unref(getCollapsed);

    return collapse ? menuState.collapsedOpenKeys : menuState.openKeys;
  });

  /**
   * @description:  重置值
   */
  function resetKeys() {
    menuState.selectedKeys = [];
    menuState.openKeys = [];
  }

  function handleOpenChange(openKeys: string[]) {
    if (unref(mode) === MenuModeEnum.HORIZONTAL || !unref(accordion) || unref(getIsMixSidebar)) {
      menuState.openKeys = openKeys;
    } else {
      // const menuList = toRaw(menus.value);
      // getAllParentPath(menuList, path);
      const rootSubMenuKeys: string[] = [];
      for (const { children, path } of unref(menus)) {
        if (children && children.length > 0) {
          rootSubMenuKeys.push(path);
        }
      }
      if (!unref(getCollapsed)) {
        const latestOpenKey = openKeys.find((key) => !menuState.openKeys.includes(key));
        if (!rootSubMenuKeys.includes(latestOpenKey as string)) {
          menuState.openKeys = openKeys;
        } else {
          menuState.openKeys = latestOpenKey ? [latestOpenKey] : [];
        }
      } else {
        menuState.collapsedOpenKeys = openKeys;
      }
    }
  }
  return { setOpenKeys, resetKeys, getOpenKeys, handleOpenChange };
}
