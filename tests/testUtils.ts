export function waitPlease(timeout: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), timeout);
  });
}
