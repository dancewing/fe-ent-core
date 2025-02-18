<template>
  <ent-page-wrapper content-background title="按钮权限控制" content-class="p-4">
    <CurrentPermissionMode />
    <p>
      当前拥有的code列表: <a> {{ permissionStore.getPermCodeList }} </a>
    </p>
    <Divider />
    <Alert
      class="mt-4"
      type="info"
      message="点击后请查看按钮变化(必须处于后台权限模式才可测试此页面所展示的功能)"
      show-icon
    />
    <Divider />
    <ent-button
      type="primary"
      class="mr-2"
      :disabled="!isBackPremissionMode"
      @click="switchToken(2)"
    >
      点击切换按钮权限(用户id为2)
    </ent-button>
    <ent-button type="primary" :disabled="!isBackPremissionMode" @click="switchToken(1)">
      点击切换按钮权限(用户id为1,默认)
    </ent-button>

    <template v-if="isBackPremissionMode">
      <Divider>组件方式判断权限</Divider>
      <ent-authority :value="'1000'">
        <ent-button type="primary" class="mx-4"> 拥有code ['1000']权限可见 </ent-button>
      </ent-authority>

      <ent-authority :value="'2000'">
        <ent-button type="success" class="mx-4"> 拥有code ['2000']权限可见 </ent-button>
      </ent-authority>

      <ent-authority :value="['1000', '2000']">
        <ent-button type="error" class="mx-4"> 拥有code ['1000','2000']角色权限可见 </ent-button>
      </ent-authority>

      <Divider>函数方式方式判断权限</Divider>
      <ent-button v-if="hasPermission('1000')" type="primary" class="mx-4">
        拥有code ['1000']权限可见
      </ent-button>

      <ent-button v-if="hasPermission('2000')" type="success" class="mx-4">
        拥有code ['2000']权限可见
      </ent-button>

      <ent-button v-if="hasPermission(['1000', '2000'])" type="error" class="mx-4">
        拥有code ['1000','2000']角色权限可见
      </ent-button>

      <Divider>指令方式方式判断权限(该方式不能动态修改权限.)</Divider>
      <ent-button v-auth="'1000'" type="primary" class="mx-4">
        拥有code ['1000']权限可见
      </ent-button>

      <ent-button v-auth="'2000'" type="success" class="mx-4">
        拥有code ['2000']权限可见
      </ent-button>

      <ent-button v-auth="['1000', '2000']" color="error" class="mx-4">
        拥有code ['1000','2000']角色权限可见
      </ent-button>
    </template>
  </ent-page-wrapper>
</template>
<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Alert, Divider } from 'ant-design-vue';
  import { PermissionModeEnum } from 'fe-ent-core/es/logics/enums';
  import { useAppStore, usePermissionStore, useUserStore } from 'fe-ent-core/es/store';
  import { usePermission } from 'fe-ent-core/es/hooks';
  import CurrentPermissionMode from '../current-permission-mode.vue';

  export default defineComponent({
    components: { Alert, CurrentPermissionMode, Divider },
    setup() {
      const { hasPermission } = usePermission();
      const permissionStore = usePermissionStore();
      const appStore = useAppStore();
      const userStore = useUserStore();

      const isBackPremissionMode = computed(
        () => appStore.getProjectConfig.permissionMode === PermissionModeEnum.BACK
      );

      async function switchToken(userId: number) {
        // 本函数切换用户登录Token的部分仅用于演示，实际生产时切换身份应当重新登录
        const token = `fakeToken${userId}`;
        userStore.setToken(token);

        // 重新获取用户信息和菜单
        userStore.getUserInfoAction();
        permissionStore.changePermissionCode();
      }

      return {
        hasPermission,
        permissionStore,
        switchToken,
        isBackPremissionMode
      };
    }
  });
</script>
