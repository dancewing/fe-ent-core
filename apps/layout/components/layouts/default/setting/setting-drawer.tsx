import { computed, defineComponent, unref } from 'vue';
import { EntDarkModeToggle, EntDrawer } from 'fe-ent-core';
import { MenuTypeEnum, TriggerEnum } from 'fe-ent-core/es/logics';
import {
  useHeaderSetting,
  useI18n,
  useMenuSetting,
  useMultipleTabSetting,
  useRootSetting,
  useTransitionSetting,
} from 'fe-ent-core/es/hooks';

import { Divider } from 'ant-design-vue';

import { InputNumberItem, SelectItem, SettingFooter, SwitchItem, TypePicker } from './components';

import { baseHandler } from './handler';

import {
  HandlerEnum,
  contentModeOptions,
  getMenuTriggerOptions,
  menuTypeList,
  mixSidebarTriggerOptions,
  routerTransitionOptions,
  topMenuAlignOptions,
} from './enum';

export default defineComponent({
  name: 'SettingDrawer',
  setup(_, { attrs }) {
    const {
      getContentMode,
      getShowFooter,
      getShowBreadCrumb,
      getShowBreadCrumbIcon,
      getShowLogo,
      getFullContent,
      getColorWeak,
      getGrayMode,
      getLockTime,
      getShowDarkModeToggle,
    } = useRootSetting();

    const { getOpenPageLoading, getBasicTransition, getEnableTransition, getOpenNProgress } =
      useTransitionSetting();

    const {
      getIsHorizontal,
      getShowMenu,
      getMenuType,
      getTrigger,
      getCollapsedShowTitle,
      getMenuFixed,
      getCollapsed,
      getCanDrag,
      getTopMenuAlign,
      getAccordion,
      getMenuWidth,
      getIsTopMenu,
      getSplit,
      getIsMixSidebar,
      getCloseMixSidebarOnChange,
      getMixSideTrigger,
      getMixSideFixed,
    } = useMenuSetting();

    const { getShowHeader, getFixed: getHeaderFixed, getShowSearch } = useHeaderSetting();

    const { t } = useI18n();

    const { getShowMultipleTab, getShowQuick, getShowRedo, getShowFold } = useMultipleTabSetting();

    const getShowMenuRef = computed(() => {
      return unref(getShowMenu) && !unref(getIsHorizontal);
    });

    function renderSidebar() {
      const menuTypes = menuTypeList();
      return (
        <>
          <TypePicker
            menuTypeList={menuTypes}
            handler={(item: typeof menuTypes[0]) => {
              baseHandler(HandlerEnum.CHANGE_LAYOUT, {
                mode: item.mode,
                type: item.type,
                split: unref(getIsHorizontal) ? false : undefined,
              });
            }}
            def={unref(getMenuType)}
          />
        </>
      );
    }

    /**
     * @description:
     */
    function renderFeatures() {
      let triggerDef = unref(getTrigger);

      const triggerOptions = getMenuTriggerOptions(unref(getSplit));
      const some = triggerOptions.some((item) => item.value === triggerDef);
      if (!some) {
        triggerDef = TriggerEnum.FOOTER;
      }

      return (
        <>
          <SwitchItem
            title={t('layout.setting.splitMenu')}
            event={HandlerEnum.MENU_SPLIT}
            def={unref(getSplit)}
            disabled={!unref(getShowMenuRef) || unref(getMenuType) !== MenuTypeEnum.MIX}
          />
          <SwitchItem
            title={t('layout.setting.mixSidebarFixed')}
            event={HandlerEnum.MENU_FIXED_MIX_SIDEBAR}
            def={unref(getMixSideFixed)}
            disabled={!unref(getIsMixSidebar)}
          />

          <SwitchItem
            title={t('layout.setting.closeMixSidebarOnChange')}
            event={HandlerEnum.MENU_CLOSE_MIX_SIDEBAR_ON_CHANGE}
            def={unref(getCloseMixSidebarOnChange)}
            disabled={!unref(getIsMixSidebar)}
          />
          <SwitchItem
            title={t('layout.setting.menuCollapse')}
            event={HandlerEnum.MENU_COLLAPSED}
            def={unref(getCollapsed)}
            disabled={!unref(getShowMenuRef)}
          />

          <SwitchItem
            title={t('layout.setting.menuDrag')}
            event={HandlerEnum.MENU_HAS_DRAG}
            def={unref(getCanDrag)}
            disabled={!unref(getShowMenuRef)}
          />
          <SwitchItem
            title={t('layout.setting.menuSearch')}
            event={HandlerEnum.HEADER_SEARCH}
            def={unref(getShowSearch)}
            disabled={!unref(getShowHeader)}
          />
          <SwitchItem
            title={t('layout.setting.menuAccordion')}
            event={HandlerEnum.MENU_ACCORDION}
            def={unref(getAccordion)}
            disabled={!unref(getShowMenuRef)}
          />

          <SwitchItem
            title={t('layout.setting.collapseMenuDisplayName')}
            event={HandlerEnum.MENU_COLLAPSED_SHOW_TITLE}
            def={unref(getCollapsedShowTitle)}
            disabled={!unref(getShowMenuRef) || !unref(getCollapsed) || unref(getIsMixSidebar)}
          />

          <SwitchItem
            title={t('layout.setting.fixedHeader')}
            event={HandlerEnum.HEADER_FIXED}
            def={unref(getHeaderFixed)}
            disabled={!unref(getShowHeader)}
          />
          <SwitchItem
            title={t('layout.setting.fixedSideBar')}
            event={HandlerEnum.MENU_FIXED}
            def={unref(getMenuFixed)}
            disabled={!unref(getShowMenuRef) || unref(getIsMixSidebar)}
          />
          <SelectItem
            title={t('layout.setting.mixSidebarTrigger')}
            event={HandlerEnum.MENU_TRIGGER_MIX_SIDEBAR}
            def={unref(getMixSideTrigger)}
            options={mixSidebarTriggerOptions()}
            disabled={!unref(getIsMixSidebar)}
          />
          <SelectItem
            title={t('layout.setting.topMenuLayout')}
            event={HandlerEnum.MENU_TOP_ALIGN}
            def={unref(getTopMenuAlign)}
            options={topMenuAlignOptions()}
            disabled={
              !unref(getShowHeader) ||
              unref(getSplit) ||
              (!unref(getIsTopMenu) && !unref(getSplit)) ||
              unref(getIsMixSidebar)
            }
          />
          <SelectItem
            title={t('layout.setting.menuCollapseButton')}
            event={HandlerEnum.MENU_TRIGGER}
            def={triggerDef}
            options={triggerOptions}
            disabled={!unref(getShowMenuRef) || unref(getIsMixSidebar)}
          />
          <SelectItem
            title={t('layout.setting.contentMode')}
            event={HandlerEnum.CONTENT_MODE}
            def={unref(getContentMode)}
            options={contentModeOptions()}
          />
          <InputNumberItem
            title={t('layout.setting.autoScreenLock')}
            min={0}
            event={HandlerEnum.LOCK_TIME}
            defaultValue={unref(getLockTime)}
            formatter={(value: string) => {
              return Number.parseInt(value) === 0
                ? `0(${t('layout.setting.notAutoScreenLock')})`
                : `${value}${t('layout.setting.minute')}`;
            }}
          />
          <InputNumberItem
            title={t('layout.setting.expandedMenuWidth')}
            max={600}
            min={100}
            step={10}
            event={HandlerEnum.MENU_WIDTH}
            disabled={!unref(getShowMenuRef)}
            defaultValue={unref(getMenuWidth)}
            formatter={(value: string) => `${Number.parseInt(value)}px`}
          />
        </>
      );
    }

    function renderContent() {
      return (
        <>
          <SwitchItem
            title={t('layout.setting.breadcrumb')}
            event={HandlerEnum.SHOW_BREADCRUMB}
            def={unref(getShowBreadCrumb)}
            disabled={!unref(getShowHeader)}
          />

          <SwitchItem
            title={t('layout.setting.breadcrumbIcon')}
            event={HandlerEnum.SHOW_BREADCRUMB_ICON}
            def={unref(getShowBreadCrumbIcon)}
            disabled={!unref(getShowHeader)}
          />

          <SwitchItem
            title={t('layout.setting.tabs')}
            event={HandlerEnum.TABS_SHOW}
            def={unref(getShowMultipleTab)}
          />

          <SwitchItem
            title={t('layout.setting.tabsRedoBtn')}
            event={HandlerEnum.TABS_SHOW_REDO}
            def={unref(getShowRedo)}
            disabled={!unref(getShowMultipleTab)}
          />

          <SwitchItem
            title={t('layout.setting.tabsQuickBtn')}
            event={HandlerEnum.TABS_SHOW_QUICK}
            def={unref(getShowQuick)}
            disabled={!unref(getShowMultipleTab)}
          />
          <SwitchItem
            title={t('layout.setting.tabsFoldBtn')}
            event={HandlerEnum.TABS_SHOW_FOLD}
            def={unref(getShowFold)}
            disabled={!unref(getShowMultipleTab)}
          />

          <SwitchItem
            title={t('layout.setting.sidebar')}
            event={HandlerEnum.MENU_SHOW_SIDEBAR}
            def={unref(getShowMenu)}
            disabled={unref(getIsHorizontal)}
          />

          <SwitchItem
            title={t('layout.setting.header')}
            event={HandlerEnum.HEADER_SHOW}
            def={unref(getShowHeader)}
          />
          <SwitchItem
            title="Logo"
            event={HandlerEnum.SHOW_LOGO}
            def={unref(getShowLogo)}
            disabled={unref(getIsMixSidebar)}
          />
          <SwitchItem
            title={t('layout.setting.footer')}
            event={HandlerEnum.SHOW_FOOTER}
            def={unref(getShowFooter)}
          />
          <SwitchItem
            title={t('layout.setting.fullContent')}
            event={HandlerEnum.FULL_CONTENT}
            def={unref(getFullContent)}
          />

          <SwitchItem
            title={t('layout.setting.grayMode')}
            event={HandlerEnum.GRAY_MODE}
            def={unref(getGrayMode)}
          />

          <SwitchItem
            title={t('layout.setting.colorWeak')}
            event={HandlerEnum.COLOR_WEAK}
            def={unref(getColorWeak)}
          />
        </>
      );
    }

    function renderTransition() {
      return (
        <>
          <SwitchItem
            title={t('layout.setting.progress')}
            event={HandlerEnum.OPEN_PROGRESS}
            def={unref(getOpenNProgress)}
          />
          <SwitchItem
            title={t('layout.setting.switchLoading')}
            event={HandlerEnum.OPEN_PAGE_LOADING}
            def={unref(getOpenPageLoading)}
          />

          <SwitchItem
            title={t('layout.setting.switchAnimation')}
            event={HandlerEnum.OPEN_ROUTE_TRANSITION}
            def={unref(getEnableTransition)}
          />

          <SelectItem
            title={t('layout.setting.animationType')}
            event={HandlerEnum.ROUTER_TRANSITION}
            def={unref(getBasicTransition)}
            options={routerTransitionOptions}
            disabled={!unref(getEnableTransition)}
          />
        </>
      );
    }

    return () => (
      <EntDrawer
        {...attrs}
        title={t('layout.setting.drawerTitle')}
        width={330}
        class="setting-drawer"
      >
        {unref(getShowDarkModeToggle) && <Divider>{() => t('layout.setting.darkMode')}</Divider>}
        {unref(getShowDarkModeToggle) && <EntDarkModeToggle class="mx-auto" />}
        <Divider>{() => t('layout.setting.navMode')}</Divider>
        {renderSidebar()}
        <Divider>{() => t('layout.setting.interfaceFunction')}</Divider>
        {renderFeatures()}
        <Divider>{() => t('layout.setting.interfaceDisplay')}</Divider>
        {renderContent()}
        <Divider>{() => t('layout.setting.animation')}</Divider>
        {renderTransition()}
        <Divider />
        <SettingFooter />
      </EntDrawer>
    );
  },
});