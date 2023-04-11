import React from 'react';
import useSynchronizeList from '../../use-cases/synchronizeList/useSynchronizeList';
import { AddTodoForm } from './AddTodoForm';
import { ErrorBox } from './ErrorBox';
import { Loader } from './Loader';
import { TodoList } from './TodoList';
import { Filter } from './Filter';

export function TodoPage() {
  const { state, error } = useSynchronizeList();

  return (
    <div className="page">
      <h1>Todo List</h1>
      <Filter />
      <Loader>{state.isPending ? '...loading...' : <>&nbsp;</>}</Loader>
      {!state.isPending && error && <ErrorBox>{String(error)}</ErrorBox>}
      <TodoList />
      <AddTodoForm />
    </div>
  );
}
