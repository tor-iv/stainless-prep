/**
 * Exercise 05: HTTP Client Abstraction
 * =====================================
 *
 * A well-designed SDK needs a clean HTTP client abstraction that handles the
 * complexity of making requests while providing a simple interface to consumers.
 * This abstraction should handle authentication, serialization, error mapping,
 * and work across different runtimes (Node.js, browsers, Deno, Bun).
 *
 * CONTEXT:
 * - Stainless SDKs support custom fetch implementations
 * - They handle auth (API keys, OAuth), headers, and base URLs
 * - Response types are strongly typed
 * - Errors are mapped to specific error classes
 * - Streaming support for SSE endpoints
 *
 * YOUR TASK:
 * Design and implement a type-safe HTTP client abstraction suitable for an SDK.
 *
 * REQUIREMENTS:
 * 1. Support all HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * 2. Strongly typed request bodies and response types
 * 3. Configurable base URL and default headers
 * 4. Authentication handling (API key, Bearer token)
 * 5. Automatic JSON serialization/deserialization
 * 6. Custom fetch implementation support
 * 7. Request/response interceptors for logging, retry, etc.
 * 8. Proper error handling with typed errors
 * 9. Timeout support
 * 10. AbortSignal support for cancellation
 */

// ============================================================================
// TYPE DEFINITIONS - DO NOT MODIFY
// ============================================================================

/** HTTP methods supported by the client */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Authentication configuration */
export type AuthConfig =
  | { type: 'apiKey'; key: string; headerName?: string }
  | { type: 'bearer'; token: string }
  | { type: 'custom'; handler: (headers: Headers) => void };

/** Request configuration */
export interface RequestConfig<TBody = unknown> {
  /** HTTP method */
  method?: HttpMethod;
  /** Request body (will be JSON serialized for objects) */
  body?: TBody;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Whether to parse response as JSON (default: true) */
  parseJson?: boolean;
}

/** Client configuration */
export interface ClientConfig {
  /** Base URL for all requests */
  baseUrl: string;
  /** Authentication configuration */
  auth?: AuthConfig;
  /** Default headers for all requests */
  defaultHeaders?: Record<string, string>;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Request interceptor */
  onRequest?: (request: Request) => Request | Promise<Request>;
  /** Response interceptor */
  onResponse?: (response: Response) => Response | Promise<Response>;
  /** Error interceptor */
  onError?: (error: Error) => Error | Promise<Error>;
}

/** API Error with status and response body */
export class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
    public readonly headers?: Headers
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class BadRequestError extends APIError {
  constructor(message: string, body?: unknown, headers?: Headers) {
    super(message, 400, body, headers);
    this.name = 'BadRequestError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string, body?: unknown, headers?: Headers) {
    super(message, 401, body, headers);
    this.name = 'AuthenticationError';
  }
}

