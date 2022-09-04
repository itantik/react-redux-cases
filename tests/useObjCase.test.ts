import { renderHook } from '@testing-library/react-hooks';
import { err, Ok, ok, Result, useObjCase } from '../src';

type CaseOptions = { testOption: string };

class SyncObjCase {
  private options: CaseOptions;

  constructor(options: CaseOptions) {
    this.options = options;
  }

  // case factory
  static create(options: CaseOptions) {
    return new SyncObjCase(options);
  }

  execute(runParams: { runParam: number }, origin?: string) {
    switch (this.options.testOption) {
      case 'double':
        return ok(`Double - ${runParams.runParam * 2}`, origin);
      case 'triple':
        return ok(`Triple - ${runParams.runParam * 3}`, origin);
      default:
        return err(new Error('error'), origin);
    }
  }
}

test('useObjCase: creates the case function', async () => {
  const { result } = renderHook(() =>
    useObjCase(() => SyncObjCase.create({ testOption: 'test option' }), 'testOrigin'),
  );
  expect(typeof result.current).toBe('function');
});

test('useObjCase: calls the case methods with right arguments', async () => {
  const executeMock = jest.spyOn(SyncObjCase.prototype, 'execute');
  const createMock = jest.spyOn(SyncObjCase, 'create');

  const caseFactory = () => SyncObjCase.create({ testOption: 'test option' });
  const { result } = renderHook(() => useObjCase(caseFactory, 'testOrigin'));
  result.current({ runParam: 5 }) as Result<boolean, Error>;

  expect(createMock.mock.calls.length).toBe(1);
  expect(createMock.mock.calls[0][0]).toStrictEqual({ testOption: 'test option' });

  expect(executeMock.mock.calls.length).toBe(1);
  expect(executeMock.mock.calls[0][0]).toStrictEqual({ runParam: 5 });
  expect(executeMock.mock.calls[0][1]).toBe('testOrigin');
});

test('useObjCase: returns right result', async () => {
  const caseFactory = () => SyncObjCase.create({ testOption: 'double' });
  const { result } = renderHook(() => useObjCase(caseFactory, 'testOrigin'));

  const caseResult1 = result.current({ runParam: 5 }) as Result<boolean, Error>;
  expect(caseResult1.isOk() && caseResult1.value).toBe('Double - 10');
  expect(caseResult1).toBeInstanceOf(Ok);

  const caseResult2 = result.current({ runParam: 3 }) as Result<boolean, Error>;
  expect(caseResult2.isOk() && caseResult2.value).toBe('Double - 6');
  expect(caseResult2).toBeInstanceOf(Ok);
});

test('useObjCase: calls the case function with different origin', async () => {
  const caseFactory = () => SyncObjCase.create({ testOption: 'triple' });
  const { result } = renderHook(() => useObjCase(caseFactory, 'testOrigin'));

  const caseResult1 = result.current({ runParam: 5 }) as Result<boolean, Error>;
  expect(caseResult1).toBeInstanceOf(Ok);
  expect(caseResult1.isOk()).toBe(true);
  expect(caseResult1.isOk() && caseResult1.value).toBe('Triple - 15');
  expect(caseResult1.origin).toBe('testOrigin');

  const caseResult2 = result.current({ runParam: 3 }, 'runOrigin') as Result<boolean, Error>;
  expect(caseResult2).toBeInstanceOf(Ok);
  expect(caseResult2.isOk()).toBe(true);
  expect(caseResult2.isOk() && caseResult2.value).toBe('Triple - 9');
  expect(caseResult2.origin).toBe('runOrigin');
});
