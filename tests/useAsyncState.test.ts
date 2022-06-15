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
  expect(typeof result.current.start).toBe('function');
  expect(typeof result.current.resolve).toBe('function');
  expect(typeof result.current.reject).toBe('function');
  expect(typeof result.current.reset).toBe('function');

  act(() => {
    // async state started without origin
    result.current.start();
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
    result.current.start('state origin');
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
    result.current.resolve(value);
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
    result.current.reject(err);
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
    result.current.resolve(value, 'resolved origin');
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
    result.current.reject(err, 'rejected origin');
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
    result.current.reset();
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
