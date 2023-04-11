import { Case } from 'react-redux-cases';
import { AppDispatch, AppGetState } from '../../infrastructure/redux/reduxStore';
import { apiResult } from '../shared/apiResult';
import { removeItem, setDirty } from '../../todo/todoReducer';
import { TodoApiService } from '../shared/TodoApiService';
import { InMemoryTodoApiService } from '../../infrastructure/api/InMemoryTodoApiService';

export default class RemoveItemCase implements Case {
  constructor(
    private dispatch: AppDispatch,
    private getState: AppGetState,
    private apiService: TodoApiService,
  ) {}

  static create(
    dispatch: AppDispatch,
    getState: AppGetState,
    apiService: TodoApiService = InMemoryTodoApiService,
  ) {
    return new RemoveItemCase(dispatch, getState, apiService);
  }

  async execute(todoId: string) {
    // optimistic update - remove the item immediately
    this.dispatch(removeItem(todoId));

    // send API request
    const removeResult = await apiResult(this.apiService.remove, todoId);
    if (removeResult.isErr()) {
      console.log('RemoveItemCase:', removeResult.error);
    }

    // now we need to update the todo list
    this.dispatch(setDirty());

    return removeResult;
  }
}
