<template>
  <div ref="wrapperRef" :class="getClass">
    <NPageHeader
      v-if="content || $slots.headerContent || title || getHeaderSlots.length"
      v-bind="omit($attrs, 'class')"
      ref="headerRef"
      :title="title"
    >
      <template #default>
        <template v-if="content">
          {{ content }}
        </template>
        <slot v-else name="headerContent" />
      </template>
      <template v-for="item in getHeaderSlots" #[item]="data">
        <slot :name="item" v-bind="data || {}" />
      </template>
    </NPageHeader>

    <div ref="contentRef" class="overflow-hidden" :class="getContentClass" :style="getContentStyle">
      <slot />
    </div>

    <PageFooter v-if="getShowFooter" ref="footerRef">
      <template #left>
        <slot name="leftFooter" />
      </template>
      <template #right>
        <slot name="rightFooter" />
      </template>
    </PageFooter>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, provide, ref, unref, watch } from 'vue';

  import { omit } from 'lodash-es';
  import { NPageHeader } from 'naive-ui';
  import { useDesign } from '../../../hooks/web/use-design';
  import { useContentHeight } from '../../../hooks/web/use-content-height';
  import { PageWrapperFixedHeightKey } from '../constant';
  import PageFooter from './page-footer.vue';
  import type { CSSProperties, PropType } from 'vue';

  export default defineComponent({
    name: 'EntPageWrapper',
    components: { PageFooter, NPageHeader },
    inheritAttrs: false,
    props: {
      title: { type: String },
      dense: { type: Boolean },
      ghost: { type: Boolean },
      content: { type: String },
      contentStyle: {
        type: Object as PropType<CSSProperties>
      },
      contentBackground: { type: Boolean },
      contentFullHeight: { type: Boolean },
      contentClass: { type: String },
      fixedHeight: { type: Boolean },
      upwardSpace: {
        type: [String, Number] as PropType<string | number>,
        default: 0
      }
    },
    setup(props, { slots, attrs }) {
      const wrapperRef = ref(null);
      const headerRef = ref(null);
      const contentRef = ref(null);
      const footerRef = ref(null);
      const { prefixCls } = useDesign('page-wrapper');

      provide(
        PageWrapperFixedHeightKey,
        computed(() => props.fixedHeight)
      );

      const getIsContentFullHeight = computed(() => {
        return props.contentFullHeight;
      });

      const getUpwardSpace = computed(() => props.upwardSpace);
      const { redoHeight, setCompensation, contentHeight } = useContentHeight(
        getIsContentFullHeight as any,
        wrapperRef,
        [headerRef, footerRef],
        [contentRef],
        getUpwardSpace
      );
      setCompensation({ useLayoutFooter: true, elements: [footerRef] });

      const getClass = computed(() => {
        return [
          prefixCls,
          {
            [`${prefixCls}--dense`]: props.dense
          },
          attrs.class ?? {}
        ];
      });

      const getShowFooter = computed(() => slots?.leftFooter || slots?.rightFooter);

      const getHeaderSlots = computed(() => {
        return Object.keys(omit(slots, 'default', 'leftFooter', 'rightFooter', 'headerContent'));
      });

      const getContentStyle = computed((): CSSProperties => {
        const { contentFullHeight, contentStyle, fixedHeight } = props;
        if (!contentFullHeight) {
          return { ...contentStyle };
        }

        const height = `${unref(contentHeight)}px`;
        return {
          ...contentStyle,
          minHeight: height,
          ...(fixedHeight ? { height } : {})
        };
      });

      const getContentClass = computed(() => {
        const { contentBackground, contentClass } = props;
        return [
          `${prefixCls}-content`,
          contentClass,
          {
            [`${prefixCls}-content-bg`]: contentBackground
          }
        ];
      });

      watch(
        () => [getShowFooter.value],
        () => {
          redoHeight();
        },
        {
          flush: 'post',
          immediate: true
        }
      );

      return {
        getContentStyle,
        wrapperRef,
        headerRef,
        contentRef,
        footerRef,
        getClass,
        getHeaderSlots,
        prefixCls,
        getShowFooter,
        omit,
        getContentClass
      };
    }
  });
</script>
