import { defHttp } from 'fe-ent-core';
enum Api {
  TREE_OPTIONS_LIST = '/tree/getDemoOptions',
}

/**
 * @description: Get sample options value
 */
export const treeOptionsListApi = (params?: Recordable) =>
  defHttp.get<Recordable[]>({ url: Api.TREE_OPTIONS_LIST, params });
