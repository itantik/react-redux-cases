import React from 'react';
import useRemoveItem from '../../use-cases/removeItem/useRemoveItem';
import { Todo } from '../Todo';

type Props = {
  todo: Todo;
};

export function TodoItem({ todo }: Props) {
  const { run: runRemove } = useRemoveItem();

  const { id, title } = todo;

  const handleRemove = async () => {
    const result = await runRemove(id);
    if (result.isErr()) {
      alert(`TodoItem: ${result.error}`);
    }
  };

  return (
    <div className="todo-item">
      <span className="title">{title}</span>
      <button onClick={handleRemove}>×</button>
    </div>
  );
}
