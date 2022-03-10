import path from 'path';
import fs from 'fs';
import { FE_PKG } from './constants';
import { findWorkspaceRoot } from './pkg';
import { CustomConfigEnv } from '../vite';

export const getVitePreLoadFile = (env: CustomConfigEnv) => {
  // 是否构建库模式
  const workspace = findWorkspaceRoot();
  let preLoadFile = '';

  if (env.preview) {
    preLoadFile = path.resolve(workspace, `packages/theme/config.less`);
  } else if (env.runMode == 'package' || env.runMode == 'serve') {
    if (fs.existsSync(process.cwd() + 'src/theme/config.less')) {
      preLoadFile = path.resolve(process.cwd(), 'src/theme/config.less');
    } else {
      preLoadFile = path.resolve(workspace, `node_modules/${FE_PKG}/theme/config.less`);
    }
  } else {
    preLoadFile = path.resolve(process.cwd(), 'theme/config.less');
  }
  return preLoadFile;
};

export const getThemePluginPreLoadFile = (env: CustomConfigEnv) => {
  // 是否构建库模式
  const workspace = findWorkspaceRoot();
  let preLoadFile = '';

  if (env.preview) {
    preLoadFile = path.resolve(workspace, `packages/theme/index.less`);
  } else if (env.runMode == 'package' || env.runMode == 'serve') {
    if (fs.existsSync(process.cwd() + 'src/theme/index.less')) {
      preLoadFile = path.resolve(process.cwd(), 'src/theme/index.less');
    } else {
      preLoadFile = path.resolve(workspace, `node_modules/${FE_PKG}/theme/index.less`);
    }
  } else {
    preLoadFile = path.resolve(process.cwd(), 'theme/index.less');
  }
  return preLoadFile;
};
