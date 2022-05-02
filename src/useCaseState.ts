import { useCallback } from 'react';
import { Case, CaseOptions, useCase } from './useCase';
import { useAsyncState } from './useAsyncState';

export function useCaseState<Res, Err, P, O extends CaseOptions>(
  caseFn: Case<Res, Err, P, O>,
  options: O,
  origin?: string,
) {
  const runCase = useCase(caseFn, options, origin);

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
      const result = await runCase(runParams);
      if (result.isErr()) {
        reject(result.error, result.origin);
      } else {
        resolve(result.value, result.origin);
      }
      return result;
    },
    [origin, reject, resolve, runCase, start],
  );

  return { value, error, origin: stateOrigin, state, run };
}
