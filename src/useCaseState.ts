import { useCallback } from 'react';
import { Case, CaseOptions, useCase } from './useCase';
import { useAsyncState } from './useAsyncState';

export function useCaseState<Res, Err, P, O extends CaseOptions>(
  caseFn: Case<Res, Err, P, O>,
  options: O,
  origin?: string,
) {
  const runCase = useCase(caseFn, options, origin);

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
