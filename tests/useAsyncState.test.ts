import { renderHook, act } from '@testing-library/react-hooks';
import { StateType, useAsyncState } from '../src/index';

test('useAsyncState initial state', () => {
  const { result } = renderHook(() => useAsyncState());

  // initial async state
  expect(result.current.state).toStrictEqual({
    state: StateType.INITIAL,
    isInitial: true,
    isPending: false,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();
  expect(result.current.origin).toBeUndefined();
  expect(typeof result.current.actions.start).toBe('function');
  expect(typeof result.current.actions.resolve).toBe('function');
  expect(typeof result.current.actions.reject).toBe('function');
  expect(typeof result.current.actions.reset).toBe('function');

  act(() => {
    // async state started without origin
    result.current.actions.start();
  });
  expect(result.current.state).toStrictEqual({
    state: StateType.PENDING,
    isInitial: false,
    isPending: true,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();
  expect(result.current.origin).toBeUndefined();

  act(() => {
    // async state started with origin
    result.current.actions.start('state origin');
  });
  expect(result.current.state).toStrictEqual({
    state: StateType.PENDING,
    isInitial: false,
    isPending: true,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
  expect(result.current.origin).toBe('state origin');

  const value = {
    name: 'Joe',
    surname: 'Doe',
  };
  act(() => {
    // async state resolved with value, without origin
    result.current.actions.resolve(value);
  });
  expect(result.current.state).toStrictEqual({
    state: StateType.RESOLVED,
    isInitial: false,
    isPending: false,
    isResolved: true,
    isRejected: false,
    isFinished: true,
  });
  expect(result.current.origin).toBe('state origin');
  expect(result.current.value).toStrictEqual(value);
  expect(result.current.error).toBeUndefined();

  const err = new Error('It failed');
  act(() => {
    // async state rejected with error, without origin
    result.current.actions.reject(err);
  });
  expect(result.current.state).toStrictEqual({
    state: StateType.REJECTED,
    isInitial: false,
    isPending: false,
    isResolved: false,
    isRejected: true,
    isFinished: true,
  });
  expect(result.current.origin).toBe('state origin');
  expect(result.current.error).toStrictEqual(err);
  expect(result.current.value).toBeUndefined();

  act(() => {
    // async state resolved with value and origin
    result.current.actions.resolve(value, 'resolved origin');
  });
  expect(result.current.state).toStrictEqual({
    state: StateType.RESOLVED,
    isInitial: false,
    isPending: false,
    isResolved: true,
    isRejected: false,
    isFinished: true,
  });
  expect(result.current.origin).toBe('resolved origin');
  expect(result.current.value).toStrictEqual(value);
  expect(result.current.error).toBeUndefined();

  act(() => {
    // async state rejected with error and origin
    result.current.actions.reject(err, 'rejected origin');
  });
  expect(result.current.state).toStrictEqual({
    state: StateType.REJECTED,
    isInitial: false,
    isPending: false,
    isResolved: false,
    isRejected: true,
    isFinished: true,
  });
  expect(result.current.origin).toBe('rejected origin');
  expect(result.current.error).toStrictEqual(err);
  expect(result.current.value).toBeUndefined();

  act(() => {
    // async state reset to initial state
    result.current.actions.reset();
  });
  expect(result.current.state).toStrictEqual({
    state: StateType.INITIAL,
    isInitial: true,
    isPending: false,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();
  expect(result.current.origin).toBeUndefined();
});
