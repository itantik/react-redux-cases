import { renderHook, act } from '@testing-library/react';
import { AsyncState, useAsyncState } from '../src/index';

test('useAsyncState async workflow', () => {
  const { result } = renderHook(() => useAsyncState());

  // initial state
  expect(result.current.state).toStrictEqual({
    state: AsyncState.initial,
    isInitial: true,
    isPending: false,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();
  expect(typeof result.current.actions.start).toBe('function');
  expect(typeof result.current.actions.resolve).toBe('function');
  expect(typeof result.current.actions.reject).toBe('function');
  expect(typeof result.current.actions.reset).toBe('function');

  act(() => {
    // case started
    result.current.actions.start();
  });
  expect(result.current.state).toStrictEqual({
    state: AsyncState.pending,
    isInitial: false,
    isPending: true,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();

  const value = {
    name: 'Joe',
    surname: 'Doe',
  };
  act(() => {
    // case resolved with value
    result.current.actions.resolve(value);
  });
  expect(result.current.state).toStrictEqual({
    state: AsyncState.resolved,
    isInitial: false,
    isPending: false,
    isResolved: true,
    isRejected: false,
    isFinished: true,
  });
  expect(result.current.value).toStrictEqual(value);
  expect(result.current.error).toBeUndefined();

  const err = new Error('It failed');
  act(() => {
    // case rejected with error
    result.current.actions.reject(err);
  });
  expect(result.current.state).toStrictEqual({
    state: AsyncState.rejected,
    isInitial: false,
    isPending: false,
    isResolved: false,
    isRejected: true,
    isFinished: true,
  });
  expect(result.current.error).toStrictEqual(err);
  expect(result.current.value).toBeUndefined();

  act(() => {
    // reset to initial state
    result.current.actions.reset();
  });
  expect(result.current.state).toStrictEqual({
    state: AsyncState.initial,
    isInitial: true,
    isPending: false,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();
});
