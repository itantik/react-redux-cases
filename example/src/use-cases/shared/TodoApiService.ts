import { Todo } from '../../todo/Todo';
import { ApiAsyncFn } from './ApiAsyncFn';

export interface TodoApiService {
  list: ApiAsyncFn<{ data: Todo[] }, string>;
  add: ApiAsyncFn<void, Todo>;
  remove: ApiAsyncFn<void, string>;
}
