/**
 * Prevent repeated clicks
 * @Example v-repeat-click="()=>{}"
 */
import { on, once } from '@ent-core/utils/dom-utils';
import type { Directive, DirectiveBinding } from 'vue';
import type { IntervalHandle, Nullable } from '@ent-core/types';

const repeatDirective: Directive = {
  beforeMount(el: Element, binding: DirectiveBinding<any>) {
    let interval: Nullable<IntervalHandle> = null;
    let startTime = 0;
    const handler = (): void => binding?.value();
    const clear = (): void => {
      if (Date.now() - startTime < 100) {
        handler();
      }
      interval && clearInterval(interval);
      interval = null;
    };

    on(el, 'mousedown', (e): void => {
      if ((e as MouseEvent).button !== 0) return;
      startTime = Date.now();
      once(document as any, 'mouseup', clear);
      interval && clearInterval(interval);
      interval = setInterval(handler, 100);
    });
  },
};

export default repeatDirective;
