import { useEffect } from 'react';
import { useReduxCaseState } from 'react-redux-cases';
import SynchronizeListCase from './SynchronizeListCase';
import { useAppSelector } from '../../infrastructure/redux/reduxHooks';

export default function useSynchronizeList() {
  const dirty = useAppSelector(state => state.todo.dirty);
  const { run, abort, error, state } = useReduxCaseState(SynchronizeListCase.create);

  useEffect(() => {
    run();

    return () => {
      // aborting all running requests
      // e.g. when dirty is incremented
      abort();
    };
  }, [abort, run, dirty]);

  return { error, state };
}
