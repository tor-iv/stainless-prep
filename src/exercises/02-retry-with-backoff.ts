/**
 * Exercise 02: Retry with Exponential Backoff
 * ============================================
 *
 * Robust retry logic is essential for any SDK. Network requests fail, rate limits
 * get hit, and servers occasionally return 5xx errors. A good SDK handles these
 * gracefully with intelligent retry logic.
 *
 * CONTEXT:
 * - OpenAI/Anthropic SDKs retry 2 times by default with exponential backoff
 * - Retriable errors: 408 Timeout, 429 Rate Limit, 5xx Server errors, connection failures
 * - Non-retriable: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
 * - Jitter prevents thundering herd when many clients retry simultaneously
 *
 * YOUR TASK:
 * Implement a retry wrapper that handles transient failures with configurable
 * exponential backoff and jitter.
 *
 * REQUIREMENTS:
 * 1. Retry only on retriable errors (see isRetriable function)
 * 2. Exponential backoff: delay = baseDelay * 2^attempt (capped at maxDelay)
 * 3. Add jitter to prevent thundering herd (random factor 0.5-1.5x)
 * 4. Respect Retry-After header when present (rate limit responses)
 * 5. Provide hooks for observability (onRetry callback)
 * 6. Return the successful result or throw the final error after all retries exhausted
 * 7. Support cancellation via AbortSignal
 */

// ============================================================================
// TYPE DEFINITIONS - DO NOT MODIFY
// ============================================================================

/** HTTP-like error with status code */
export interface HTTPError extends Error {
  status: number;
  headers?: Headers | Map<string, string> | Record<string, string>;
}

/** Connection/network error */
export interface ConnectionError extends Error {
  code?: string; // 'ECONNRESET', 'ETIMEDOUT', etc.
}

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 2) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 500) */
  baseDelay?: number;
  /** Maximum delay in milliseconds (default: 60000) */
  maxDelay?: number;
  /** Jitter factor range [min, max] multiplied by delay (default: [0.5, 1.5]) */
  jitterRange?: [number, number];
  /** Callback invoked before each retry attempt */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

export interface RetryResult<T> {
  /** The successful result */
  data: T;
  /** Number of retry attempts made (0 if succeeded first try) */
  attempts: number;
}

// ============================================================================
// YOUR IMPLEMENTATION GOES HERE
// ============================================================================

/**
 * Determine if an error is retriable.
 *
 * Retriable errors:
 * - HTTP 408 Request Timeout
 * - HTTP 409 Conflict
 * - HTTP 429 Too Many Requests
 * - HTTP 5xx Server Errors
 * - Connection errors (ECONNRESET, ETIMEDOUT, ENOTFOUND, etc.)
 *
 * Non-retriable errors:
 * - HTTP 4xx Client Errors (except 408, 409, 429)
 * - Validation errors
 * - Authentication errors
 */
