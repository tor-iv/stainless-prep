import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  HttpClient,
  buildUrl,
  mapStatusToError,
  fetchWithTimeout,
  APIError,
  BadRequestError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  TimeoutError,
} from '../exercises/05-http-client-abstraction.js';

// Mock fetch for testing
const createMockFetch = (response: Partial<Response> = {}) => {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers(),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ...response,
  } as Response);
};

describe('Exercise 05: HTTP Client Abstraction', () => {
  describe('buildUrl', () => {
    it('should build URL without params', () => {
      expect(buildUrl('https://api.example.com', '/users')).toBe(
        'https://api.example.com/users'
      );
    });

    it('should handle base URL with trailing slash', () => {
      expect(buildUrl('https://api.example.com/', '/users')).toBe(
        'https://api.example.com/users'
      );
    });

    it('should handle path without leading slash', () => {
      expect(buildUrl('https://api.example.com', 'users')).toBe(
        'https://api.example.com/users'
      );
    });

    it('should add query params', () => {
      const url = buildUrl('https://api.example.com', '/users', {
        limit: 10,
        active: true,
      });
      expect(url).toContain('limit=10');
      expect(url).toContain('active=true');
    });

    it('should omit undefined params', () => {
      const url = buildUrl('https://api.example.com', '/users', {
        limit: 10,
        cursor: undefined,
      });
      expect(url).toContain('limit=10');
      expect(url).not.toContain('cursor');
    });

    it('should encode special characters', () => {
      const url = buildUrl('https://api.example.com', '/search', {
        q: 'hello world',
      });
      expect(url).toContain('q=hello+world');
    });
  });

  describe('mapStatusToError', () => {
    it('should map 400 to BadRequestError', () => {
      const error = mapStatusToError(400, 'Bad request');
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.status).toBe(400);
    });

    it('should map 401 to AuthenticationError', () => {
      const error = mapStatusToError(401, 'Unauthorized');
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should map 404 to NotFoundError', () => {
      const error = mapStatusToError(404, 'Not found');
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should map 429 to RateLimitError', () => {
      const headers = new Headers({ 'retry-after': '60' });
      const error = mapStatusToError(429, 'Rate limited', undefined, headers);

      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).retryAfter).toBe(60000);
    });

    it('should map 500+ to InternalServerError', () => {
      const error = mapStatusToError(500, 'Internal error');
      expect(error.name).toBe('InternalServerError');
      expect(error.status).toBe(500);
    });

    it('should include body in error', () => {
      const body = { error: { message: 'Details here' } };
      const error = mapStatusToError(400, 'Bad request', body);
      expect(error.body).toEqual(body);
    });
  });

  describe('fetchWithTimeout', () => {
    it('should call underlying fetch', async () => {
      const mockFetch = createMockFetch();
      const wrappedFetch = fetchWithTimeout(mockFetch as typeof fetch, 5000);

      await wrappedFetch('https://api.example.com');

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should throw TimeoutError on timeout', async () => {
      const mockFetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 1000);
          })
      );

      const wrappedFetch = fetchWithTimeout(mockFetch as typeof fetch, 50);

      await expect(wrappedFetch('https://api.example.com')).rejects.toThrow(
        TimeoutError
      );
    });

    it('should respect existing AbortSignal', async () => {
      const mockFetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 1000);
          })
      );

      const controller = new AbortController();
      const wrappedFetch = fetchWithTimeout(mockFetch as typeof fetch, 5000);

      setTimeout(() => controller.abort(), 50);

      await expect(
        wrappedFetch('https://api.example.com', { signal: controller.signal })
      ).rejects.toThrow();
    });
  });

  describe('HttpClient', () => {
    let mockFetch: jest.MockedFunction<typeof fetch>;
    let client: HttpClient;

    beforeEach(() => {
      mockFetch = createMockFetch({
        json: () => Promise.resolve({ data: 'test' }),
      }) as jest.MockedFunction<typeof fetch>;

      client = new HttpClient({
        baseUrl: 'https://api.example.com',
        fetch: mockFetch,
      });
    });

    describe('HTTP methods', () => {
      it('should make GET request', async () => {
        await client.get('/users');

        expect(mockFetch).toHaveBeenCalled();
        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('https://api.example.com/users');
      });

      it('should make POST request with body', async () => {
        await client.post('/users', { body: { name: 'John' } });

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.method).toBe('POST');
        expect(request.headers.get('Content-Type')).toBe('application/json');
      });

      it('should make PUT request', async () => {
        await client.put('/users/1', { body: { name: 'Jane' } });

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.method).toBe('PUT');
      });

      it('should make PATCH request', async () => {
        await client.patch('/users/1', { body: { name: 'Jane' } });

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.method).toBe('PATCH');
      });

      it('should make DELETE request', async () => {
        await client.delete('/users/1');

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.method).toBe('DELETE');
      });
    });

    describe('authentication', () => {
      it('should add API key header', async () => {
        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          auth: { type: 'apiKey', key: 'secret123' },
          fetch: mockFetch,
        });

        await client.get('/users');

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.headers.get('X-API-Key')).toBe('secret123');
      });

      it('should add Bearer token', async () => {
        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          auth: { type: 'bearer', token: 'token123' },
          fetch: mockFetch,
        });

        await client.get('/users');

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.headers.get('Authorization')).toBe('Bearer token123');
      });

      it('should use custom auth handler', async () => {
        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          auth: {
            type: 'custom',
            handler: (headers) => headers.set('X-Custom-Auth', 'custom'),
          },
          fetch: mockFetch,
        });

        await client.get('/users');

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.headers.get('X-Custom-Auth')).toBe('custom');
      });
    });

    describe('headers', () => {
      it('should include default headers', async () => {
        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          defaultHeaders: { 'X-Client-Version': '1.0.0' },
          fetch: mockFetch,
        });

        await client.get('/users');

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.headers.get('X-Client-Version')).toBe('1.0.0');
      });

      it('should merge request headers with defaults', async () => {
        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          defaultHeaders: { 'X-Default': 'default' },
          fetch: mockFetch,
        });

        await client.get('/users', { headers: { 'X-Request': 'request' } });

        const request = mockFetch.mock.calls[0]![0] as Request;
        expect(request.headers.get('X-Default')).toBe('default');
        expect(request.headers.get('X-Request')).toBe('request');
      });
    });

    describe('error handling', () => {
      it('should throw BadRequestError on 400', async () => {
        mockFetch = createMockFetch({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid input' }),
        }) as jest.MockedFunction<typeof fetch>;

        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          fetch: mockFetch,
        });

        await expect(client.get('/users')).rejects.toThrow(BadRequestError);
      });

      it('should throw AuthenticationError on 401', async () => {
        mockFetch = createMockFetch({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Invalid API key' }),
        }) as jest.MockedFunction<typeof fetch>;

        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          fetch: mockFetch,
        });

        await expect(client.get('/users')).rejects.toThrow(AuthenticationError);
      });

      it('should throw RateLimitError on 429', async () => {
        mockFetch = createMockFetch({
          ok: false,
          status: 429,
          headers: new Headers({ 'retry-after': '30' }),
          json: () => Promise.resolve({ error: 'Too many requests' }),
        }) as jest.MockedFunction<typeof fetch>;

        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          fetch: mockFetch,
        });

        await expect(client.get('/users')).rejects.toThrow(RateLimitError);
      });
    });

    describe('interceptors', () => {
      it('should call onRequest interceptor', async () => {
        const onRequest = jest.fn((req: Request) => req);

        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          fetch: mockFetch,
          onRequest,
        });

        await client.get('/users');

        expect(onRequest).toHaveBeenCalled();
      });

      it('should call onResponse interceptor', async () => {
        const onResponse = jest.fn((res: Response) => res);

        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          fetch: mockFetch,
          onResponse,
        });

        await client.get('/users');

        expect(onResponse).toHaveBeenCalled();
      });

      it('should call onError interceptor', async () => {
        mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
        const onError = jest.fn((err: Error) => err);

        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          fetch: mockFetch,
          onError,
        });

        await expect(client.get('/users')).rejects.toThrow();
        expect(onError).toHaveBeenCalled();
      });
    });

    describe('raw response', () => {
      it('should return raw Response object', async () => {
        const response = await client.raw('/users');

        expect(response).toBeInstanceOf(Response);
      });
    });

    describe('cancellation', () => {
      it('should abort request when signal is triggered', async () => {
        const controller = new AbortController();
        mockFetch = jest.fn().mockImplementation(() =>
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError'))
            );
          })
        );

        client = new HttpClient({
          baseUrl: 'https://api.example.com',
          fetch: mockFetch,
        });

        const promise = client.get('/slow', { signal: controller.signal });
        controller.abort();

        await expect(promise).rejects.toThrow();
      });
    });
  });
});
