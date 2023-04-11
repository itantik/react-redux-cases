# react-redux-cases

Separating async business logic from user interface in React applications. Especially in those that use [Redux](https://redux.js.org/).

The `react-redux-cases` library helps you extract plain business logic (i.e. cases) into independent classes. Library hooks connect these cases to React components. So it prevents mixing async fetching, state management, UI styling in a component. Instead, your components stay clear and simple.

## Installation

    $ npm install react-redux-cases

Requires [react-redux](https://react-redux.js.org/).

## Usage

### 1. Case Definition

In terms of the `react-redux-cases` library, the case is a separate unit that covers one application feature. We might also call it an application service or a use case.

The case is implemented as a class with interface:

```typescript
interface Case<Res, Err, P> {
  execute(runParams: P): Promise<Result<Res, Err>>;
  onAbort?: () => void;
}
```

**Rule:** the `execute` method must not throw an exception. Instead, it returns the `Promise` of the `Result` object.

Example of `Case`:

```typescript
import { Case } from 'react-redux-cases';
import { AppDispatch, AppGetState, updateList } from './my/app/redux';
import { Todo, apiGetTodoList } from './my/app/todo';

class LoadTodoListCase implements Case {
  private dispatch: AppDispatch;
  private getState: AppGetState;

  // inject all dependencies in constructor
  constructor(dispatch: AppDispatch, getState: AppGetState) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  // static factory method creates the LoadTodoListCase instance
  static create(dispatch: AppDispatch, getState: AppGetState) {
    return new LoadTodoListCase(dispatch, getState);
  }

  // use case implementation
  async execute(todoFilter: string) {
    // get state from redux store
    const userId = this.getState().user.id;

    // call async API
    const result = await apiGetTodoList({ user: userId, filter: todoFilter });

    if (result.isErr()) {
      // manage error
      console.log('SynchronizeTodoListCase:', result.error);

      // return failed result
      return result;
    }

    // manage successful result

    // update redux store
    this.dispatch(updateList(result.value.data));

    // return successful result
    return result;
  }
}
```

The core of this case is the mandatory function `execute`. As we can see, it implements the following scenario:

- get the string `todoFilter` from the function parameter
- get the ID of the user from the redux store
- call the async API service `/list` to get filtered To-Do list data from backend server
- on failure, log an error message
- if successful, update redux store with new To-Do list
- return `Result` object with To-Do list data

This case is separated from the rest of the application. It declares all its dependencies in the `contructor`, making it well testable. Our case requires redux `getState` and `dispatch` methods.

Static factory method `create` is not necessary but it is very useful.

**Rule:** Factory method must create an instance and not throw an exception.

### 2. Case Result

The `execute` method must not throw an exception. Instead, it must return a `Result` object, which is a union type of a success or error value.

```typescript
type Result<V, E> = Ok<V> | Err<E>;
```

The `Ok` object wraps a `value` and offers it via the `result.value` getter.

The `Err` object wraps an `error` and offers it via the `result.error` getter.

Both `Ok` and `Err` objects implement `isOk()` and `isErr()` methods, which act as type guards.

Examples of creating a `Result` instance:

```typescript
import { ok } from 'react-redux-cases';

// Ok result
const okResult = ok('success');

if (okResult.isOk()) {
  console.log(okResult.value); // -> 'success'
}
if (okResult.isErr()) {
  // -> never
}
```

```typescript
import { err } from 'react-redux-cases';

// Err result
const errResult = err('error message');

if (errResult.isErr()) {
  console.log(errResult.error); // -> 'error message'
}
if (errResult.isOk()) {
  // -> never
}
```

Example of an API function that returns a `Result`:

```typescript
/**
 * `apiGetTodoList` function returns the `Result` object
 */
async function apiGetTodoList(
  params: { user: string; filter: string },
  abortController?: AbortController,
) {
  try {
    const response: Awaited<AxiosResponse<Todo[]>> = await axios({
      method: 'get',
      url: 'list',
      params,
      signal: abortController.signal,
    });
    return ok(response.data);
  } catch (e) {
    return err(e);
  }
}

/**
 * usage the `apiGetTodoList` function in `execute` method
 */
class LoadTodoListCase implements Case {
  // ...

  async execute(todoFilter: string) {
    // ...

    // Result object
    const result = await apiGetTodoList({ user: userId, filter: todoFilter });

    if (result.isErr()) {
      // result is Err object
      // do something with result.error

      return result;
    }

    // result is Ok object
    // do something with result.value

    return result;
  }
}
```

No exception, just a simple object.

### 3. Connection With a Component

Cases are independent pieces of code. How can we use them in React components?

As an adapter, we can choose from prepared library hooks `useCase`, `useCaseState`, `useReduxCase`, `useReduxCaseState`.

Each of the hooks gets a Case factory method as a parameter. Factory method must create an instance and not throw an exception.

The `useReduxCaseState` and `useReduxCase` hooks provide the Redux `getState` and `dispatch` methods as parameters for the factory methods.

Examples of factory methods:

```typescript
// 1. example - using the static factory method
const case1 = useReduxCaseState(LoadTodoListCase.create);
```

```typescript
// 2. example - this is the equivalent expression, using a case constructor
const case2 = useReduxCaseState((dispatch, getState) => new LoadTodoListCase(dispatch, getState));
```

```typescript
// 3. example - injecting an additional dependency into case
const additionalDependency = useSomething();
const case3 = useReduxCaseState((dispatch, getState) =>
  LoadTodoListCase.create(dispatch, getState, additionalDependency),
);
```

Each of four hooks creates a `run` function. React component then can call this `run` function to execute the case.

The `run` function instantiates the `Case` object via its factory method, passes it all dependencies, calls the `execute` function with arguments passed to `run` function, and finally returns `Result` object.

Moreover `useCaseState` and `useReduxCaseState` returns `state` object, so that the component can watch the async process state.

Usage in component:

```tsx
import { useReduxCaseState } from 'react-redux-cases';
import { LoadTodoListCase } from './my/app/todo';

// list data comes from redux store
const FilteredTodoList = ({ list }: { list: Todo[] }) => {
  // make connection with our LoadTodoListCase
  const { run, error, state } = useReduxCaseState(LoadTodoListCase.create);

  const handleChangeFilter = (newFilter: string) => {
    // run the execute(newFilter) method of the LoadTodoListCase
    run(newFilter);
  };

  return (
    <>
      <Filter onChange={handleChangeFilter} />

      {state.isPending && <Spinner />}
      {!state.isPending && state.isRejected && <ErrorPanel>{String(error)}</ErrorPanel>}

      <List list={list} />
    </>
  );
};
```

### 4. Comparison of Case Hooks

| Hook                             |          Case Factory          | Async State Monitoring |
| :------------------------------- | :----------------------------: | :--------------------: |
| `useReduxCaseState(caseFactory)` | `(dispatch, getState) => Case` |          Yes           |
| `useReduxCase(caseFactory)`      | `(dispatch, getState) => Case` |           No           |
| `useCaseState(caseFactory)`      |          `() => Case`          |          Yes           |
| `useCase(caseFactory)`           |          `() => Case`          |           No           |

Besides, each hook returns functions:

- `run: async (runParams) => Promise<Result>`
- `abort: () => void`

### 5. Chaining of Cases

Cases may call other cases within the `execute` method. Components call such a compound case once and does not need to trigger a chain of cases using the `useEffect` hook.

Example:

```typescript
class AddTodoItemCase implements Case {
  // ...

  async execute(todoItem: Todo) {
    // call API
    const result = await apiAddTodoItem({ item: todoItem });

    if (result.isErr()) {
      // result is Err object
      // do something with result.error
      return result;
    }

    // New item is created on backend,
    // so we need to update the todo list.

    // Create the LoadTodoListCase:
    const loadCase = LoadTodoListCase.create(this.dispatch, this.getState);
    // and execute it:
    const loadingResult = await loadCase.execute('');
    if (loadingResult.isErr()) {
      return loadingResult;
    }

    return result;
  }
}
```

### 6. Aborting of Cases

The `Case` interface offers `onAbort` method. When the component is unmounted, the `onAbort` method is callled. It is up to you how your case will behave in this situation. A common approach is to use [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) API.

It is also possible to abort the case manually. All four hooks `useCase`, `useCaseState`, `useReduxCase`, `useReduxCaseState` provide an `abort` method that can be called in components.

Example of the `LoadTodoListCase` with `AbortController`:

```typescript
class LoadTodoListCase implements Case {
  private dispatch: AppDispatch;
  private getState: AppGetState;
  private abortController?: AbortController;

  constructor(dispatch: AppDispatch, getState: AppGetState, abortController?: AbortController) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.abortController = abortController;
  }

  static create(dispatch: AppDispatch, getState: AppGetState) {
    return new LoadTodoListCase(dispatch, getState, new AbortController());
  }

  async execute(todoFilter: string) {
    // ...

    // pass the AbortController signal to API
    const result = await apiGetTodoList(
      { user: userId, filter: todoFilter },
      this.abortController?.signal,
    );

    if (result.isErr()) {
      // aborted API request returns an error
      console.log('apiGetTodoList error', result.error);
      // the case ends, so redux is not updated
      return result;
    }

    this.dispatch(updateList(result.value.data));

    return result;
  }

  onAbort() {
    this.abortController?.abort();
  }
}
```

When we type a few characters in the filter input field, a series of request is sent. To prevent a request race, we need to abort old requests every time a new character is typed.

Example of updated `FilteredTodoList` component:

```tsx
const FilteredTodoList = ({ list }: { list: Todo[] }) => {
  const { run, error, state, abort } = useLoadTodoList();

  const handleChangeFilter = (newFilter: string) => {
    // abort previous requests
    abort();
    // make new request
    run(newFilter);
  };

  // ...
};
```

## Example

You can explore and try the [sample application](./example).

## API

### `useReduxCaseState(caseFactory)`

The `useReduxCaseState(caseFactory)` hook returns `run` and `abort` methods and values for state monitoring. Passes the Redux `dispatch` and `getState` methods to `caseFactory` as arguments.

**Parameters**

- `caseFactory`: `(dispatch, getState) => Case` - it must not throw an exception. The returned object should implement the `Case` interface.

**Returns**

Case controlling:

- `run`: `async (runParams) => Promise<Result>` - use the `run(runParams)` method to invoke the `Case` `execute(runParams)` method
- `abort`: `() => void` - calling the `abort()` method invokes the `Case` `onAbort()` method

Async state monitoring:

- `value`: resolved promise value from the `run` method, it is unwrapped `value` of the `Result` object
- `error`: rejected promise value from the `run` method, it is unwrapped `error` of the `Result` object
- `state`: state object
  - `state`: 'initial' | 'pending' | 'resolved' | 'rejected'
  - `isInitial`: boolean - true when no `run` has started
  - `isPending`: boolean - true when `run` method is awaiting
  - `isResolved`: boolean - true when `run` was resolved
  - `isRejected`: boolean - true when `run` was rejected
  - `isFinished`: boolean - true when `run` was resolved or rejected
- `actions`: control the state manually (rarely usable)
  - `start`: `() => void` - marks the state as 'pending'
  - `resolve`: `(value) => void` - marks the state as 'resolved' and sets the resolved `value`
  - `reject`: `(error) => void` - marks the state as 'rejected' and sets the rejected `error` value
  - `reset`: `() => void` - marks the state as 'initial' and resets `value` and `error`

### `useReduxCase(caseFactory)`

The `useReduxCase(caseFactory)` hook returns `run` and `abort` methods. Passes the Redux `dispatch` and `getState` methods to `caseFactory` as arguments.

> This is similar to `useReduxCaseState`, but without state monitoring.

**Parameters**

- `caseFactory`: `(dispatch, getState) => Case`

**Returns**

- `run`: `async (runParams) => Promise<Result>`
- `abort`: `() => void`

### `useCaseState(caseFactory)`

The `useCaseState(caseFactory)` hook returns `run` and `abort` methods and values for state monitoring.

> This is similar to `useReduxCaseState`, but without providing `dispatch` and `getState` methods for `caseFactory`.

**Parameters**

- `caseFactory`: `() => Case`

**Returns**

- `run`: `async (runParams) => Promise<Result>`
- `abort`: `() => void`
- `value`
- `error`
- `state`: `{state, isInitial, isPending, isResolved, isRejected, isFinished}`
- `actions`: `{start, resolve, reject, reset}`

### `useCase(caseFactory)`

The `useCase(caseFactory)` hook returns `run` and `abort` methods.

> This is similar to `useReduxCaseState`, but without providing `dispatch` and `getState` methods for `caseFactory` and without state monitoring.

**Parameters**

- `caseFactory`: `() => Case`

**Returns**

- `run`: `async (runParams) => Promise<Result>`
- `abort`: `() => void`

### `Case`

The `Case` is interface.

**Methods**

- `execute`: `async (runParams) => Result` - async function returns the `Result` object. It must not throw an exception. The `run` method of the hooks calls the `execute` method of the case.
- `onAbort`: `() => void` - method is optional. The `abort` method of the hooks calls the `onAbort` method of the case.

Example:

```typescript
import { Case, ok } from 'react-redux-cases';

class MyCase implements Case {
  constructor(readonly dispatch: AppDispatch, readonly getState: AppGetState) {}

  // static factory method
  static create(dispatch: AppDispatch, getState: AppGetState) {
    return new MyCase(dispatch, getState);
  }

  // use case implementation
  async execute(param: string) {
    // ...

    // return Result
    return ok(someResult);
  }
}
```

### `Result`

`Result` is a union type of the `Ok` or `Err` value.

```typescript
type Result<V, E> = Ok<V> | Err<E>;
```

### `Ok`

Class `Ok` wraps a `value` of any type. To create a new instance, you can use the constructor or helper function `ok(value)`.

Example with constructor:

```typescript
import { Ok } from 'react-redux-cases';
const result = new Ok({ title: 'Success' });
```

Example with `ok(value)` function:

```typescript
import { ok } from 'react-redux-cases';
const result = ok({ title: 'Success' });
```

**Class members**

- `constructor(value)` - the `value` can be of any type
- `value`: readonly value
- `isOk()`: type guard, returns true
- `isErr()`: type guard, returns false

### `Err`

Class `Err` wraps an `error` of any type. To create a new instance, you can use the constructor or helper function `err(error)`.

Example with constructor:

```typescript
import { Err } from 'react-redux-cases';
const result = new Err({ reason: 'Bad credentials' });
```

Example with `err(error)` function:

```typescript
import { err } from 'react-redux-cases';
const result = err({ reason: 'Bad credentials' });
```

**Class members**

- `constructor(error)` - the `error` can be of any type
- `error`: readonly error value
- `isOk()`: type guard, returns false
- `isErr()`: type guard, returns true

### `ok(value)`

The `ok(value)` helper function creates a new instance of the `Ok` class.

- `ok`: `(value) => Ok`

### `err(error)`

The `err(error)` helper function creates a new instance of the `Err` class.

- `err`: `(error) => Err`

### `useAsyncState()`

`useAsyncState()` helps monitor the state of an async process. Hook stores the result value or error of an async process and its current state. It does not control the process itself.

**Returns**

- `value`: resolved value
- `error`: rejected value
- `state`: the state of the async process
  - `state`: 'initial' | 'pending' | 'resolved' | 'rejected'
  - `isInitial`: boolean - true when state is 'initial'
  - `isPending`: boolean - true when state is 'pending'
  - `isResolved`: boolean - true when state was 'resolved'
  - `isRejected`: boolean - true when state was 'rejected'
  - `isFinished`: boolean - true when state was 'resolved' or 'rejected'
- `actions`: setting the state and result
  - `start`: `() => void` - marks the state as 'pending'
  - `resolve`: `(value) => void` - marks the state as 'resolved' and sets the resolved `value`
  - `reject`: `(error) => void` - marks the state as 'rejected' and sets the rejected `error` value
  - `reset`: `() => void` - marks the state as 'initial' and resets `value` and `error` to `undefined`

## Upgrading from version 0.x

Although the purpose of this library has remained the same, it is not backward compatible with version 0.x. With care and appropriate effort, you can rewrite v0 hooks for object cases (`useObjReduxCaseState`, `useObjReduxCase`, `useObjCaseState`, `useObjCase`) with v1 hooks and cases. Hooks for functional cases are removed, so a refactoring to v1 object cases is necessary.

## License

MIT
