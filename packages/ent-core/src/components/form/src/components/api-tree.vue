<template>
  <NTree v-bind="getAttrs" @change="handleChange">
    <template v-for="item in Object.keys($slots)" #[item]="data">
      <slot :name="item" v-bind="data || {}" />
    </template>
    <template v-if="loading" #suffixIcon>
      <EntIcon icon="ant-design:loading-outlined" />
    </template>
  </NTree>
</template>

<script lang="ts">
  import { type PropType, computed, defineComponent, onMounted, ref, unref, watch } from 'vue';
  import { NTree } from 'naive-ui';
  import { get } from 'lodash-es';
  import { EntIcon } from '../../../icon';
  import { isArray, isFunction } from '../../../../utils/is';
  import type { AnyFunction, Recordable } from '../../../../types';
  export default defineComponent({
    name: 'ApiTree',
    components: { NTree, EntIcon },
    props: {
      api: { type: Function as PropType<(arg?: Recordable<any>) => Promise<Recordable<any>>> },
      params: { type: Object },
      immediate: { type: Boolean, default: true },
      resultField: {
        type: String,
        default: ''
      },
      afterFetch: { type: Function as PropType<AnyFunction> }
    },
    emits: ['options-change', 'change'],
    setup(props, { attrs, emit }) {
      const treeData = ref<Recordable<any>[]>([]);
      const isFirstLoaded = ref<boolean>(false);
      const loading = ref(false);
      const getAttrs = computed(() => {
        return {
          ...(props.api ? { treeData: unref(treeData) } : {}),
          ...attrs
        };
      });

      function handleChange(...args) {
        emit('change', ...args);
      }

      watch(
        () => props.params,
        () => {
          !unref(isFirstLoaded) && fetch();
        },
        { deep: true }
      );

      watch(
        () => props.immediate,
        (v) => {
          v && !isFirstLoaded.value && fetch();
        }
      );

      onMounted(() => {
        props.immediate && fetch();
      });

      async function fetch() {
        const { api, afterFetch } = props;
        if (!api || !isFunction(api)) return;
        loading.value = true;
        treeData.value = [];
        let result;
        try {
          result = await api(props.params);
        } catch (e) {
          console.error(e);
        }
        if (afterFetch && isFunction(afterFetch)) {
          result = afterFetch(result);
        }
        loading.value = false;
        if (!result) return;
        if (!isArray(result)) {
          result = get(result, props.resultField);
        }
        treeData.value = (result as Recordable<any>[]) || [];
        isFirstLoaded.value = true;
        emit('options-change', treeData.value);
      }
      return { getAttrs, loading, handleChange };
    }
  });
</script>
