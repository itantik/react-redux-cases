# react-redux-cases

Separating async business logic from user interface in React applications. Especially in those that use Redux.

## Installation

    $ npm install react-redux-cases

Requires `react-redux`.

## API

### useReduxCaseState

Creates a `run` callback for dispatching a case along with the result and state object.

```typescript
function useReduxCaseState<Res, Err, S, P, O extends CaseOptions>(
  caseFn: ReduxCase<Res, Err, S, P, O>,
  options: O,
  origin?: string,
): {
  value: Res | undefined;
  error: Err | undefined;
  origin: string | undefined;
  state: {
    state: State;
    isInitial: boolean;
    isPending: boolean;
    isResolved: boolean;
    isRejected: boolean;
    isFinished: boolean;
  };
  run: (runParams: P) => Promise<Result<Res, Err>>;
};
```

`ReduxCase` obtains the redux dispatch and getState functions with additional arguments. `useReduxCaseState` passes all arguments to the case function. `runParams` comes from the `run` function.

```typescript
declare type ReduxCase<Res, Err, S, P, O extends CaseOptions> = (
  dispatch: Dispatch,
  getState: () => S,
  runParams: P,
  options: O,
  origin?: string,
) => CaseResult<Res, Err>;
```

### useReduxCase

Creates a `run` callback for dispatching a case. It is a `useReduxCaseState` variant without state monitoring.

```typescript
function useReduxCase<Res, Err, S, P, O extends CaseOptions, Ex>(
  caseFn: ReduxCase<Res, Err, S, P, O, Ex>,
  options: O,
  origin?: string,
): (runParams: P) => CaseResult<Res, Err>;
```

```typescript
type CaseResult<Res, Err> = Promise<Result<Res, Err>> | Result<Res, Err>;
```

### useCaseState

Creates a `run` callback along with the result and state object. This is a general async case that does not use redux.

```typescript
function useCaseState<Res, Err, P, O extends CaseOptions>(
  caseFn: Case<Res, Err, P, O>,
  options: O,
  origin?: string,
): {
  value: Res | undefined;
  error: Err | undefined;
  origin: string | undefined;
  state: {
    state: State;
    isInitial: boolean;
    isPending: boolean;
    isResolved: boolean;
    isRejected: boolean;
    isFinished: boolean;
  };
  run: (runParams: P) => Promise<Result<Res, Err>>;
};
```

```typescript
type Case<Res, Err, P, O extends CaseOptions> = (
  runParams: P,
  options: O,
  origin?: string,
) => CaseResult<Res, Err>;
```

### useCase

Creates a `run` callback. It is a `useCaseState` variant without state monitoring.

```typescript
function useCase<Res, Err, P, O extends CaseOptions>(
  caseFn: Case<Res, Err, P, O>,
  options: O,
  origin?: string,
): (runParams: P) => CaseResult<Res, Err>;
```

### Result

Union object of the result value or error.

```typescript
type Result<R, E> = Ok<R, E> | Err<R, E>;
```

_Examples:_

```typescript
// Ok result
const result = ok('test value');

if (result.isOk()) {
  // handle result
  console.log(result.value);
}
```

```typescript
// Err result
const result = err('test error message');

if (result.isErr()) {
  // handle error
  console.log(result.error);
}
```

```typescript
// Err result with the origin identifier
const result = err('test error message', 'login-form');

if (result.isErr()) {
  // handle error
  if (result.origin === 'login-form') {
    console.log('login error', result.error);
  } else {
    console.log('unknown error', result.error);
  }
}
```

### useState

Monitoring of the state of the async function call, with the result and error value and the origin identifier.

```typescript
function useState<R, E>(): {
  state: {
    state: State;
    isInitial: boolean;
    isPending: boolean;
    isResolved: boolean;
    isRejected: boolean;
    isFinished: boolean;
  };
  origin: string | undefined;
  value: R | undefined;
  error: E | undefined;
  start: (origin?: string | undefined) => void;
  resolve: (value: R, origin?: string | undefined) => void;
  reject: (error: E, origin?: string | undefined) => void;
  reset: () => void;
};
```

## License

MIT