export function isRetriable(error: Error): boolean {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Extract Retry-After delay from error headers.
 *
 * The Retry-After header can be:
 * - A number of seconds: "120"
 * - An HTTP date: "Wed, 21 Oct 2015 07:28:00 GMT"
 *
 * @returns Delay in milliseconds, or null if not present/parseable
 */
export function parseRetryAfter(error: Error): number | null {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Calculate delay for a retry attempt with exponential backoff and jitter.
 *
 * Formula: min(baseDelay * 2^attempt, maxDelay) * random(jitterMin, jitterMax)
 *
 * @param attempt - The retry attempt number (0-indexed)
 * @param options - Retry configuration options
 * @returns Delay in milliseconds
 */
export function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'onRetry' | 'signal'>>): number {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Sleep for a specified duration, respecting AbortSignal.
 *
 * @param ms - Duration in milliseconds
 * @param signal - Optional AbortSignal for cancellation
 * @throws AbortError if signal is aborted during sleep
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Retry a function with exponential backoff.
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration
 * @returns The result wrapped with attempt count
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Create a retry wrapper with preset options.
 * Useful for creating SDK-wide retry behavior.
 *
 * @param defaultOptions - Default retry options
 * @returns A retry function with preset options
 */
export function createRetryWrapper(defaultOptions: RetryOptions = {}) {
  return async <T>(
    fn: () => Promise<T>,
    overrideOptions: RetryOptions = {}
  ): Promise<RetryResult<T>> => {
    // TODO: Implement this function
    throw new Error('Not implemented');
  };
}

// ============================================================================
// SAMPLE USAGE
// ============================================================================

/*
// Basic usage:
const result = await withRetry(
  () => fetch('https://api.example.com/data').then(r => r.json()),
  { maxRetries: 3 }
);
console.log(`Got data after ${result.attempts} retries`);

// With observability:
const result = await withRetry(fetchData, {
  maxRetries: 2,
  baseDelay: 1000,
  onRetry: (error, attempt, delay) => {
    console.log(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
  }
});

// With cancellation:
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // Cancel after 5s

try {
  const result = await withRetry(fetchData, {
    maxRetries: 10,
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}

// SDK-style retry wrapper:
const retryWithDefaults = createRetryWrapper({
  maxRetries: 2,
  baseDelay: 500,
  maxDelay: 60000,
  onRetry: (err, attempt) => logger.warn(`Retry attempt ${attempt}`, { error: err })
});

// All SDK methods use consistent retry behavior:
const users = await retryWithDefaults(() => client.users.list());
const user = await retryWithDefaults(() => client.users.get(id));
*/

// ============================================================================
// EDGE CASES TO CONSIDER
// ============================================================================

/*
1. First attempt succeeds
   -> Should return { data, attempts: 0 }

2. Retry-After header present with 429
   -> Use header value instead of calculated delay
   -> But still respect maxDelay cap

3. Retry-After as HTTP date
   -> Parse and calculate delay from now

4. AbortSignal already aborted when called
   -> Should throw immediately

5. Abort during sleep
   -> Should reject the sleep promise
   -> Should not attempt another retry

6. Non-Error thrown (string, object)
   -> Wrap in Error and treat as non-retriable

7. maxRetries: 0
   -> No retries, fail immediately on error

8. Jitter edge cases
   -> jitterRange [1, 1] = no jitter
   -> Random should be inclusive of range

9. Very long Retry-After (hours)
   -> Should still respect maxDelay cap

10. Function throws synchronously
    -> Should still be caught and handled

11. Connection errors without status code
    -> Should be retriable based on error code/type
*/

// ============================================================================
// HINTS
// ============================================================================

/*
HINT 1: Error type checking pattern:

  function isHTTPError(error: unknown): error is HTTPError {
    return error instanceof Error && 'status' in error && typeof (error as HTTPError).status === 'number';
  }

HINT 2: For sleeping with AbortSignal:

  function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timeoutId = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }

HINT 3: Exponential backoff formula:

  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

HINT 4: Jitter calculation:

  const jitter = jitterMin + Math.random() * (jitterMax - jitterMin);
  const delayWithJitter = delay * jitter;

HINT 5: Retry-After header access (handle different header types):

  function getHeader(headers: unknown, name: string): string | null {
    if (headers instanceof Headers) return headers.get(name);
    if (headers instanceof Map) return headers.get(name) ?? null;
    if (typeof headers === 'object' && headers !== null) {
      return (headers as Record<string, string>)[name] ?? null;
    }
    return null;
  }

HINT 6: Parse HTTP date to ms delay:

  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

HINT 7: The retry loop structure:

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return { data: result, attempts: attempt };
    } catch (error) {
      if (!isRetriable(error) || attempt === maxRetries) throw error;
      const delay = calculateDelay(attempt, options);
      options.onRetry?.(error, attempt + 1, delay);
      await sleep(delay, options.signal);
    }
  }
*/
