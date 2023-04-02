import { renderHook } from '@testing-library/react';
import { Abortable } from '../src';
import { ConcurrentPriority, useAbortable } from '../src/useAbortable';

class AbortableCase implements Abortable {
  constructor(public aborted = false) {}

  onAbort() {
    this.aborted = true;
  }
}

test('useAbortable() creates functions', async () => {
  const { result } = renderHook(() => useAbortable());

  expect(typeof result.current.watch).toBe('function');
  expect(typeof result.current.unwatch).toBe('function');
  expect(typeof result.current.watched).toBe('function');
});

test('useAbortable() watches the cases', async () => {
  const case1 = new AbortableCase();
  const case2 = new AbortableCase();
  const case3 = new AbortableCase();

  const { result } = renderHook(() => useAbortable());

  // set watcher
  result.current.watch(case1);
  result.current.watch(case2);

  expect(result.current.watched(case1)).toBe(true);
  expect(result.current.watched(case2)).toBe(true);
  expect(result.current.watched(case3)).toBe(false);

  // set watcher
  result.current.unwatch(case1);
  result.current.watch(case3);

  expect(result.current.watched(case1)).toBe(false);
  expect(result.current.watched(case2)).toBe(true);
  expect(result.current.watched(case3)).toBe(true);
});

test('useAbortable() unwatching does not abort the case', async () => {
  const case1 = new AbortableCase();

  const { result } = renderHook(() => useAbortable());

  // set watcher
  result.current.watch(case1);

  expect(case1.aborted).toBe(false);
  expect(result.current.watched(case1)).toBe(true);

  // set watcher
  result.current.unwatch(case1);

  expect(case1.aborted).toBe(false);
  expect(result.current.watched(case1)).toBe(false);
});

test('useAbortable() aborts all on unmount', async () => {
  const case1 = new AbortableCase();
  const case2 = new AbortableCase();
  const case3 = new AbortableCase();

  const { result, unmount } = renderHook(() => useAbortable());

  // set watcher
  result.current.watch(case1);
  result.current.watch(case2);
  result.current.watch(case3);

  expect(case1.aborted).toBe(false);
  expect(case2.aborted).toBe(false);
  expect(case3.aborted).toBe(false);

  expect(result.current.watched(case1)).toBe(true);
  expect(result.current.watched(case2)).toBe(true);
  expect(result.current.watched(case3)).toBe(true);

  unmount();

  expect(case1.aborted).toBe(true);
  expect(case2.aborted).toBe(true);
  expect(case3.aborted).toBe(true);

  expect(result.current.watched(case1)).toBe(false);
  expect(result.current.watched(case2)).toBe(false);
  expect(result.current.watched(case3)).toBe(false);
});

test('useAbortable() aborts all on abort()', async () => {
  const case1 = new AbortableCase();
  const case2 = new AbortableCase();
  const case3 = new AbortableCase();

  const { result } = renderHook(() => useAbortable());

  // set watcher
  result.current.watch(case1);
  result.current.watch(case2);
  result.current.watch(case3);

  expect(case1.aborted).toBe(false);
  expect(case2.aborted).toBe(false);
  expect(case3.aborted).toBe(false);

  expect(result.current.watched(case1)).toBe(true);
  expect(result.current.watched(case2)).toBe(true);
  expect(result.current.watched(case3)).toBe(true);

  result.current.abort();

  expect(case1.aborted).toBe(true);
  expect(case2.aborted).toBe(true);
  expect(case3.aborted).toBe(true);

  expect(result.current.watched(case1)).toBe(false);
  expect(result.current.watched(case2)).toBe(false);
  expect(result.current.watched(case3)).toBe(false);
});

test('useAbortable() with ConcurrentPriority.first', async () => {
  const case1 = new AbortableCase();
  const case2 = new AbortableCase();
  const case3 = new AbortableCase();

  const { result } = renderHook(() => useAbortable(ConcurrentPriority.first));

  // set watcher
  result.current.watch(case1);

  expect(case1.aborted).toBe(false);
  expect(case2.aborted).toBe(false);
  expect(case3.aborted).toBe(false);

  expect(result.current.watched(case1)).toBe(true);
  expect(result.current.watched(case2)).toBe(false);
  expect(result.current.watched(case3)).toBe(false);

  // set watcher
  result.current.watch(case2);
  result.current.watch(case3);

  expect(case1.aborted).toBe(false);
  expect(case2.aborted).toBe(true);
  expect(case3.aborted).toBe(true);

  expect(result.current.watched(case1)).toBe(true);
  expect(result.current.watched(case2)).toBe(false);
  expect(result.current.watched(case3)).toBe(false);
});

test('useAbortable() with ConcurrentPriority.last', async () => {
  const case1 = new AbortableCase();
  const case2 = new AbortableCase();
  const case3 = new AbortableCase();

  const { result } = renderHook(() => useAbortable(ConcurrentPriority.last));

  // set watcher
  result.current.watch(case1);

  expect(case1.aborted).toBe(false);
  expect(case2.aborted).toBe(false);
  expect(case3.aborted).toBe(false);

  expect(result.current.watched(case1)).toBe(true);
  expect(result.current.watched(case2)).toBe(false);
  expect(result.current.watched(case3)).toBe(false);

  // set watcher
  result.current.watch(case2);
  result.current.watch(case3);

  expect(case1.aborted).toBe(true);
  expect(case2.aborted).toBe(true);
  expect(case3.aborted).toBe(false);

  expect(result.current.watched(case1)).toBe(false);
  expect(result.current.watched(case2)).toBe(false);
  expect(result.current.watched(case3)).toBe(true);
});
