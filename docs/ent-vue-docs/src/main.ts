import 'uno.css';
// Register icon sprite
import 'virtual:svg-icons-register';

import { createApp } from 'vue';
import { initAppConfigStore } from 'fe-ent-core/lib/logics/init-app-config';
import { setupErrorHandle } from 'fe-ent-core/lib/logics/error-handle';
import { entRouter } from 'fe-ent-core/lib/router';
import { setupRouterGuard } from 'fe-ent-core/lib/router/guard';
import { setupStore } from 'fe-ent-core/lib/store';
import { setupGlobDirectives } from 'fe-ent-core/lib/directives';
import { setupI18n } from 'fe-ent-core/lib/locales/setup-i18n';
import { registerGlobComp } from 'fe-ent-core/lib/components/register-glob-comp';
import { initApplication } from './init-application';
import getRoutes from './router';
import EntCore from 'fe-ent-core';
import { usePermissionStoreWithOut } from 'fe-ent-core/lib/store/modules/permission';
import { transformRouteToMenu } from 'fe-ent-core/lib/router';
import { useLocale } from 'fe-ent-core/lib/locales';
import { PageHeader, Button, Tooltip } from 'ant-design-vue'
import locales from './locale'

import 'ant-design-vue/dist/antd.less';
import 'fe-ent-core/lib/theme/index.less';

import 'prismjs/themes/prism.css';

import ArcoArticle from './components/article/index.vue';
import AnchorHead from './components/anchor-head/index.vue';
import CodeBlock from './components/code-block/index.vue';
import CellDemo from './components/cell-demo/index.vue';
import CellCode from './components/cell-code/index.vue';

import { initRouteAndLayout } from '@fe-ent-app/page';

import App from './App.vue';
async function bootstrap() {
  const app = createApp(App);

  // Configure store
  setupStore(app);

  // Initialize internal system configuration
  await initAppConfigStore();

  //初始化全局变量
  await initApplication();

  // Multilingual configuration
  // Asynchronous case: language files may be obtained from the server side
  await setupI18n(app);

  // Register global components
  registerGlobComp(app);

  initRouteAndLayout(app);

  app.use(EntCore);

  app.component(CodeBlock.name, CodeBlock);
  app.component(CellDemo.name, CellDemo);
  app.component(CellCode.name, CellCode);
  app.component(AnchorHead.name, AnchorHead);
  app.component(ArcoArticle.name, ArcoArticle);

  app.use(PageHeader);
  app.use(Button);
  app.use(Tooltip);

  const {getLocale, addMessages} = useLocale();
  addMessages('en', locales.en)
  addMessages('zh_CN', locales.zh_CN)
  const docsRoutes = getRoutes(getLocale.value);
  console.log(docsRoutes);
  entRouter.addBasicRoutes(docsRoutes);

  const permissionStore = usePermissionStoreWithOut();
  permissionStore.setFrontMenuList(transformRouteToMenu(docsRoutes))
  app.use(entRouter);

  // router-guard
  setupRouterGuard(entRouter, false);

  // Register global directive
  setupGlobDirectives(app);

  // Configure global error handling
  setupErrorHandle(app);

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  app.mount('#app');
}

bootstrap();
