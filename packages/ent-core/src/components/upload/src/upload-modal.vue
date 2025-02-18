<template>
  <EntModal
    width="800px"
    :title="t('component.upload.upload')"
    :ok-text="t('component.upload.save')"
    v-bind="$attrs"
    :close-func="handleCloseFunc"
    :mask-closable="false"
    :keyboard="false"
    wrap-class-name="upload-modal"
    :ok-button-props="getOkButtonProps"
    :cancel-button-props="{ disabled: isUploadingRef }"
    @register="register"
    @ok="handleOk"
  >
    <template #centerFooter>
      <ent-button
        color="success"
        :disabled="!getIsSelectFile"
        :loading="isUploadingRef"
        @click="handleStartUpload"
      >
        {{ getUploadBtnText }}
      </ent-button>
    </template>

    <div class="upload-modal-toolbar">
      <NAlert :title="getHelpText" type="info" banner class="upload-modal-toolbar__text" />

      <NUpload
        :accept="getStringAccept"
        :multiple="multiple"
        :before-upload="beforeUpload"
        class="upload-modal-toolbar__btn"
      >
        <ent-button type="primary">
          {{ t('component.upload.choose') }}
        </ent-button>
      </NUpload>
    </div>
    <FileList :data-source="fileListRef" :columns="columns" :action-column="actionColumn" />
  </EntModal>
