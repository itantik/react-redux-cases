import { useCallback, useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { useAbortable } from './useAbortable';
import { useAsyncState } from './useAsyncState';
import { ReduxCaseFactory } from './useReduxCase';

export function useReduxCaseState<Res, Err, S, P>(caseFactory: ReduxCaseFactory<Res, Err, S, P>) {
  const factoryRef = useRef(caseFactory);
  useEffect(() => {
    factoryRef.current = caseFactory;
  });

  const { watch, unwatch, watched, abort } = useAbortable();

  const { dispatch, getState } = useStore<S>();

  const { value, error, state, actions } = useAsyncState<Res, Err>();
  const { start, reject, resolve } = actions;

  const run = useCallback(
    async (runParams: P) => {
      const objCase = factoryRef.current(dispatch, getState);
      if (watch(objCase)) {
        start();
      }
      const result = await objCase.execute(runParams);
      const aborted = !watched(objCase);
      unwatch(objCase);

      if (!aborted) {
        if (result.isErr()) {
          reject(result.error);
        } else {
          resolve(result.value);
        }
      }
      return result;
    },
    [dispatch, getState, reject, resolve, start, unwatch, watch, watched],
  );

  return { value, error, state, actions, run, abort };
}
