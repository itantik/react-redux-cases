import { InMemoryTodoDB } from './InMemoryTodoDB';
import { Todo } from '../../todo/Todo';
import { TodoApiService } from '../../use-cases/shared/TodoApiService';
import { delayedResponse } from './delayedResponse';

export const InMemoryTodoApiService: TodoApiService = {
  list(filter: string, abortSignal?: AbortSignal) {
    console.log('API: list');
    return delayedResponse(() => ({ data: InMemoryTodoDB.list(filter) }), abortSignal);
  },

  add(todo: Todo, abortSignal?: AbortSignal) {
    console.log('API: add', todo);
    return delayedResponse(() => InMemoryTodoDB.add(todo), abortSignal);
  },

  remove(todoId: string, abortSignal?: AbortSignal) {
    console.log('API: remove', todoId);
    return delayedResponse(() => InMemoryTodoDB.remove(todoId), abortSignal);
  },
};
