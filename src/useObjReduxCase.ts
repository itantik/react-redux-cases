import { useCallback, useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { Dispatch } from 'redux';
import { ObjCase } from './useObjCase';

export type ReduxCaseFactory<Res, Err, S, P> = (
  dispatch: Dispatch,
  getState: () => S,
) => ObjCase<Res, Err, P>;

export function useObjReduxCase<Res, Err, S, P>(
  caseFactory: ReduxCaseFactory<Res, Err, S, P>,
  origin?: string,
) {
  const factoryRef = useRef(caseFactory);
  useEffect(() => {
    factoryRef.current = caseFactory;
  });

  const { dispatch, getState } = useStore();

  return useCallback(
    (runParams: P, runOrigin?: string) => {
      const objCase = factoryRef.current(dispatch, getState);
      return objCase.execute(runParams, runOrigin || origin);
    },
    [dispatch, getState, origin],
  );
}
