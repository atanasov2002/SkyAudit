import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface QueueOptions {
  concurrency?: number; // how many parallel requests
  retry?: number; // retry attempts on network error (not 4xx)
  backoffMs?: number; // base backoff
}

export function setupQueue(client: AxiosInstance, opts: QueueOptions = {}) {
  const concurrency = opts.concurrency ?? 6;
  const retry = opts.retry ?? 1;
  const backoffMs = opts.backoffMs ?? 200;

  let active = 0;
  const queue: Array<() => void> = [];

  function runNext() {
    if (active >= concurrency) return;
    const job = queue.shift();
    if (!job) return;
    active++;
    job();
  }

  async function queued<T = any>(
    cfg: AxiosRequestConfig,
    attempt = 0
  ): Promise<AxiosResponse<T>> {
    return new Promise((resolve, reject) => {
      const job = () => {
        client
          .request<T>(cfg)
          .then((r) => resolve(r))
          .catch(async (err) => {
            active--;
            // retry on network or 5xx
            const status = err?.response?.status;
            const shouldRetry = attempt < retry && (!status || status >= 500);
            if (shouldRetry) {
              const wait = backoffMs * Math.pow(2, attempt);
              setTimeout(() => {
                queued<T>(cfg, attempt + 1)
                  .then(resolve)
                  .catch(reject)
                  .finally(() => {
                    runNext();
                  });
              }, wait);
              return;
            }

            reject(err);
          })
          .finally(() => {
            active--;
            runNext();
          });
      };

      queue.push(job);
      runNext();
    });
  }

  // Provide a wrapper object that mirrors axios instance's 'request' signature.
  return {
    request: <T = any>(cfg: AxiosRequestConfig) => queued<T>(cfg),
    // convenience helpers
    get: <T = any>(url: string, cfg?: AxiosRequestConfig) =>
      queued<T>({ ...(cfg ?? {}), method: "GET", url }),
    post: <T = any>(url: string, data?: any, cfg?: AxiosRequestConfig) =>
      queued<T>({ ...(cfg ?? {}), method: "POST", url, data }),
    put: <T = any>(url: string, data?: any, cfg?: AxiosRequestConfig) =>
      queued<T>({ ...(cfg ?? {}), method: "PUT", url, data }),
    delete: <T = any>(url: string, cfg?: AxiosRequestConfig) =>
      queued<T>({ ...(cfg ?? {}), method: "DELETE", url }),
  } as const;
}
