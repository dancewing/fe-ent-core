<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" :class="cls" :style="innerStyle" :stroke-width="strokeWidth" :stroke-linecap="strokeLinecap" :stroke-linejoin="strokeLinejoin" @click="onClick"><path fill="#fff" d="M887.081 904.791a25.8 25.8 0 0 1-18.376-7.619L705.618 734.075l-4.163 3.369c-58.255 47.18-131.522 73.16-206.32 73.16-181.07 0-328.377-147.308-328.377-328.367 0-181.068 147.308-328.376 328.377-328.376 181.063 0 328.376 147.308 328.376 328.376 0 77.072-27.412 152.07-77.169 211.17l-3.522 4.173 162.719 162.744a25.85 25.85 0 0 1 7.639 18.432 26.08 26.08 0 0 1-26.051 26.045zM495.13 205.957c-152.336 0-276.27 123.935-276.27 276.27 0 152.33 123.934 276.27 276.27 276.27 152.34 0 276.275-123.94 276.275-276.27 0-152.335-123.935-276.27-276.275-276.27"></path><path fill="#fff" d="M626.545 508.355h-262.83a26.127 26.127 0 0 1 0-52.255h262.83a26.127 26.127 0 0 1 0 52.255"></path><path fill="#fff" d="M495.13 639.77a26.127 26.127 0 0 1-26.128-26.128v-262.83a26.127 26.127 0 0 1 52.255 0v262.835a26.127 26.127 0 0 1-26.127 26.123"></path></svg>
</template>
<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import type { CSSProperties } from 'vue';

  function isNumber(obj: any): obj is number {
    return Object.prototype.toString.call(obj) === '[object Number]' && obj === obj;
  }
  export default defineComponent({
    name: 'IconScale',
    props: {
      size: {
        type: [Number, String],
      },
      strokeWidth: {
        type: Number,
        default: 4,
      },
      strokeLinecap: {
        type: String,
        default: 'butt',
        validator: (value: any) => {
          return ['butt', 'round', 'square'].includes(value);
        },
      },
      strokeLinejoin: {
        type: String,
        default: 'miter',
        validator: (value: any) => {
          return ['arcs', 'bevel', 'miter', 'miter-clip', 'round'].includes(value);
        },
      },
      rotate: Number,
      spin: Boolean,
      prefixCls: {
        type: String,
        default: 'icon',
      },
    },
    emits: {
      click: (ev: MouseEvent) => true,
    },
    setup(props, { emit }) {
      const cls = computed(() => [
        props.prefixCls,
         `${props.prefixCls}-scale`,
          { [`${props.prefixCls}-spin`]: props.spin }]
        );
      const innerStyle = computed(() => {
        const styles: CSSProperties = {};
        if (props.size) {
          styles.fontSize = isNumber(props.size) ? `${props.size}px` : props.size;
        }
        if (props.rotate) {
          styles.transform = `rotate(${props.rotate}deg)`;
        }
        return styles;
      });
      const onClick = (ev: MouseEvent) => {
        emit('click', ev);
      };

      return {
        cls,
        innerStyle,
        onClick,
      };
    },
  });
</script>
