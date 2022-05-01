import { useCallback } from 'react';
import { CaseOptions } from './useCase';
import { useStatus } from './useStatus';
import { ReduxCase, useReduxCase } from './useReduxCase';

export function useReduxCaseStatus<Res, Err, S, P, O extends CaseOptions>(
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
    origin: statusOrigin,
    status,
  } = useStatus<Res, Err>();

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

  return { value, error, origin: statusOrigin, status, run };
}
