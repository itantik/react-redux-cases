import { Case, ok } from 'react-redux-cases';
import { AppDispatch, AppGetState } from '../../infrastructure/redux/reduxStore';
import { updateFilter } from '../../todo/todoReducer';

export default class FilterCase implements Case {
  constructor(private dispatch: AppDispatch, private getState: AppGetState) {}

  static create(dispatch: AppDispatch, getState: AppGetState) {
    return new FilterCase(dispatch, getState);
  }

  async execute(filter: string) {
    this.dispatch(updateFilter(filter));

    return ok(filter);
  }
}
