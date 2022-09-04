import { useCallback } from 'react';
import { useAsyncState } from './useAsyncState';
import { ReduxCaseFactory, useObjReduxCase } from './useObjReduxCase';

export function useObjReduxCaseState<Res, Err, S, P>(
  caseFactory: ReduxCaseFactory<Res, Err, S, P>,
  origin?: string,
) {
  const runReduxCase = useObjReduxCase(caseFactory, origin);

  const { value, error, origin: stateOrigin, state, actions } = useAsyncState<Res, Err>();
  const { start, reject, resolve } = actions;

  const run = useCallback(
    async (runParams: P, runOrigin?: string) => {
      const caseOrigin = runOrigin || origin;
      start(caseOrigin);
      const result = await runReduxCase(runParams, caseOrigin);
      if (result.isErr()) {
        reject(result.error, result.origin);
      } else {
        resolve(result.value, result.origin);
      }
      return result;
    },
    [origin, reject, resolve, runReduxCase, start],
  );

  return { value, error, origin: stateOrigin, state, actions, run };
}
