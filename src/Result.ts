export class Ok<R, E> {
  /**
   * @param value - result value
   * @param origin - identifies the origin from which the result came
   */
  constructor(readonly value: R, readonly origin?: string) {}

  isOk(): this is Ok<R, E> {
    return true;
  }

  isErr(): this is Err<R, E> {
    return false;
  }
}

export class Err<R, E> {
  /**
   * @param error - result error
   * @param origin - identifies the origin from which the result came
   */
  constructor(readonly error: E, readonly origin?: string) {}

  isOk(): this is Ok<R, E> {
    return false;
  }

  isErr(): this is Err<R, E> {
    return true;
  }
}

export type Result<R, E> = Ok<R, E> | Err<R, E>;

export function ok<R, E = never>(value: R, origin?: string): Ok<R, E> {
  return new Ok(value, origin);
}

export function err<E, R = never>(error: E, origin?: string): Err<R, E> {
  return new Err(error, origin);
}
