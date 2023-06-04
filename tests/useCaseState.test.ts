import { act, renderHook, waitFor } from '@testing-library/react';
import { AsyncState, useCaseState } from '../src';
import { waitPlease } from './testUtils';
import { TestCase } from './TestCase';

test('useCaseState() returns the case object', async () => {
  const { result } = renderHook(() =>
    useCaseState(() => TestCase.create({ testOption: 'test option' })),
  );
  expect(typeof result.current.run).toBe('function');
  expect(typeof result.current.abort).toBe('function');
  expect(result.current.state).toStrictEqual({
    state: AsyncState.initial,
    isInitial: true,
    isPending: false,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });
});

test('useCaseState() watching the case state', async () => {
  const caseFactory = () => TestCase.create({ testOption: 'double' });
  const { result } = renderHook(() => useCaseState(caseFactory));

  // execute the case
  act(() => {
    result.current.run({ runParam: 5 });
  });

  expect(result.current.state).toStrictEqual({
    state: AsyncState.pending,
    isInitial: false,
    isPending: true,
    isResolved: false,
    isRejected: false,
    isFinished: false,
  });

  await waitFor(() => expect(result.current.state.isFinished).toBe(true));

  expect(result.current.state).toStrictEqual({
    state: AsyncState.resolved,
    isInitial: false,
    isPending: false,
    isResolved: true,
    isRejected: false,
    isFinished: true,
  });
});

test('useCaseState() returns value', async () => {
  const caseFactory = () => TestCase.create({ testOption: 'double' });
  const { result } = renderHook(() => useCaseState(caseFactory));

  // execute the case
  act(() => {
    result.current.run({ runParam: 5 });
  });

  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();

  await waitFor(() => expect(result.current.state.isFinished).toBe(true));

  expect(result.current.value).toBe('Double - 10');
  expect(result.current.error).toBeUndefined();
});

test('useCaseState() returns error', async () => {
  const caseFactory = () => TestCase.create({ testOption: 'unsupported' });
  const { result } = renderHook(() => useCaseState(caseFactory));

  // execute the case
  act(() => {
    result.current.run({ runParam: 5 });
  });

  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeUndefined();

  await waitFor(() => expect(result.current.state.isFinished).toBe(true));

  expect(result.current.value).toBeUndefined();
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.error?.message).toBe('Invalid testOption value');
});

test('useCaseState() aborting the case does not change a case state', async () => {
  const caseFactory = () => TestCase.create({ testOption: 'double' });
  const { result } = renderHook(() => useCaseState(caseFactory));

  // execute the case
  act(() => {
    result.current.run({ runParam: 3 });
  });

  expect(result.current.state.isPending).toBe(true);

  result.current.abort();

  // be sure the case is finished
  await waitPlease(20);

  // nothing changed
  expect(result.current.error).toBeUndefined();
  expect(result.current.value).toBeUndefined();
  expect(result.current.state.isPending).toBe(true);
});
