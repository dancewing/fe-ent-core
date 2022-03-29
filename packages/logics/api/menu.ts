import { defHttp } from '@ent-core/utils/http/axios';
import { getMenuListResultModel } from '../model';

enum Api {
  GetMenuList = '/menu-list',
  GetAppList = '/app-list',
}

/**
 * @description: Get user menu based on id
 */

export const getMenuList = () => {
  return defHttp.get<getMenuListResultModel>({ url: Api.GetMenuList });
};

export const getAppList = () => {
  return defHttp.get<getMenuListResultModel>({ url: Api.GetAppList });
};