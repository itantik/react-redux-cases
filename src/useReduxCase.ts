import { useCallback, useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { Dispatch } from 'redux';
import { CaseOptions, CaseResult } from './useCase';

export type ReduxCase<Res, Err, S, P, O extends CaseOptions> = (
  dispatch: Dispatch,
  getState: () => S,
  runParams: P,
  options: O,
  origin?: string,
) => CaseResult<Res, Err>;

export function useReduxCase<Res, Err, S, P, O extends CaseOptions>(
  caseFn: ReduxCase<Res, Err, S, P, O>,
  options: O,
  origin?: string,
) {
  const store = useStore();
  const dispatch = store.dispatch;
  const getState = store.getState;

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  return useCallback(
    (runParams: P) => {
      return caseFn(
        dispatch,
        getState,
        runParams,
        optionsRef.current ? { ...optionsRef.current } : optionsRef.current,
        origin,
      );
    },
    [caseFn, dispatch, getState, origin],
  );
}
