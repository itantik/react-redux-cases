export class Ok<V> {
  /**
   * @param value - result value
   */
  constructor(readonly value: V) {}

  isOk(): this is Ok<V> {
    return true;
  }

  isErr(): this is never {
    return false;
  }
}

export class Err<E> {
  /**
   * @param error - result error
   */
  constructor(readonly error: E) {}

  isOk(): this is never {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }
}

export type Result<V, E> = Ok<V> | Err<E>;

export function ok<V>(value: V): Ok<V> {
  return new Ok(value);
}

export function err<E>(error: E): Err<E> {
  return new Err(error);
}