</template>
<script lang="ts">
  import { computed, defineComponent, reactive, ref, toRefs, unref } from 'vue';
  import { NAlert, NUpload } from 'naive-ui';
  import { isFunction } from '../../../utils/is';
  import { EntModal, useModalInner } from '../../../components/modal';
  import { EntButton } from '../../../components/button';
  // hooks
  import { useMessage } from '../../../hooks/web/use-message';
  //   types
  import { buildUUID } from '../../../utils/uuid';
  import { warn } from '../../../utils/log';
  import { useI18n } from '../../../hooks/web/use-i18n';
  import { UploadResultStatus } from './typing';
  import { basicProps } from './props';
  import { createActionColumn, createTableColumns } from './data';
  // utils
  import { checkFileType, checkImgType, getBase64WithFile } from './helper';
  import FileList from './file-list.vue';
  import { useUploadType } from './use-upload';
  import type { FileItem } from './typing';
  import type { PropType } from 'vue';

  export default defineComponent({
    components: { EntModal, NUpload, NAlert, FileList, EntButton },
    props: {
      ...basicProps,
      previewFileList: {
        type: Array as PropType<string[]>,
        default: () => []
      }
    },
    emits: ['change', 'register', 'delete'],
    setup(props, { emit }) {
      const state = reactive<{ fileList: FileItem[] }>({
        fileList: []
      });

      //   是否正在上传
      const isUploadingRef = ref(false);
      const fileListRef = ref<FileItem[]>([]);
      const { accept, helpText, maxNumber, maxSize } = toRefs(props);

      const { t } = useI18n();
      const [register, { closeModal }] = useModalInner();

      const { getAccept, getStringAccept, getHelpText } = useUploadType({
        acceptRef: accept,
        helpTextRef: helpText,
        maxNumberRef: maxNumber,
        maxSizeRef: maxSize
      });

      const { createMessage } = useMessage();

      const getIsSelectFile = computed(() => {
        return (
          fileListRef.value.length > 0 &&
          !fileListRef.value.every((item) => item.status === UploadResultStatus.SUCCESS)
        );
      });

      const getOkButtonProps = computed(() => {
        const someSuccess = fileListRef.value.some(
          (item) => item.status === UploadResultStatus.SUCCESS
        );
        return {
          disabled: isUploadingRef.value || fileListRef.value.length === 0 || !someSuccess
        };
      });

      const getUploadBtnText = computed(() => {
        const someError = fileListRef.value.some(
          (item) => item.status === UploadResultStatus.ERROR
        );
        return isUploadingRef.value
          ? t('component.upload.uploading')
          : someError
            ? t('component.upload.reUploadFailed')
            : t('component.upload.startUpload');
      });

      // 上传前校验
      function beforeUpload(file: File) {
        const { size, name } = file;
        const { maxSize } = props;
        const accept = unref(getAccept);
        // 设置最大值，则判断
        if (maxSize && file.size / 1024 / 1024 >= maxSize) {
          createMessage.error(t('component.upload.maxSizeMultiple', [maxSize]));
          return false;
        }

        // 设置类型,则判断
        if (accept.length > 0 && !checkFileType(file, accept)) {
          createMessage.error!(t('component.upload.acceptUpload', [accept.join(',')]));
          return false;
        }
        const commonItem = {
          uuid: buildUUID(),
          file,
          size,
          name,
          percent: 0,
          type: name.split('.').pop()
        };
        // 生成图片缩略图
        if (checkImgType(file)) {
          // beforeUpload，如果异步会调用自带上传方法
          // file.thumbUrl = await getBase64(file);
          getBase64WithFile(file).then(({ result: thumbUrl }) => {
            fileListRef.value = [
              ...unref(fileListRef),
              {
                thumbUrl,
                ...commonItem
              }
            ];
          });
        } else {
          fileListRef.value = [...unref(fileListRef), commonItem];
        }
        return false;
      }

      // 删除
      function handleRemove(record: FileItem) {
        const index = fileListRef.value.findIndex((item) => item.uuid === record.uuid);
        index !== -1 && fileListRef.value.splice(index, 1);
        emit('delete', record);
      }

      // 预览
      // function handlePreview(record: FileItem) {
      //   const { thumbUrl = '' } = record;
      //   createImgPreview({
      //     imageList: [thumbUrl],
      //   });
      // }

      async function uploadApiByItem(item: FileItem) {
        const { api } = props;
        if (!api || !isFunction(api)) {
          return warn('upload api must exist and be a function');
        }
        try {
          item.status = UploadResultStatus.UPLOADING;
          const { data } = await api?.(
            {
              data: {
                ...(props.uploadParams || {})
              },
              file: item.file,
              name: props.name,
              filename: props.filename
            },
            (progressEvent: ProgressEvent) => {
              const complete = Math.trunc((progressEvent.loaded / progressEvent.total) * 100);
              item.percent = complete;
            }
          );
          item.status = UploadResultStatus.SUCCESS;
          item.responseData = data; // response data
          return {
            success: true,
            error: null
          };
        } catch (e) {
          item.status = UploadResultStatus.ERROR;
          return {
            success: false,
            error: e
          };
        }
      }

      // 点击开始上传
      async function handleStartUpload() {
        const { maxNumber } = props;
        if (fileListRef.value.length + props.previewFileList?.length > maxNumber) {
          return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
        }
        try {
          isUploadingRef.value = true;
          // 只上传不是成功状态的
          const uploadFileList =
            fileListRef.value.filter((item) => item.status !== UploadResultStatus.SUCCESS) || [];
          const data = await Promise.all(
            uploadFileList.map((item) => {
              return uploadApiByItem(item);
            })
          );
          isUploadingRef.value = false;
          // 生产环境:抛出错误
          const errorList = data.filter((item: any) => !item.success);
          if (errorList.length > 0) throw errorList;
        } catch (e) {
          isUploadingRef.value = false;
          throw e;
        }
      }

      //   点击保存
      function handleOk() {
        const { maxNumber } = props;

        if (fileListRef.value.length > maxNumber) {
          return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
        }
        if (isUploadingRef.value) {
          return createMessage.warning(t('component.upload.saveWarn'));
        }
        const fileList: string[] = [];

        for (const item of fileListRef.value) {
          const { status, responseData } = item;
          if (status === UploadResultStatus.SUCCESS && responseData) {
            fileList.push(responseData.data);
          }
        }
        // 存在一个上传成功的即可保存
        if (fileList.length <= 0) {
          return createMessage.warning(t('component.upload.saveError'));
        }
        fileListRef.value = [];
        closeModal();
        emit('change', fileList);
      }

      // 点击关闭：则所有操作不保存，包括上传的
      async function handleCloseFunc() {
        if (!isUploadingRef.value) {
          fileListRef.value = [];
          return true;
        } else {
          createMessage.warning(t('component.upload.uploadWait'));
          return false;
        }
      }

      return {
        columns: createTableColumns() as any[],
        actionColumn: createActionColumn(handleRemove) as any,
        register,
        closeModal,
        getHelpText,
        getStringAccept,
        getOkButtonProps,
        beforeUpload,
        // registerTable,
        fileListRef,
        state,
        isUploadingRef,
        handleStartUpload,
        handleOk,
        handleCloseFunc,
        getIsSelectFile,
        getUploadBtnText,
        t
      };
    }
  });
</script>
