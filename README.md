# react-redux-cases

Separating async business logic from user interface in React applications. Especially in those that use [Redux](https://redux.js.org/).

## Installation

    $ npm install react-redux-cases

Requires `react-redux`.

## Example

In this example, we will show a use-case that requires access to the redux store and async state watching.

Imagine that an application displays a filtered list of user tasks. Our case is to get this list. The scenario may look like this:

- get user id from redux store
- get filter string from input
- call REST API service
- send response data to redux store
- watch the state during this process

### 1. Case Function

In terms of the `react-redux-cases` library, the case is a separate function that covers one business logic.

Case gets all the required dependencies: connection to redux store, options and `run` parameters. `dispatch`, `getState` and `options` come from the `useReduxCaseState` hook. `runParams` comes from the `run` function. `origin` comes from the `run` function or the `useReduxCaseState` hook.

Let's make our case function:

```typescript
async function loadTodoListCase(
  dispatch: AppDispatch,
  getState: AppGetState,
  runParams: {
    filter: string;
  },
  options: {},
  origin?: string,
) {
  // get values from run params
  const { filter } = runParams;

  // get values from redux store
  const state = getState();
  const userId = state.user.id;

  // call API
  const result = await getTodoList(userId, filter, origin);

  if (result.isOk()) {
    // dispatch a redux action
    dispatch(updateTodoList(result.value));
  }

  return result;
}
```

Example of API function:

```typescript
async function getTodoList(userId: string, filter: string, origin?: string) {
  try {
    const response: Awaited<AxiosResponse<Todo[]>> = await axios({
      url: 'user-list',
      params: { userId, filter },
    });
    return ok(response.data, origin);
  } catch (e) {
    return err(e, origin);
  }
}
```

The function returns the `Result` object.

A real application may call API services with its own perfectly tuned function. In this case, we can pass this helper function in the `options` parameter.

### 2. Connection With a Component

We will use one of the prepared hooks. We can choose from four hooks depending on whether we need access to redux store and/or watch the state of the async process. In this example, we need both.

```typescript
function useLoadTodoList() {
  return useReduxCaseState(loadTodoListCase, {});
}
```

Moreover, if the case requires it, we can pass additional values via the second parameter.

The `useReduxCaseState` hook wraps our case, passes everything it needs and returns a state object:

- `value` - a data from API response; undefined if not resolved
- `error` - an error; undefined if not rejected
- `origin` - identification of the place from which the request originated; it comes from the case, if we defined it
- `state`:
  - `state` - `StateType`
  - `isInitial` - the case has not yet started
  - `isPending` - the case has been started
  - `isResolved` - the case was successfully resolved
  - `isRejected` - the case failed
  - `isFinished` - the case is finished, i.e. isResolved or isRejected
- `run` - this function is used by the component or other hooks to call the case

### 3. Use in Component

Simplified component:

```typescript
// in this example, list data comes from redux store
const TodoList = ({ list }: { list: Todo[] }) => {
  const { run, error, state } = useLoadTodoList();
  const { isPending, isRejected } = state;

  const [filter, setFilter] = useState('');

  const handleChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    // run our case
    run({ filter: newFilter });
  };

  return (
    <>
      <div>
        <label>
          Filter:
          <input type="text" name="filter" value={filter} onChange={handleChangeFilter} />
        </label>
      </div>

      {isPending && <div>Loading...</div>}
      {isRejected && <div>Loading failed: {String(error)}</div>}

      <List list={list}>
    </>
  );
};
```

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
    state: StateType;
    isInitial: boolean;
    isPending: boolean;
    isResolved: boolean;
    isRejected: boolean;
    isFinished: boolean;
  };
  run: (runParams: P, runOrigin?: string) => Promise<Result<Res, Err>>;
};
```

`ReduxCase` obtains the redux `dispatch` and `getState` functions with additional arguments. `useReduxCaseState` passes all arguments to the case function. `runParams` comes from the `run` function.

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
): (runParams: P, runOrigin?: string) => CaseResult<Res, Err>;
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
    state: StateType;
    isInitial: boolean;
    isPending: boolean;
    isResolved: boolean;
    isRejected: boolean;
    isFinished: boolean;
  };
  run: (runParams: P, runOrigin?: string) => Promise<Result<Res, Err>>;
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
): (runParams: P, runOrigin?: string) => CaseResult<Res, Err>;
```

### Result

Union object of the result value or error.

```typescript
type Result<V, E> = Ok<V, E> | Err<V, E>;
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

### useAsyncState

Monitoring of the state of the async function call, with the result and error value and the origin identifier.

```typescript
function useAsyncState<V, E>(): {
  state: {
    state: StateType;
    isInitial: boolean;
    isPending: boolean;
    isResolved: boolean;
    isRejected: boolean;
    isFinished: boolean;
  };
  origin: string | undefined;
  value: V | undefined;
  error: E | undefined;
  start: (origin?: string) => void;
  resolve: (value: V, origin?: string) => void;
  reject: (error: E, origin?: string) => void;
  reset: () => void;
};
```

## License

MIT
