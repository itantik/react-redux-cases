import { Case } from 'react-redux-cases';
import { AppDispatch, AppGetState } from '../../infrastructure/redux/reduxStore';
import { updateList } from '../../todo/todoReducer';
import { apiResult } from '../shared/apiResult';
import { TodoApiService } from '../shared/TodoApiService';
import { InMemoryTodoApiService } from '../../infrastructure/api/InMemoryTodoApiService';

export default class SynchronizeListCase implements Case {
  constructor(
    private dispatch: AppDispatch,
    private getState: AppGetState,
    private apiService: TodoApiService,
    private abortController: AbortController,
  ) {}

  static create(
    dispatch: AppDispatch,
    getState: AppGetState,
    apiService: TodoApiService = InMemoryTodoApiService,
    abortController: AbortController = new AbortController(),
  ) {
    return new SynchronizeListCase(dispatch, getState, apiService, abortController);
  }

  async execute(_: void) {
    const filter = this.getState().todo.filter;

    // send API request
    const result = await apiResult(this.apiService.list, filter, this.abortController.signal);

    if (result.isErr()) {
      console.log('SynchronizeListCase:', result.error);
      return result;
    }

    // update redux store
    this.dispatch(updateList(result.value.data));

    return result;
  }

  onAbort() {
    this.abortController.abort();
  }
}
