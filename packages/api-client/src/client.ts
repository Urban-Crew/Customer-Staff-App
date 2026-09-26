import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { ApiClientConfig } from './types';

declare const console: { log: (...args: unknown[]) => void };

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function redactHeaders(headers: unknown): Record<string, unknown> | undefined {
  if (!headers || typeof headers !== 'object') return undefined;
  const redacted: Record<string, unknown> = { ...(headers as Record<string, unknown>) };
  for (const key of Object.keys(redacted)) {
    if (key.toLowerCase() === 'authorization') redacted[key] = '[REDACTED]';
  }
  return redacted;
}

/**
 * The backend wraps success bodies as `{ success: true, data: T }` (see
 * @ub/shared-types' `ApiSuccess`) but the docs don't confirm this for every
 * endpoint, so this only unwraps when that exact shape is present and
 * otherwise passes the body through unchanged.
 */
function unwrapEnvelope(body: unknown): unknown {
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    (body as { success: unknown }).success === true &&
    'data' in body
  ) {
    return (body as { data: unknown }).data;
  }
  return body;
}

/**
 * Creates an axios instance wired up with:
 *  - a request interceptor that attaches the stored access token
 *  - a response interceptor that unwraps the `{ success, data }` envelope
 *    when present
 *  - a response interceptor that transparently refreshes the token on a
 *    401 and retries the original request exactly once, queueing any
 *    requests that arrive while a refresh is already in flight.
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const { baseURL, tokenStorage, refreshTokens, onAuthFailure, timeoutMs, headers, enableLogging } =
    config;

  const client = axios.create({
    baseURL,
    timeout: timeoutMs ?? 15000,
    headers,
  });

  if (enableLogging) {
    client.interceptors.request.use((requestConfig) => {
      const method = requestConfig.method?.toUpperCase() ?? 'GET';
      const url = `${requestConfig.baseURL ?? ''}${requestConfig.url ?? ''}`;
      console.log(`[API] → ${method} ${url}`, {
        params: requestConfig.params,
        data: requestConfig.data,
        headers: redactHeaders(requestConfig.headers),
      });
      return requestConfig;
    });
  }

  // Serializes concurrent refresh attempts: while a refresh is in flight,
  // every other 401'd request awaits this same promise instead of kicking
  // off its own refresh call.
  let refreshPromise: Promise<string | null> | null = null;

  async function performRefresh(): Promise<string | null> {
    const current = await tokenStorage.getTokens();
    if (!current?.refreshToken) {
      await onAuthFailure?.();
      return null;
    }

    try {
      const nextTokens = await refreshTokens(current.refreshToken);
      await tokenStorage.setTokens(nextTokens);
      return nextTokens.accessToken;
    } catch (err) {
      await tokenStorage.setTokens(null);
      await onAuthFailure?.();
      return null;
    }
  }

  client.interceptors.request.use(async (requestConfig) => {
    const tokens = await tokenStorage.getTokens();
    if (tokens?.accessToken) {
      requestConfig.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
    return requestConfig;
  });

  client.interceptors.response.use(
    (response) => {
      response.data = unwrapEnvelope(response.data);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;

      if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return client(originalRequest);
    },
  );

  if (enableLogging) {
    client.interceptors.response.use(
      (response) => {
        const method = response.config.method?.toUpperCase() ?? 'GET';
        const url = `${response.config.baseURL ?? ''}${response.config.url ?? ''}`;
        console.log(`[API] ← ${response.status} ${method} ${url}`, response.data);
        return response;
      },
      (error: AxiosError) => {
        const method = error.config?.method?.toUpperCase() ?? 'GET';
        const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
        console.log(
          `[API] ✗ ${error.response?.status ?? 'ERR'} ${method} ${url}`,
          error.response?.data ?? error.message,
        );
        return Promise.reject(error);
      },
    );
  }

  return client;
}
