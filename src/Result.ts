export class Ok<V, E> {
  /**
   * @param value - result value
   * @param origin - identifies the origin from which the result came
   */
  constructor(readonly value: V, readonly origin?: string) {}

  isOk(): this is Ok<V, E> {
    return true;
  }

  isErr(): this is Err<V, E> {
    return false;
  }
}

export class Err<V, E> {
  /**
   * @param error - result error
   * @param origin - identifies the origin from which the result came
   */
  constructor(readonly error: E, readonly origin?: string) {}

  isOk(): this is Ok<V, E> {
    return false;
  }

  isErr(): this is Err<V, E> {
    return true;
  }
}

export type Result<V, E> = Ok<V, E> | Err<V, E>;

export function ok<V, E = never>(value: V, origin?: string): Ok<V, E> {
  return new Ok(value, origin);
}

export function err<E, V = never>(error: E, origin?: string): Err<V, E> {
  return new Err(error, origin);
}
