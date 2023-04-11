import { useAppSelector } from '../../infrastructure/redux/reduxHooks';
import { Todo } from '../../todo/Todo';

export default function useGetList(): Todo[] {
  return useAppSelector((state) => state.todo.list);
}
