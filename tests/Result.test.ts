import { Err, err, Ok, ok } from '../src/index';

describe('create Ok result', () => {
  test.each([
    [undefined, undefined],
    [null, undefined],
    [1, undefined],
    [undefined, 'origin undefined'],
    [false, 'origin false'],
    [true, 'origin true'],
    [1, 'origin 1'],
    ['hello', 'origin hello'],
  ])("ok(%s, '%s')", (value, origin) => {
    const okValue = ok(value, origin);

    expect(okValue).toBeInstanceOf(Ok);
    expect(okValue.isOk()).toBe(true);
    expect(okValue.isErr()).toBe(false);
    expect(okValue.value).toBe(value);
    expect(okValue.origin).toBe(origin);
  });

  test("ok(object, 'origin object')", () => {
    const obj = {
      name: 'Joe',
      surname: 'Doe',
    };
    const okValue = ok(obj, 'origin object');

    expect(okValue).toBeInstanceOf(Ok);
    expect(okValue.isOk()).toBe(true);
    expect(okValue.isErr()).toBe(false);
    expect(okValue.value).toStrictEqual(obj);
    expect(okValue.origin).toBe('origin object');
  });
});

test("create Err result", () => {
  const errObj = new Error('It failed');
  const errValue = err(errObj, 'origin error');

  expect(errValue).toBeInstanceOf(Err);
  expect(errValue.isOk()).toBe(false);
  expect(errValue.isErr()).toBe(true);
  expect(errValue.error).toStrictEqual(errObj);
  expect(errValue.origin).toBe('origin error');
});
