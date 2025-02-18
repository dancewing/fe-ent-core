<template>
  <span v-if="getShowTag" :class="getTagClass">{{ getContent }}</span>
</template>
<script lang="ts">
  import { computed, defineComponent } from 'vue';

  import { useDesign } from 'fe-ent-core/es/hooks/web/use-design';
  import type { PropType } from 'vue';
  import type { Menu } from 'fe-ent-core/es/router/types';

  export default defineComponent({
    name: 'SimpleMenuTag',
    props: {
      item: {
        type: Object as PropType<Menu>,
        default: () => ({})
      },
      dot: {
        type: Boolean
      },
      collapseParent: {
        type: Boolean
      }
    },
    setup(props) {
      const { prefixCls } = useDesign('simple-menu');

      const getShowTag = computed(() => {
        const { item } = props;

        if (!item) return false;

        const { tag } = item;
        if (!tag) return false;

        const { dot, content } = tag;
        if (!dot && !content) return false;
        return true;
      });

      const getContent = computed(() => {
        if (!getShowTag.value) return '';
        const { item, collapseParent } = props;
        const { tag } = item;
        const { dot, content } = tag!;
        return dot || collapseParent ? '' : content;
      });

      const getTagClass = computed(() => {
        const { item, collapseParent } = props;
        const { tag = {} } = item || {};
        const { dot, type = 'error' } = tag;
        const tagCls = `${prefixCls}-tag`;
        return [
          tagCls,

          [`${tagCls}--${type}`],
          {
            [`${tagCls}--collapse`]: collapseParent,
            [`${tagCls}--dot`]: dot || props.dot
          }
        ];
      });
      return {
        getTagClass,
        getShowTag,
        getContent
      };
    }
  });
</script>
