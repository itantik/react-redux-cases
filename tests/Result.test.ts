import { Err, err, Ok, ok, Result } from '../src/index';

function createResult(isOk: boolean): Result<number, string> {
  if (isOk) {
    return new Ok(1);
  } else {
    return new Err('It failed');
  }
}

test('create Ok Result', () => {
  const result = createResult(true);

  expect(result).toBeInstanceOf(Ok);
  expect(result.isOk()).toBe(true);
  expect(result.isErr()).toBe(false);
  expect(result.isOk() && result.value).toBe(1);
});

test('create Err Result', () => {
  const result = createResult(false);

  expect(result).toBeInstanceOf(Err);
  expect(result.isOk()).toBe(false);
  expect(result.isErr()).toBe(true);
  expect(result.isErr() && result.error).toBe('It failed');
});

describe('ok() creates an instance of Ok', () => {
  test.each([undefined, null, 1, false, true, 'hello'])('ok(%s)', value => {
    const okValue = ok(value);

    expect(okValue).toBeInstanceOf(Ok);
    expect(okValue.value).toBe(value);
  });
});

test('err() creates an instance of Err', () => {
  const errObj = new Error('It failed');
  const errResult = err(errObj);

  expect(errResult).toBeInstanceOf(Err);
  expect(errResult.error).toBeInstanceOf(Error);
  expect(errResult.error).toStrictEqual(errObj);
});
