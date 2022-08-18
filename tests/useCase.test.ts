import { renderHook } from '@testing-library/react-hooks';
import { Err, err, Ok, ok, Result, useCase } from '../src';

function syncCaseFn(
  runParams: { runParam: number },
  options: { testOption?: string },
  origin?: string,
) {
  switch (options.testOption) {
    case 'double':
      return ok(`Double - ${runParams.runParam * 2}`, origin);
    case 'triple':
      return ok(`Triple - ${runParams.runParam * 3}`, origin);
    default:
      return err(new Error('error'), origin);
  }
}

test('useCase: creates the case function', async () => {
  const { result } = renderHook(options => useCase(syncCaseFn, options, 'testOrigin'), {
    initialProps: {},
  });
  expect(typeof result.current).toBe('function');
});

test('useCase: calls the case function with right arguments', async () => {
  const mockCase = jest.fn(syncCaseFn);
  const { result } = renderHook(options => useCase(mockCase, options, 'testOrigin'), {
    initialProps: { testOption: 'test option' },
  });
  result.current({ runParam: 5 }) as Result<boolean, Error>;
  expect(mockCase.mock.calls.length).toBe(1);
  expect(mockCase.mock.calls[0][0]).toStrictEqual({ runParam: 5 });
  expect(mockCase.mock.calls[0][1]).toStrictEqual({ testOption: 'test option' });
  expect(mockCase.mock.calls[0][2]).toBe('testOrigin');
});

test('useCase: returns right result', async () => {
  const { result } = renderHook(options => useCase(syncCaseFn, options, 'testOrigin'), {
    initialProps: { testOption: 'double' },
  });
  const caseResult1 = result.current({ runParam: 5 }) as Result<boolean, Error>;
  expect(caseResult1.isOk() && caseResult1.value).toBe('Double - 10');
  expect(caseResult1).toBeInstanceOf(Ok);

  const caseResult2 = result.current({ runParam: 3 }) as Result<boolean, Error>;
  expect(caseResult2.isOk() && caseResult2.value).toBe('Double - 6');
  expect(caseResult2).toBeInstanceOf(Ok);
});

test('useCase: calls the case function with different origin and options argument', async () => {
  const { result, rerender } = renderHook(options => useCase(syncCaseFn, options, 'testOrigin'), {
    initialProps: { testOption: 'double' },
  });
  const caseResult1 = result.current({ runParam: 5 }) as Result<boolean, Error>;
  expect(caseResult1).toBeInstanceOf(Ok);
  expect(caseResult1.isOk()).toBe(true);
  expect(caseResult1.isOk() && caseResult1.value).toBe('Double - 10');
  expect(caseResult1.origin).toBe('testOrigin');

  rerender({ testOption: 'triple' });
  const caseResult2 = result.current({ runParam: 5 }) as Result<boolean, Error>;
  expect(caseResult2).toBeInstanceOf(Ok);
  expect(caseResult2.isOk()).toBe(true);
  expect(caseResult2.isOk() && caseResult2.value).toBe('Triple - 15');
  expect(caseResult2.origin).toBe('testOrigin');

  rerender({ testOption: 'error' });
  const caseResult3 = result.current({ runParam: 5 }, 'runOrigin') as Result<boolean, Error>;
  expect(caseResult3).toBeInstanceOf(Err);
  expect(caseResult3.isErr()).toBe(true);
  expect(caseResult3.isErr() && caseResult3.error.message).toBe('error');
  expect(caseResult3.origin).toBe('runOrigin');
});
