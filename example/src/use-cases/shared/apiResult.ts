import { err, ok } from 'react-redux-cases';
import { ApiAsyncFn } from './ApiAsyncFn';

export async function apiResult<Res, ApiParams>(
  api: ApiAsyncFn<Res, ApiParams>,
  params: ApiParams,
  abortSignal?: AbortSignal,
) {
  try {
    const response = await api(params, abortSignal);
    return ok(response);
  } catch (e) {
    const error = e instanceof Error ? e : new Error('Unexpected API error');
    return err(error);
  }
}
