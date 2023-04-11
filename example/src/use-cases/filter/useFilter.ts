import { useReduxCase } from 'react-redux-cases';
import FilterCase from './FilterCase';
import { useAppSelector } from '../../infrastructure/redux/reduxHooks';

export default function useFilter() {
  const filter = useAppSelector(state => state.todo.filter);
  const { run } = useReduxCase(FilterCase.create);

  return { filter, updateFilter: run };
}
