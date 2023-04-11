import React from 'react';
import useGetList from '../../use-cases/getList/useGetList';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const todoList = useGetList();

  return (
    <>
      {!todoList.length && (
        <div className='empty'>Empty list.</div>
      )}

      {todoList.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </>
  );
}
