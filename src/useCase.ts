import { useCallback, useEffect, useRef } from 'react';
import { Result } from './Result';

export type CaseResult<Res, Err> = Promise<Result<Res, Err>> | Result<Res, Err>;

export type CaseOptions = Record<string, unknown> | undefined | null;

export type Case<Res, Err, P, O extends CaseOptions> = (
  runParams: P,
  options: O,
  origin?: string,
) => CaseResult<Res, Err>;

export function useCase<Res, Err, P, O extends CaseOptions>(
  caseFn: Case<Res, Err, P, O>,
  options: O,
  origin?: string,
) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  return useCallback(
    (runParams: P) => {
      return caseFn(
        runParams,
        optionsRef.current ? { ...optionsRef.current } : optionsRef.current,
        origin,
      );
    },
    [caseFn, origin],
  );
}
