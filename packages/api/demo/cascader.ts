import { defHttp } from '@ent-core/utils/http/axios';
import { AreaModel, AreaParams } from '@ent-core/api/demo/model/areaModel';

enum Api {
  AREA_RECORD = '/api/cascader/getAreaRecord',
}

export const areaRecord = (data: AreaParams) =>
  defHttp.post<AreaModel>({ url: Api.AREA_RECORD, data });
