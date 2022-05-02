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

  const {
    start,
    reject,
    resolve,
    value,
    error,
    origin: stateOrigin,
    state,
  } = useAsyncState<Res, Err>();

  const run = useCallback(
    async (runParams: P) => {
      start(origin);
      const result = await runReduxCase(runParams);
      if (result.isErr()) {
        reject(result.error, result.origin);
      } else {
        resolve(result.value, result.origin);
      }
      return result;
    },
    [origin, reject, resolve, runReduxCase, start],
  );

  return { value, error, origin: stateOrigin, state, run };
}
