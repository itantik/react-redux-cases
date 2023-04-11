import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import useAddItem from '../../use-cases/addItem/useAddItem';
import { ErrorBox } from './ErrorBox';
import { Loader } from './Loader';

export function AddTodoForm() {
  const [title, setTitle] = useState('');

  const { run, state, error, actions } = useAddItem();

  const handleCloseError = () => {
    actions.reset();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await run({ id: uuid(), title });
    if (result.isOk()) {
      // reset form input
      setTitle('');
    }
  };

  return (
    <div className="input-row">
      {state.isPending ? (
        <Loader>...sending...</Loader>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            placeholder="New todo item..."
            onChange={event => setTitle(event.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      )}
      {!state.isPending && error && <ErrorBox onClose={handleCloseError}>{String(error)}</ErrorBox>}
    </div>
  );
}
