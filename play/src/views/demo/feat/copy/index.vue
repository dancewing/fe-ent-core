<template>
  <ent-page-wrapper title="文本复制示例">
    <ent-collapse-container class="w-full h-32 rounded-md" title="Copy Example">
      <div class="flex justify-center">
        <n-input v-model:value="value" placeholder="请输入" />
        <ent-button type="primary" class="ml-2" @click="handleCopy"> Copy </ent-button>
      </div>
    </ent-collapse-container>
  </ent-page-wrapper>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { useCopyToClipboard, useMessage } from 'fe-ent-core/es/hooks';
  import { NInput } from 'naive-ui';

  export default defineComponent({
    name: 'Copy',
    components: {
      NInput
    },
    setup() {
      const valueRef = ref('');
      const { createMessage } = useMessage();
      const { clipboardRef, copiedRef } = useCopyToClipboard();

      function handleCopy() {
        const value = unref(valueRef);
        if (!value) {
          createMessage.warning('请输入要拷贝的内容！');
          return;
        }
        clipboardRef.value = value;
        if (unref(copiedRef)) {
          createMessage.warning('copy success！');
        }
      }
      return { handleCopy, value: valueRef };
    }
  });
</script>
