import { useCallback, useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { Dispatch } from 'redux';
import { useAbortable } from './useAbortable';
import { Case } from './useCase';

export type ReduxCaseFactory<Res, Err, S, P> = (
  dispatch: Dispatch,
  getState: () => S,
) => Case<Res, Err, P>;

export function useReduxCase<Res, Err, S, P>(caseFactory: ReduxCaseFactory<Res, Err, S, P>) {
  const factoryRef = useRef(caseFactory);
  useEffect(() => {
    factoryRef.current = caseFactory;
  });

  const { watch, unwatch, abort } = useAbortable();

  const { dispatch, getState } = useStore<S>();

  const run = useCallback(
    async (runParams: P) => {
      const objCase = factoryRef.current(dispatch, getState);
      watch(objCase);
      const result = await objCase.execute(runParams);
      unwatch(objCase);
      return result;
    },
    [dispatch, getState, unwatch, watch],
  );

  return { run, abort };
}
