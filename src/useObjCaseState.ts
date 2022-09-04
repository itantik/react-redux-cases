import { useCallback } from 'react';
import { useAsyncState } from './useAsyncState';
import { CaseFactory, useObjCase } from './useObjCase';

export function useObjCaseState<Res, Err, P>(
  caseFactory: CaseFactory<Res, Err, P>,
  origin?: string,
) {
  const runCase = useObjCase(caseFactory, origin);

  const { value, error, origin: stateOrigin, state, actions } = useAsyncState<Res, Err>();
  const { start, reject, resolve } = actions;

  const run = useCallback(
    async (runParams: P, runOrigin?: string) => {
      const caseOrigin = runOrigin || origin;
      start(caseOrigin);
      const result = await runCase(runParams, caseOrigin);
      if (result.isErr()) {
        reject(result.error, result.origin);
      } else {
        resolve(result.value, result.origin);
      }
      return result;
    },
    [origin, reject, resolve, runCase, start],
  );

  return { value, error, origin: stateOrigin, state, actions, run };
}
