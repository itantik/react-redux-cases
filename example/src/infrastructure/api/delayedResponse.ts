const DELAY_MIN = 1000;
const DELAY_MAX = 2000;
function randomDelay() {
  return Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1) + DELAY_MIN);
}

export function delayedResponse<Res>(apiResult: () => Res, abortSignal?: AbortSignal) {
  return new Promise<Res>((resolve, reject) => {
    if (abortSignal?.aborted) {
      return reject(new Error('canceled'));
    }
    setTimeout(() => {
      try {
        const result = apiResult();
        if (abortSignal?.aborted) {
          throw new Error('canceled');
        }
        return resolve(result);
      } catch (e) {
        reject(e);
      }
    }, randomDelay());
  });
}
