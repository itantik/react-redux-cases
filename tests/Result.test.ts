import { Err, err, Ok, ok } from '../src/index';

describe('create Ok result', () => {
  test.each([undefined, null, 1, false, true, 'hello'])('ok(%s)', (value) => {
    const okValue = ok(value);

    expect(okValue).toBeInstanceOf(Ok);
    expect(okValue.isOk()).toBe(true);
    expect(okValue.isErr()).toBe(false);
    expect(okValue.value).toBe(value);
  });
});

test('create Err result', () => {
  const errObj = new Error('It failed');
  const errResult = err(errObj);

  expect(errResult).toBeInstanceOf(Err);
  expect(errResult.isOk()).toBe(false);
  expect(errResult.isErr()).toBe(true);
  expect(errResult.error).toStrictEqual(errObj);
});
