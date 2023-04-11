# Sample Application

Example of using the `react-redux-cases` library in a simple application.

## Installation

    $ npm install

### Available Scripts

- `npm start` runs the app in the development mode
- `npm test` launches the test runner in the interactive watch mode
- `npm run build` builds the app for production to the `build` folder

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) TS template.

## Examples

### Hooks

**Todo list synchronization with backend**:

- the `useSynchronizeList` custom hook uses the `useReduxCaseState` hook - [./src/use-cases/synchronizeList/useSynchronizeList.ts](./src/use-cases/synchronizeList/useSynchronizeList.ts)
- case is implemented in `SynchronizeListCase` - [./src/use-cases/synchronizeList/SynchronizeListCase.ts](./src/use-cases/synchronizeList/SynchronizeListCase.ts)
- used in the `TodoPage` component with async state monitoring - [./src/todo/components/TodoPage.tsx](./src/todo/components/TodoPage.tsx)

**Creating a new todo item**:

- the `useAddItem` custom hook uses the `useReduxCaseState` hook - [./src/use-cases/addItem/useAddItem.ts](./src/use-cases/addItem/useAddItem.ts)
- case is implemented in `AddItemCase` - [./src/use-cases/addItem/AddItemCase.ts](./src/use-cases/addItem/AddItemCase.ts)
- used in the `AddTodoForm` component with async state monitoring - [./src/todo/components/AddTodoForm.tsx](./src/todo/components/AddTodoForm.tsx)

**Removing a list item**:

- the `useRemoveItem` custom hook uses the `useReduxCase` hook - [./src/use-cases/removeItem/useRemoveItem.ts](./src/use-cases/removeItem/useRemoveItem.ts)
- case is implemented in `RemoveItemCase` - [./src/use-cases/removeItem/RemoveItemCase.ts](./src/use-cases/removeItem/RemoveItemCase.ts)
- used in the `TodoItem` component - [./src/todo/components/TodoItem.tsx](./src/todo/components/TodoItem.tsx)

**Filtering the todo list**:

- the `useFilter` custom hook uses the `useReduxCase` hook - [./src/use-cases/filter/useFilter.ts](./src/use-cases/filter/useFilter.ts)
- case is implemented in `FilterCase` - [./src/use-cases/filter/FilterCase.ts](./src/use-cases/filter/FilterCase.ts)
- used in the `Filter` component - [./src/todo/components/Filter.tsx](./src/todo/components/Filter.tsx)

### Chaining of Cases

- see `AddItemCase` - [./src/use-cases/addItem/AddItemCase.ts](./src/use-cases/addItem/AddItemCase.ts)

### Aborting of Cases

- see the `useSynchronizeList` custom hook - [./src/use-cases/synchronizeList/useSynchronizeList.ts](./src/use-cases/synchronizeList/useSynchronizeList.ts)

## License

MIT
