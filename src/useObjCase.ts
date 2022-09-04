import { useCallback, useEffect, useRef } from 'react';
import { CaseResult } from './useCase';

export interface ObjCase<Res, Err, P> {
  execute(runParams: P, origin?: string): CaseResult<Res, Err>;
}

export type CaseFactory<Res, Err, P> = () => ObjCase<Res, Err, P>;

export function useObjCase<Res, Err, P>(caseFactory: CaseFactory<Res, Err, P>, origin?: string) {
  const factoryRef = useRef(caseFactory);
  useEffect(() => {
    factoryRef.current = caseFactory;
  });

  return useCallback(
    (runParams: P, runOrigin?: string) => {
      const objCase = factoryRef.current();
      return objCase.execute(runParams, runOrigin || origin);
    },
    [origin],
  );
}
