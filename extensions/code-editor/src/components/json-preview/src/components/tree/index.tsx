import { computed, defineComponent, reactive, ref, watchEffect } from 'vue';
import TreeNode, { treeNodePropsPass } from '../tree-node';
import { emitError, jsonFlatten } from '../../utils';
import type { PropType } from 'vue';
import type { NodeDataType } from '../tree-node';
import type { JSONDataType } from '../../utils';

type FlatDataType = NodeDataType[];

export default defineComponent({
  name: 'EntJsonTree',

  props: {
    ...treeNodePropsPass,
    // JSONLike data.
    data: {
      type: Object as PropType<JSONDataType>,
      default: null,
    },
    // Define the depth of the tree, nodes greater than this depth will not be expanded.
    deep: {
      type: Number,
      default: Number.POSITIVE_INFINITY,
    },
    deepCollapseChildren: {
      type: Boolean,
      default: false,
    },
    collapsePath: {
      type: RegExp,
      default: null,
    },
    // Data root path.
    path: {
      type: String,
      default: 'root',
    },
    // Whether to use virtual scroll, usually applied to big data.
    virtual: {
      type: Boolean,
      default: false,
    },
    //When using virtual scroll, set the number of items there can be
    virtualLines: {
      type: Number,
      default: 10,
    },
    // When using virtual scroll, define the height of each row.
    itemHeight: {
      type: Number,
      default: 20,
    },
    // When there is a selection function, define the selected path.
    // For multiple selections, it is an array ['root.a','root.b'], for single selection, it is a string of 'root.a'.
    modelValue: {
      type: [String, Array] as PropType<string | string[]>,
      default: () => '',
    },
  },

  emits: ['click', 'change', 'update:modelValue'],

  setup(props, { emit }) {
    const tree = ref<HTMLElement>();

    const state = reactive({
      translateY: 0,
      visibleData: null as FlatDataType | null,
      hiddenPaths: jsonFlatten(props.data, props.path).reduce((acc, item) => {
        const depthComparison = props.deepCollapseChildren
          ? item.level >= props.deep
          : item.level === props.deep;
        const pathComparison =
          depthComparison || (props.collapsePath && props.collapsePath.test(item.path));
        if (
          (item.type === 'objectStart' || item.type === 'arrayStart') &&
          (depthComparison || pathComparison)
        ) {
          return {
            ...acc,
            [item.path]: 1,
          };
        }
        return acc;
      }, {}) as Record<string, 1>,
    });

    const flatData = computed(() => {
      let startHiddenItem: null | NodeDataType = null;
      const data = jsonFlatten(props.data, props.path).reduce((acc, cur, index) => {
        const item = {
          ...cur,
          id: index,
        };
        const isHidden = state.hiddenPaths[item.path];
        if (startHiddenItem && startHiddenItem.path === item.path) {
          const isObject = startHiddenItem.type === 'objectStart';
          const mergeItem = {
            ...startHiddenItem,
            ...item,
            content: isObject ? '{...}' : '[...]',
            type: isObject ? 'objectCollapsed' : 'arrayCollapsed',
          } as NodeDataType;
          startHiddenItem = null;
          return acc.concat(mergeItem);
        } else if (isHidden && !startHiddenItem) {
          startHiddenItem = item;
          return acc;
        }

        return startHiddenItem ? acc : acc.concat(item);
      }, [] as FlatDataType);
      return data;
    });

    const selectedPaths = computed(() => {
      const value = props.modelValue;
      if (value && props.selectableType === 'multiple' && Array.isArray(value)) {
        return value;
      }
      return [value];
    });

    const propsErrorMessage = computed(() => {
      const error = props.selectableType && !props.selectOnClickNode && !props.showSelectController;
      return error
        ? 'When selectableType is not null, selectOnClickNode and showSelectController cannot be false at the same time, because this will cause the selection to fail.'
        : '';
    });

    const updateVisibleData = (flatDataValue: FlatDataType) => {
      if (props.virtual) {
        const treeRefValue = tree.value;
        const visibleCount = props.virtualLines;
        const scrollTop = (treeRefValue && treeRefValue.scrollTop) || 0;
        const scrollCount = Math.floor(scrollTop / props.itemHeight);
        let start =
          scrollCount < 0
            ? 0
            : scrollCount + visibleCount > flatDataValue.length
              ? flatDataValue.length - visibleCount
              : scrollCount;
        if (start < 0) {
          start = 0;
        }
        const end = start + visibleCount;
        state.translateY = start * props.itemHeight;
        state.visibleData = flatDataValue.filter((_item, index) => index >= start && index < end);
      } else {
        state.visibleData = flatDataValue;
      }
    };

    const onTreeScroll = () => {
      updateVisibleData(flatData.value);
    };

    const onSelectedChange = ({ path }: NodeDataType) => {
      const type = props.selectableType;
      if (type === 'multiple') {
        const index = selectedPaths.value.indexOf(path);
        const newVal = [...selectedPaths.value];
        if (index !== -1) {
          newVal.splice(index, 1);
        } else {
          newVal.push(path);
        }
        emit('update:modelValue', newVal);
        emit('change', newVal, [...selectedPaths.value]);
      } else if (type === 'single') {
        if (selectedPaths.value[0] !== path) {
          const [oldVal] = selectedPaths.value;
          const newVal = path;
          emit('update:modelValue', newVal);
          emit('change', newVal, oldVal);
        }
      }
    };

    const onTreeNodeClick = ({ content, path }: NodeDataType) => {
      emit('click', path, content);
    };

    const onBracketsClick = (collapsed: boolean, path: string) => {
      if (collapsed) {
        state.hiddenPaths = {
          ...state.hiddenPaths,
          [path]: 1,
        };
      } else {
        const newPaths = { ...state.hiddenPaths };
        delete newPaths[path];
        state.hiddenPaths = newPaths;
      }
    };

    watchEffect(() => {
      if (propsErrorMessage.value) {
        emitError(propsErrorMessage.value);
      }
    });

    watchEffect(() => {
      if (flatData.value) {
        updateVisibleData(flatData.value);
      }
    });

    return {
      tree,
      state,
      flatData,
      selectedPaths,
      onTreeScroll,
      onSelectedChange,
      onTreeNodeClick,
      onBracketsClick,
    };
  },

  render() {
    const {
      virtual,
      itemHeight,
      customValueFormatter,
      showDoubleQuotes,
      showLength,
      showLine,
      showSelectController,
      selectOnClickNode,
      pathSelectable,
      highlightSelectedNode,
      collapsedOnClickBrackets,
      state,
      flatData,
      selectedPaths,
      selectableType,
    } = this;

    const { onTreeNodeClick, onBracketsClick, onSelectedChange, onTreeScroll } = this;

    const nodeContent =
      state.visibleData &&
      state.visibleData.map((item) => (
        <TreeNode
          key={item.id}
          node={item}
          collapsed={!!state.hiddenPaths[item.path]}
          custom-value-formatter={customValueFormatter}
          show-double-quotes={showDoubleQuotes}
          show-length={showLength}
          collapsed-on-click-brackets={collapsedOnClickBrackets}
          checked={selectedPaths.includes(item.path)}
          selectable-type={selectableType}
          show-line={showLine}
          show-select-controller={showSelectController}
          select-on-click-node={selectOnClickNode}
          path-selectable={pathSelectable}
          highlight-selected-node={highlightSelectedNode}
          onTreeNodeClick={onTreeNodeClick}
          onBracketsClick={onBracketsClick}
          onSelectedChange={onSelectedChange}
        />
      ));

    return (
      <div
        ref="tree"
        class={{
          'vjs-tree': true,
          'is-virtual': virtual,
        }}
        onScroll={onTreeScroll}
      >
        {virtual ? (
          <div style={{ height: `${flatData.length * itemHeight}px` }}>
            <div style={{ transform: `translateY(${state.translateY}px)` }}>{nodeContent}</div>
          </div>
        ) : (
          nodeContent
        )}
      </div>
    );
  },
});