export class PermissionDeniedError extends APIError {
  constructor(message: string, body?: unknown, headers?: Headers) {
    super(message, 403, body, headers);
    this.name = 'PermissionDeniedError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, body?: unknown, headers?: Headers) {
    super(message, 404, body, headers);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(message: string, body?: unknown, headers?: Headers) {
    super(message, 429, body, headers);
    this.name = 'RateLimitError';
    this.retryAfter = this.parseRetryAfter(headers);
  }

  private parseRetryAfter(headers?: Headers): number | undefined {
    const value = headers?.get('retry-after');
    if (!value) return undefined;
    const seconds = parseInt(value, 10);
    return isNaN(seconds) ? undefined : seconds * 1000;
  }
}

export class InternalServerError extends APIError {
  constructor(message: string, body?: unknown, headers?: Headers) {
    super(message, 500, body, headers);
    this.name = 'InternalServerError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// YOUR IMPLEMENTATION GOES HERE
// ============================================================================

/**
 * A type-safe HTTP client for SDK implementations.
 *
 * Usage:
 * ```typescript
 * const client = new HttpClient({
 *   baseUrl: 'https://api.example.com',
 *   auth: { type: 'bearer', token: 'sk-...' },
 *   defaultHeaders: { 'X-Client-Version': '1.0.0' }
 * });
 *
 * // Typed GET request
 * const users = await client.get<User[]>('/users');
 *
 * // POST with body
 * const created = await client.post<User>('/users', {
 *   body: { name: 'John', email: 'john@example.com' }
 * });
 * ```
 */
export class HttpClient {
  // TODO: Add private fields

  constructor(config: ClientConfig) {
    // TODO: Implement constructor
    throw new Error('Not implemented');
  }

  /**
   * Make a GET request.
   */
  async get<TResponse>(path: string, config?: RequestConfig): Promise<TResponse> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Make a POST request.
   */
  async post<TResponse, TBody = unknown>(
    path: string,
    config?: RequestConfig<TBody>
  ): Promise<TResponse> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Make a PUT request.
   */
  async put<TResponse, TBody = unknown>(
    path: string,
    config?: RequestConfig<TBody>
  ): Promise<TResponse> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Make a PATCH request.
   */
  async patch<TResponse, TBody = unknown>(
    path: string,
    config?: RequestConfig<TBody>
  ): Promise<TResponse> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Make a DELETE request.
   */
  async delete<TResponse>(path: string, config?: RequestConfig): Promise<TResponse> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Make a request with full control over method and config.
   */
  async request<TResponse, TBody = unknown>(
    path: string,
    config: RequestConfig<TBody> & { method: HttpMethod }
  ): Promise<TResponse> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Get the raw Response object instead of parsed JSON.
   * Useful for streaming responses or custom parsing.
   */
  async raw(path: string, config?: RequestConfig): Promise<Response> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }
}

/**
 * Build a full URL from base URL, path, and query parameters.
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Map HTTP status code to appropriate error class.
 */
export function mapStatusToError(
  status: number,
  message: string,
  body?: unknown,
  headers?: Headers
): APIError {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Create a fetch function with timeout support.
 */
export function fetchWithTimeout(
  fetchFn: typeof fetch,
  timeoutMs: number
): typeof fetch {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

// ============================================================================
// SAMPLE USAGE
// ============================================================================

/*
// Create client for OpenAI-like API
const openai = new HttpClient({
  baseUrl: 'https://api.openai.com/v1',
  auth: { type: 'bearer', token: process.env.OPENAI_API_KEY! },
  defaultHeaders: {
    'OpenAI-Organization': 'org-xxx',
  },
  timeout: 60000,
  onRequest: (req) => {
    console.log(`${req.method} ${req.url}`);
    return req;
  }
});

// Type-safe API calls
interface ChatCompletion {
  id: string;
  choices: Array<{ message: { content: string } }>;
}

interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
}

const completion = await openai.post<ChatCompletion, ChatCompletionRequest>(
  '/chat/completions',
  {
    body: {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello!' }]
    }
  }
);

console.log(completion.choices[0].message.content);

// With query parameters
interface ListResponse<T> {
  data: T[];
  has_more: boolean;
}

interface Model {
  id: string;
  owned_by: string;
}

const models = await openai.get<ListResponse<Model>>('/models', {
  params: { limit: 10 }
});

// With cancellation
const controller = new AbortController();
const promise = openai.get('/slow-endpoint', { signal: controller.signal });
setTimeout(() => controller.abort(), 1000);

// Error handling
try {
  await openai.post('/chat/completions', { body: { model: 'invalid' } });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited, retry after ${error.retryAfter}ms`);
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof APIError) {
    console.log(`API error: ${error.status} - ${error.message}`);
  }
}
*/

// ============================================================================
// EDGE CASES TO CONSIDER
// ============================================================================

/*
1. Base URL with/without trailing slash
   -> baseUrl: 'https://api.com' + path: '/users'
   -> baseUrl: 'https://api.com/' + path: 'users'
   -> Both should work correctly

2. Empty or undefined query params
   -> { limit: undefined } should be omitted
   -> { filter: '' } - keep or omit?

3. Body serialization
   -> Objects -> JSON.stringify
   -> Strings -> as-is
   -> FormData -> as-is (don't set Content-Type)
   -> null/undefined -> no body

4. Response parsing
   -> 204 No Content -> return null/undefined
   -> Non-JSON response -> throw or return text?
   -> Invalid JSON -> clear error message

5. Network errors
   -> fetch throws (not HTTP error)
   -> Should wrap in appropriate error type

6. Timeout during response body reading
   -> Headers received but body streaming times out
   -> Complex to handle, at minimum don't hang forever

7. Interceptor errors
   -> onRequest throws
   -> onResponse throws
   -> Should propagate appropriately

8. Auth header conflicts
   -> User passes Authorization in headers AND has auth config
   -> Which takes precedence?

9. URL encoding
   -> Path with special characters: /users/john doe
   -> Query params with special chars: ?q=foo&bar

10. Retry-After as date string
    -> "Wed, 21 Oct 2024 07:28:00 GMT"
    -> Parse and calculate delay

11. Large response bodies
    -> Memory considerations
    -> Streaming might be needed

12. Request body for GET/DELETE
    -> Some APIs do accept bodies on GET
    -> Should we allow it or error?
*/

// ============================================================================
// HINTS
// ============================================================================

/*
HINT 1: URL building:

  function buildUrl(
    baseUrl: string,
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    // Normalize base URL (remove trailing slash)
    const base = baseUrl.replace(/\/+$/, '');
    // Normalize path (ensure leading slash)
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(normalizedPath, base + '/');

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

HINT 2: Authentication handling:

  private applyAuth(headers: Headers): void {
    if (!this.config.auth) return;

    switch (this.config.auth.type) {
      case 'apiKey':
        headers.set(this.config.auth.headerName ?? 'X-API-Key', this.config.auth.key);
        break;
      case 'bearer':
        headers.set('Authorization', `Bearer ${this.config.auth.token}`);
        break;
      case 'custom':
        this.config.auth.handler(headers);
        break;
    }
  }

HINT 3: Request building:

  private buildRequest<TBody>(
    path: string,
    config: RequestConfig<TBody> & { method: HttpMethod }
  ): Request {
    const url = buildUrl(this.config.baseUrl, path, config.params);

    const headers = new Headers(this.config.defaultHeaders);
    this.applyAuth(headers);

    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        headers.set(key, value);
      }
    }

    let body: BodyInit | undefined;
    if (config.body !== undefined) {
      if (typeof config.body === 'string' || config.body instanceof FormData) {
        body = config.body;
      } else {
        body = JSON.stringify(config.body);
        headers.set('Content-Type', 'application/json');
      }
    }

    return new Request(url, {
      method: config.method,
      headers,
      body,
      signal: config.signal,
    });
  }

HINT 4: Timeout wrapper:

  function fetchWithTimeout(
    fetchFn: typeof fetch,
    timeoutMs: number
  ): typeof fetch {
    return async (input, init) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Combine signals if one was passed in init
      const signal = init?.signal;
      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }

      try {
        return await fetchFn(input, { ...init, signal: controller.signal });
      } catch (error) {
        if (controller.signal.aborted && !signal?.aborted) {
          throw new TimeoutError();
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    };
  }

HINT 5: Error mapping:

  function mapStatusToError(
    status: number,
    message: string,
    body?: unknown,
    headers?: Headers
  ): APIError {
    switch (status) {
      case 400: return new BadRequestError(message, body, headers);
      case 401: return new AuthenticationError(message, body, headers);
      case 403: return new PermissionDeniedError(message, body, headers);
      case 404: return new NotFoundError(message, body, headers);
      case 429: return new RateLimitError(message, body, headers);
      default:
        if (status >= 500) return new InternalServerError(message, body, headers);
        return new APIError(message, status, body, headers);
    }
  }

HINT 6: Response handling:

  private async handleResponse<TResponse>(
    response: Response,
    parseJson: boolean
  ): Promise<TResponse> {
    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
      const message = typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: unknown }).error)
        : `HTTP ${response.status}`;
      throw mapStatusToError(response.status, message, body, response.headers);
    }

    if (response.status === 204 || !parseJson) {
      return undefined as TResponse;
    }

    return response.json() as Promise<TResponse>;
  }

HINT 7: Putting it together:

  async request<TResponse, TBody = unknown>(
    path: string,
    config: RequestConfig<TBody> & { method: HttpMethod }
  ): Promise<TResponse> {
    let request = this.buildRequest(path, config);

    if (this.config.onRequest) {
      request = await this.config.onRequest(request);
    }

    const fetchFn = config.timeout || this.config.timeout
      ? fetchWithTimeout(this.fetchImpl, config.timeout ?? this.config.timeout!)
      : this.fetchImpl;

    let response: Response;
    try {
      response = await fetchFn(request);
    } catch (error) {
      if (this.config.onError) {
        throw await this.config.onError(error as Error);
      }
      throw error;
    }

    if (this.config.onResponse) {
      response = await this.config.onResponse(response);
    }

    return this.handleResponse<TResponse>(response, config.parseJson ?? true);
  }
*/
