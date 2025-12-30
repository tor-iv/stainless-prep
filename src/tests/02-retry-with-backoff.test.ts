import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  isRetriable,
  parseRetryAfter,
  calculateDelay,
  sleep,
  withRetry,
  createRetryWrapper,
  type HTTPError,
} from '../exercises/02-retry-with-backoff.js';

// Helper to create HTTP errors
function createHTTPError(status: number, headers?: Record<string, string>): HTTPError {
  const error = new Error(`HTTP ${status}`) as HTTPError;
  error.status = status;
  if (headers) {
    error.headers = new Map(Object.entries(headers));
  }
  return error;
}

describe('Exercise 02: Retry with Exponential Backoff', () => {
  describe('isRetriable', () => {
    it('should return true for 429 rate limit', () => {
      expect(isRetriable(createHTTPError(429))).toBe(true);
    });

    it('should return true for 500 internal server error', () => {
      expect(isRetriable(createHTTPError(500))).toBe(true);
    });

    it('should return true for 502, 503, 504', () => {
      expect(isRetriable(createHTTPError(502))).toBe(true);
      expect(isRetriable(createHTTPError(503))).toBe(true);
      expect(isRetriable(createHTTPError(504))).toBe(true);
    });

    it('should return true for 408 timeout', () => {
      expect(isRetriable(createHTTPError(408))).toBe(true);
    });

    it('should return true for 409 conflict', () => {
      expect(isRetriable(createHTTPError(409))).toBe(true);
    });

    it('should return false for 400 bad request', () => {
      expect(isRetriable(createHTTPError(400))).toBe(false);
    });

    it('should return false for 401 unauthorized', () => {
      expect(isRetriable(createHTTPError(401))).toBe(false);
    });

    it('should return false for 403 forbidden', () => {
      expect(isRetriable(createHTTPError(403))).toBe(false);
    });

    it('should return false for 404 not found', () => {
      expect(isRetriable(createHTTPError(404))).toBe(false);
    });

    it('should return true for connection errors', () => {
      const connError = new Error('Connection reset');
      (connError as { code?: string }).code = 'ECONNRESET';
      expect(isRetriable(connError)).toBe(true);
    });
  });

  describe('parseRetryAfter', () => {
    it('should parse numeric Retry-After', () => {
      const error = createHTTPError(429, { 'retry-after': '60' });
      expect(parseRetryAfter(error)).toBe(60000); // 60 seconds in ms
    });

    it('should parse HTTP date Retry-After', () => {
      const futureDate = new Date(Date.now() + 30000); // 30 seconds from now
      const error = createHTTPError(429, {
        'retry-after': futureDate.toUTCString(),
      });
      const delay = parseRetryAfter(error);
      expect(delay).toBeGreaterThan(25000);
      expect(delay).toBeLessThan(35000);
    });

    it('should return null when no Retry-After header', () => {
      const error = createHTTPError(429);
      expect(parseRetryAfter(error)).toBeNull();
    });

    it('should return null for invalid Retry-After', () => {
      const error = createHTTPError(429, { 'retry-after': 'invalid' });
      expect(parseRetryAfter(error)).toBeNull();
    });
  });

  describe('calculateDelay', () => {
    const baseOptions = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 60000,
      jitterRange: [1, 1] as [number, number], // No jitter for predictable tests
    };

    it('should calculate exponential delay', () => {
      expect(calculateDelay(0, baseOptions)).toBe(1000); // 1000 * 2^0
      expect(calculateDelay(1, baseOptions)).toBe(2000); // 1000 * 2^1
      expect(calculateDelay(2, baseOptions)).toBe(4000); // 1000 * 2^2
      expect(calculateDelay(3, baseOptions)).toBe(8000); // 1000 * 2^3
    });

    it('should cap at maxDelay', () => {
      const options = { ...baseOptions, maxDelay: 5000 };
      expect(calculateDelay(10, options)).toBe(5000);
    });

    it('should apply jitter', () => {
      const options = { ...baseOptions, jitterRange: [0.5, 1.5] as [number, number] };
      const delays = Array.from({ length: 100 }, () => calculateDelay(0, options));

      // All should be between 500 and 1500
      expect(delays.every((d) => d >= 500 && d <= 1500)).toBe(true);
      // Should have some variation
      expect(new Set(delays).size).toBeGreaterThan(1);
    });
  });

  describe('sleep', () => {
    it('should sleep for specified duration', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(95);
      expect(elapsed).toBeLessThan(200);
    });

    it('should reject when signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(sleep(100, controller.signal)).rejects.toThrow();
    });

    it('should reject when signal is aborted during sleep', async () => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 50);
      await expect(sleep(1000, controller.signal)).rejects.toThrow();
    });
  });

  describe('withRetry', () => {
    it('should return immediately on success', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(fn as () => Promise<string>);

      expect(result.data).toBe('success');
      expect(result.attempts).toBe(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retriable errors', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(createHTTPError(500))
        .mockRejectedValueOnce(createHTTPError(500))
        .mockResolvedValue('success');

      const result = await withRetry(fn as () => Promise<string>, {
        baseDelay: 10,
        maxRetries: 3,
      });

      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw immediately on non-retriable errors', async () => {
      const fn = jest.fn().mockRejectedValue(createHTTPError(400));

      await expect(
        withRetry(fn as () => Promise<string>, { maxRetries: 3 })
      ).rejects.toMatchObject({ status: 400 });

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries exhausted', async () => {
      const fn = jest.fn().mockRejectedValue(createHTTPError(500));

      await expect(
        withRetry(fn as () => Promise<string>, {
          maxRetries: 2,
          baseDelay: 10,
        })
      ).rejects.toMatchObject({ status: 500 });

      expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should call onRetry callback', async () => {
      const onRetry = jest.fn();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(createHTTPError(500))
        .mockResolvedValue('success');

      await withRetry(fn as () => Promise<string>, {
        baseDelay: 10,
        maxRetries: 2,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(Error),
        1,
        expect.any(Number)
      );
    });

    it('should abort when signal is triggered', async () => {
      const controller = new AbortController();
      const fn = jest.fn().mockRejectedValue(createHTTPError(500));

      setTimeout(() => controller.abort(), 50);

      await expect(
        withRetry(fn as () => Promise<string>, {
          maxRetries: 10,
          baseDelay: 100,
          signal: controller.signal,
        })
      ).rejects.toThrow();
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a wrapper with default options', async () => {
      const retry = createRetryWrapper({ maxRetries: 1, baseDelay: 10 });
      const fn = jest
        .fn()
        .mockRejectedValueOnce(createHTTPError(500))
        .mockResolvedValue('success');

      const result = await retry(fn as () => Promise<string>);

      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
    });

    it('should allow per-call overrides', async () => {
      const retry = createRetryWrapper({ maxRetries: 1, baseDelay: 10 });
      const fn = jest.fn().mockRejectedValue(createHTTPError(500));

      await expect(
        retry(fn as () => Promise<string>, { maxRetries: 0 })
      ).rejects.toMatchObject({ status: 500 });

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
