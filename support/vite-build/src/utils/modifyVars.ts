import { generate } from '@ant-design/colors';
// @ts-ignore: typo
import { getThemeVariables } from 'ant-design-vue/dist/theme';
import { searchForWorkspaceRoot } from 'vite';
import path from 'path';
import fs from 'fs';

const primaryColor = '#0960bd';

function generateAntColors(color: string, theme: 'default' | 'dark' = 'default') {
  return generate(color, {
    theme,
  });
}

/**
 * less global variable
 */
export function generateModifyVars() {
  const cwd = process.cwd();
  const workspace = searchForWorkspaceRoot(cwd);
  let preLoadFile = '';
  preLoadFile = path.resolve(workspace, `packages/theme/config.less`);
  if (!fs.existsSync(preLoadFile)) {
    preLoadFile = path.resolve(cwd, `node_modules/fe-ent-core/theme/config.less`);
  }
  const palettes = generateAntColors(primaryColor);
  const primary = palettes[5];

  const primaryColorObj: Record<string, string> = {};

  for (let index = 0; index < 10; index++) {
    primaryColorObj[`primary-${index + 1}`] = palettes[index];
  }

  const modifyVars = getThemeVariables();
  return {
    ...modifyVars,
    // reference:  Avoid repeated references
    hack: `${modifyVars.hack} @import (reference) "${preLoadFile}";`,
    'primary-color': primary,
    ...primaryColorObj,
    'info-color': primary,
    'processing-color': primary,
    'success-color': '#55D187', //  Success color
    'error-color': '#ED6F6F', //  False color
    'warning-color': '#EFBD47', //   Warning color
    'font-size-base': '14px', //  Main font size
    'border-radius-base': '2px', //  Component/float fillet
    'link-color': primary, //   Link color
    'app-content-background': '#fafafa', //   Link color
  };
}
