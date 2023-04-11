import { Case } from 'react-redux-cases';
import { AppDispatch, AppGetState } from '../../infrastructure/redux/reduxStore';
import SynchronizeListCase from '../synchronizeList/SynchronizeListCase';
import { Todo } from '../../todo/Todo';
import { apiResult } from '../shared/apiResult';
import { TodoApiService } from '../shared/TodoApiService';
import { InMemoryTodoApiService } from '../../infrastructure/api/InMemoryTodoApiService';

export default class AddItemCase implements Case {
  constructor(
    private dispatch: AppDispatch,
    private getState: AppGetState,
    private apiService: TodoApiService,
    private synchronizeCase: SynchronizeListCase,
  ) {}

  static create(
    dispatch: AppDispatch,
    getState: AppGetState,
    apiService: TodoApiService = InMemoryTodoApiService,
  ) {
    const synchronizeCase = SynchronizeListCase.create(
      dispatch,
      getState,
      apiService,
      new AbortController(),
    );
    return new AddItemCase(dispatch, getState, apiService, synchronizeCase);
  }

  async execute(todoItem: Todo) {
    // send API request
    const addResult = await apiResult(this.apiService.add, todoItem);
    if (addResult.isErr()) {
      console.log('AddItemCase:', addResult.error);
      return addResult;
    }

    // Now we need to update the todo list.
    // We have two possible ways to do it:

    // 1. chaining of cases
    const synchronizeResult = await this.synchronizeCase.execute();
    if (synchronizeResult.isErr()) {
      return synchronizeResult;
    }

    // 2. instead of chaining, we could increment the `dirty` flag
    // this.dispatch(setDirty());

    return addResult;
  }
}
