import { useCallback } from 'react';
import { CaseOptions } from './useCase';
import { useAsyncState } from './useAsyncState';
import { ReduxCase, useReduxCase } from './useReduxCase';

export function useReduxCaseState<Res, Err, S, P, O extends CaseOptions>(
  caseFn: ReduxCase<Res, Err, S, P, O>,
  options: O,
  origin?: string,
) {
  const runReduxCase = useReduxCase(caseFn, options, origin);

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
