import { useCallback, useEffect, useRef } from 'react';
import { Abortable } from './Abortable';

export const ConcurrentPriority = {
  all: 'all',
  first: 'first',
  last: 'last',
} as const;
export type ConcurrentPriorityType = (typeof ConcurrentPriority)[keyof typeof ConcurrentPriority];

export function useAbortable(concurrentPriority: ConcurrentPriorityType = ConcurrentPriority.all) {
  const abortableItemsRef = useRef<Abortable[]>([]);

  const abort = useCallback(() => {
    let item;
    while ((item = abortableItemsRef.current.shift())) {
      item.onAbort && item.onAbort();
    }
  }, []);

  const watched = useCallback((item: Abortable) => {
    return abortableItemsRef.current.includes(item);
  }, []);

  const unwatch = useCallback((item: Abortable) => {
    const ind = abortableItemsRef.current.indexOf(item);
    if (ind >= 0) {
      abortableItemsRef.current.splice(ind, 1);
    }
  }, []);

  const watch = useCallback(
    (item: Abortable) => {
      unwatch(item);
      if (abortableItemsRef.current.length > 0) {
        if (concurrentPriority === ConcurrentPriority.first) {
          item.onAbort && item.onAbort();
          return false;
        }
        if (concurrentPriority === ConcurrentPriority.last) {
          abort();
        }
      }
      abortableItemsRef.current.push(item);
      return true;
    },
    [abort, concurrentPriority, unwatch],
  );

  useEffect(
    () => () => {
      abort();
    },
    [abort],
  );

  return { watch, unwatch, watched, abort };
}
