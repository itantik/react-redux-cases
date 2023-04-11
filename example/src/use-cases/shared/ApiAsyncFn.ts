export type ApiAsyncFn<Res, ApiParams> = (
  params: ApiParams,
  abortSignal?: AbortSignal,
) => Promise<Res>;
