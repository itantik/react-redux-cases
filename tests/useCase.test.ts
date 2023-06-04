import { renderHook } from '@testing-library/react';
import { Err, Ok, useCase } from '../src';
import { TestCase } from './TestCase';

test('useCase() creates the case function', async () => {
  const { result } = renderHook(() =>
    useCase(() => TestCase.create({ testOption: 'test option' })),
  );
  expect(typeof result.current.run).toBe('function');
  expect(typeof result.current.abort).toBe('function');
});

test('useCase() calls the factory method when executes the case', async () => {
  const createMock = jest.spyOn(TestCase, 'create');
  const caseFactory = () => TestCase.create({ testOption: 'test option' });

  const { result } = renderHook(() => useCase(caseFactory));

  // no calls yet
  expect(createMock.mock.calls.length).toBe(0);

  // execute the case
  await result.current.run({ runParam: 5 });

  expect(createMock.mock.calls.length).toBe(1);
  expect(createMock.mock.calls[0][0]).toStrictEqual({ testOption: 'test option' });
});

test('useCase() calls the execute method', async () => {
  const executeMock = jest.spyOn(TestCase.prototype, 'execute');

  const { result } = renderHook(() => useCase(TestCase.create));
  // execute the case
  await result.current.run({ runParam: 5 });

  expect(executeMock.mock.calls.length).toBe(1);
  expect(executeMock.mock.calls[0][0]).toStrictEqual({ runParam: 5 });
});

test('useCase() executes with Ok result', async () => {
  const caseFactory = () => TestCase.create({ testOption: 'double' });
  const { result } = renderHook(() => useCase(caseFactory));

  // execute the case
  const caseResult1 = await result.current.run({ runParam: 5 });
  expect(caseResult1.isOk() && caseResult1.value).toBe('Double - 10');
  expect(caseResult1).toBeInstanceOf(Ok);
  expect(caseResult1.isErr()).toBe(false);

  // execute the case
  const caseResult2 = await result.current.run({ runParam: 3 });
  expect(caseResult2.isOk() && caseResult2.value).toBe('Double - 6');
  expect(caseResult2).toBeInstanceOf(Ok);
});

test('useCase() executes with Err result', async () => {
  const caseFactory = () => TestCase.create({ testOption: 'unsupported' });
  const { result } = renderHook(() => useCase(caseFactory));

  // execute the case
  const caseResult = await result.current.run({ runParam: 1 });
  expect(caseResult).toBeInstanceOf(Err);
  expect(caseResult.isErr() && caseResult.error).toBeInstanceOf(Error);
  expect(caseResult.isErr() && caseResult.error.message).toBe('Invalid testOption value');
  expect(caseResult.isOk()).toBe(false);
});

test('useCase() calls the onAbort method when aborts the case', async () => {
  const onAbortMock = jest.spyOn(TestCase.prototype, 'onAbort');

  const { result } = renderHook(() => useCase(TestCase.create));

  // execute the case
  const caseResult = result.current.run({ runParam: 5 });

  result.current.abort();

  expect(onAbortMock.mock.calls.length).toBe(1);

  const caseResultAwaited = await caseResult;
  expect(caseResultAwaited.isErr() && caseResultAwaited.error).toBeInstanceOf(Error);
  expect(caseResultAwaited.isErr() && caseResultAwaited.error.message).toBe('Aborted');
});
