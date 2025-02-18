<template>
  <NLayoutHeader :class="getHeaderClass">
    <!-- left start -->
    <div :class="`${prefixCls}-left`">
      <!-- logo -->
      <EntAppLogo
        v-if="getShowHeaderLogo || getIsMobile"
        :show-title="getShowTitle"
        :class="`${prefixCls}-logo`"
        :style="getLogoWidth"
      />
      <LayoutTrigger
        v-if="
          (getShowContent && getShowHeaderTrigger && !getSplit && !getIsMixSidebar) || getIsMobile
        "
        :theme="getActualHeaderTheme"
        :sider="false"
      />
      <LayoutBreadcrumb v-if="getShowContent && getShowBread" :theme="getActualHeaderTheme" />
    </div>
    <!-- left end -->

    <!-- menu start -->
    <div v-if="getShowTopMenu && !getIsMobile" :class="`${prefixCls}-menu`">
      <LayoutMenu :is-horizontal="true" :split-type="getSplitType" :menu-mode="getMenuMode" />
    </div>
    <!-- menu-end -->

    <!-- action  -->
    <div :class="`${prefixCls}-action`">
      <AppSearch v-if="getShowSearch" :class="`${prefixCls}-action__item `" />

      <ErrorAction v-if="getUseErrorHandle" :class="`${prefixCls}-action__item error-action`" />

      <Notify v-if="getShowNotice" :class="`${prefixCls}-action__item notify-item`" />

      <FullScreen v-if="getShowFullScreen" :class="`${prefixCls}-action__item fullscreen-item`" />

      <EntLocalePicker
        v-if="getShowLocalePicker"
        :reload="true"
        :show-text="false"
        :class="`${prefixCls}-action__item`"
      />

      <EntDarkModeToggle
        v-if="getShowDarkModeToggle"
        :class="`${prefixCls}-action__item mx-auto`"
      />

      <UserDropDown v-if="isLogined" :theme="getActualHeaderTheme" />

      <SettingDrawer v-if="getShowSetting" :class="`${prefixCls}-action__item`" />
    </div>
  </NLayoutHeader>
</template>
<script lang="ts">
  import { computed, defineComponent, unref } from 'vue';
  import { useAppInject, useDesign, useRootSetting } from 'fe-ent-core/es/hooks';
  import { EntAppLogo, EntDarkModeToggle, EntLocalePicker } from 'fe-ent-core';
  import { MenuModeEnum, MenuSplitTyeEnum, SettingButtonPositionEnum } from 'fe-ent-core/es/logics';
  import { useLocale } from 'fe-ent-core/es/locales';
  import { useUserStore } from 'fe-ent-core/es/store';
  import { NLayoutHeader } from 'naive-ui';

  import {
    useHeaderSetting,
    useLayoutTheme,
    useLayoutThemeSetting,
    useMenuSetting
  } from '../../../../hooks';

  import AppSearch from '../components/app-search.vue';
  import LayoutTrigger from '../trigger/index.vue';
  import LayoutMenu from '../menu/index.vue';
  import SettingDrawer from '../setting/index.vue';
  import { ErrorAction, FullScreen, LayoutBreadcrumb, Notify, UserDropDown } from './components';

  export default defineComponent({
    name: 'LayoutHeader',
    components: {
      NLayoutHeader,
      EntAppLogo,
      LayoutTrigger,
      LayoutBreadcrumb,
      LayoutMenu,
      UserDropDown,
      EntLocalePicker,
      FullScreen,
      Notify,
      AppSearch,
      ErrorAction,
      SettingDrawer,
      EntDarkModeToggle
    },
    props: {
      fixed: {
        type: Boolean,
        default: false
      }
    },
    setup(props) {
      const { prefixCls } = useDesign('layout-header');
      const {
        getShowTopMenu,
        getShowHeaderTrigger,
        getSplit,
        getIsMixMode,
        getMenuWidth,
        getIsMixSidebar,
        getCollapsedShowTitle,
        getCollapsed
      } = useMenuSetting();
      const { getShowDarkModeToggle, getUseErrorHandle } = useRootSetting();

      const { getShowSettingButton, getSettingButtonPosition } = useLayoutThemeSetting();

      const {
        getShowFullScreen,
        getShowNotice,
        getShowContent,
        getShowBread,
        getShowHeaderLogo,
        getShowHeader,
        getShowSearch
      } = useHeaderSetting();

      const { getActualHeaderTheme } = useLayoutTheme();

      const { getShowLocalePicker } = useLocale();
      const userStore = useUserStore();
      const { getIsMobile } = useAppInject();

      const getHeaderClass = computed(() => {
        const theme = unref(getActualHeaderTheme);
        return [
          prefixCls,
          {
            [`${prefixCls}--fixed`]: props.fixed,
            [`${prefixCls}--mobile`]: unref(getIsMobile),
            [`${prefixCls}--${theme}`]: theme
          }
        ];
      });

      const getShowSetting = computed(() => {
        if (!unref(getShowSettingButton)) {
          return false;
        }
        const settingButtonPosition = unref(getSettingButtonPosition);

        if (settingButtonPosition === SettingButtonPositionEnum.AUTO) {
          return unref(getShowHeader);
        }
        return settingButtonPosition === SettingButtonPositionEnum.HEADER;
      });

      const getLogoWidth = computed(() => {
        if (!unref(getIsMixMode) || unref(getIsMobile)) {
          return {};
        }
        const width = unref(getMenuWidth) < 180 ? 180 : unref(getMenuWidth);
        return { width: `${width}px` };
      });

      const getSplitType = computed(() => {
        return unref(getSplit) ? MenuSplitTyeEnum.TOP : MenuSplitTyeEnum.NONE;
      });

      const getShowTitle = computed(() => {
        if (!unref(getCollapsed)) {
          return true;
        }
        return unref(getCollapsed) && unref(getCollapsedShowTitle);
      });

      const getMenuMode = computed(() => {
        return unref(getSplit) ? MenuModeEnum.HORIZONTAL : null;
      });

      const isLogined = userStore.getUserInfo !== undefined && userStore.getUserInfo !== null;

      return {
        prefixCls,
        getHeaderClass,
        getShowHeaderLogo,
        getShowHeaderTrigger,
        getShowDarkModeToggle,
        getActualHeaderTheme,
        getIsMobile,
        getShowBread,
        getShowContent,
        getSplitType,
        getSplit,
        getMenuMode,
        getShowTopMenu,
        getShowLocalePicker,
        getShowFullScreen,
        getShowNotice,
        getUseErrorHandle,
        getLogoWidth,
        getIsMixSidebar,
        getShowSettingButton,
        getShowSetting,
        getShowSearch,
        isLogined,
        getCollapsedShowTitle,
        getShowTitle
      };
    }
  });
</script>
