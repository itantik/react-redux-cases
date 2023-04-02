import { useCallback, useEffect, useRef } from 'react';
import { useAbortable } from './useAbortable';
import { useAsyncState } from './useAsyncState';
import { CaseFactory } from './useCase';

export function useCaseState<Res, Err, P>(caseFactory: CaseFactory<Res, Err, P>) {
  const factoryRef = useRef(caseFactory);
  useEffect(() => {
    factoryRef.current = caseFactory;
  });

  const { watch, unwatch, watched, abort } = useAbortable();

  const { value, error, state, actions } = useAsyncState<Res, Err>();
  const { start, reject, resolve } = actions;

  const run = useCallback(
    async (runParams: P) => {
      const objCase = factoryRef.current();
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
    [reject, resolve, start, unwatch, watch, watched],
  );

  return { value, error, state, actions, run, abort };
}
