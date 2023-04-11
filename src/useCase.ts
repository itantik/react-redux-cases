import { useCallback, useEffect, useRef } from 'react';
import { Abortable } from './Abortable';
import { Result } from './Result';
import { useAbortable } from './useAbortable';

export type CaseResult<Res, Err> = Promise<Result<Res, Err>>;

export interface Case<Res = unknown, Err = unknown, P = unknown> extends Abortable {
  execute(runParams: P): CaseResult<Res, Err>;
}

export type CaseFactory<Res, Err, P> = () => Case<Res, Err, P>;

export function useCase<Res, Err, P>(caseFactory: CaseFactory<Res, Err, P>) {
  const factoryRef = useRef(caseFactory);
  useEffect(() => {
    factoryRef.current = caseFactory;
  });

  const { watch, unwatch, abort } = useAbortable();

  const run = useCallback(
    async (runParams: P) => {
      const objCase = factoryRef.current();
      watch(objCase);
      const result = await objCase.execute(runParams);
      unwatch(objCase);
      return result;
    },
    [unwatch, watch],
  );

  return { run, abort };
}
