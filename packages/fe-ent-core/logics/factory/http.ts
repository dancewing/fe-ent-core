import { type AxiosProgressEvent } from 'axios';
import { noop } from '@vueuse/core';
import { useUserStoreWithOut } from '@ent-core/store';
import { defHttp } from '@ent-core/utils/http/axios';
import { useGlobSetting } from '@ent-core/hooks/setting/use-glob-setting';
import type { UploadFileParams } from '@ent-core/logics/types/axios';
import type { UploadApiResult } from '@ent-core/logics/types/upload';

export interface HttpFactory {
  unauthorized: () => Promise<any>;
  uploadApi: (
    params: UploadFileParams,
  ) => Promise<import('axios').AxiosResponse<UploadApiResult, any>>;
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void;
}

export class HttpService implements HttpFactory {
  public unauthorized = () => {
    const userStore = useUserStoreWithOut();
    userStore.setToken(undefined);
    return userStore.logout(true);
  };
  public uploadApi = (params: UploadFileParams) => {
    const { uploadUrl = '' } = useGlobSetting();
    return defHttp.uploadFile<UploadApiResult>(
      {
        url: uploadUrl,
        onUploadProgress: this.onUploadProgress,
      },
      params,
    );
  };
  onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    return noop;
  };
}
