/**
 * Exercise 03: Pagination Iterator
 * =================================
 *
 * Modern SDKs provide elegant abstractions for paginated APIs. Instead of manually
 * managing cursors and page tokens, users get async iterators that feel like
 * working with a simple array.
 *
 * CONTEXT:
 * - OpenAI/Anthropic SDKs use `for await...of` for automatic pagination
 * - They also expose manual pagination via hasNextPage() and getNextPage()
 * - Two common pagination strategies: cursor-based and offset-based
 * - Rate limiting and backpressure are important considerations
 *
 * YOUR TASK:
 * Implement a generic pagination abstraction that works with different pagination
 * strategies and provides both automatic and manual pagination interfaces.
 *
 * REQUIREMENTS:
 * 1. Support cursor-based pagination (next_cursor / has_more pattern)
 * 2. Support offset-based pagination (offset + limit pattern)
 * 3. Implement AsyncIterator protocol for `for await...of` usage
 * 4. Provide manual pagination methods: hasNextPage(), getNextPage()
 * 5. Expose page-level iteration in addition to item-level iteration
 * 6. Support lazy loading (don't fetch until needed)
 * 7. Handle empty pages and end-of-data gracefully
 */

// ============================================================================
// TYPE DEFINITIONS - DO NOT MODIFY
// ============================================================================

/** Cursor-based pagination response */
export interface CursorPage<T> {
  data: T[];
  has_more: boolean;
  next_cursor?: string | null;
}

/** Offset-based pagination response */
export interface OffsetPage<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

/** Generic page response that works with both strategies */
export interface PageResponse<T> {
  data: T[];
  hasMore: boolean;
  nextPageParams?: Record<string, unknown>;
}

/** Function that fetches a page of data */
export type PageFetcher<T> = (params: Record<string, unknown>) => Promise<PageResponse<T>>;

/** Options for creating a paginator */
export interface PaginatorOptions {
  /** Initial parameters for the first request */
  initialParams?: Record<string, unknown>;
  /** Maximum number of items to fetch total (undefined = no limit) */
  maxItems?: number;
  /** Maximum number of pages to fetch (undefined = no limit) */
  maxPages?: number;
}

// ============================================================================
// YOUR IMPLEMENTATION GOES HERE
// ============================================================================

/**
 * A paginated list that supports async iteration and manual page navigation.
 *
 * Usage:
 * ```typescript
 * const users = new Page(fetchUsers, { limit: 20 });
 *
 * // Automatic iteration over items
 * for await (const user of users) {
 *   console.log(user.name);
 * }
 *
 * // Manual page navigation
 * let page = await client.users.list({ limit: 20 });
 * while (page.hasNextPage()) {
 *   console.log(page.data);
 *   page = await page.getNextPage();
 * }
 * ```
 */
export class Page<T> implements AsyncIterable<T> {
  // TODO: Add private fields

  constructor(
    fetcher: PageFetcher<T>,
    options: PaginatorOptions = {}
  ) {
    // TODO: Implement constructor
    throw new Error('Not implemented');
  }

  /**
   * The items in the current page.
   * Initially empty until first fetch.
   */
  get data(): T[] {
    // TODO: Implement this getter
    throw new Error('Not implemented');
  }

  /**
   * Whether there are more pages available.
   * Returns false if no fetch has been made yet.
   */
  hasNextPage(): boolean {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Fetch the next page and return a new Page instance.
   * The current Page instance remains unchanged (immutable pattern).
   *
   * @throws Error if there are no more pages
   */
  async getNextPage(): Promise<Page<T>> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Iterate over individual items across all pages.
   * This is the Symbol.asyncIterator implementation.
   */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Iterate over pages instead of individual items.
   * Useful when you need access to page metadata or want batch processing.
   */
  async *iterPages(): AsyncGenerator<Page<T>, void, unknown> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }

  /**
   * Collect all items from all pages into an array.
   * Use with caution on large datasets!
   *
   * @param maxItems - Maximum items to collect (overrides constructor option)
   */
  async toArray(maxItems?: number): Promise<T[]> {
    // TODO: Implement this method
    throw new Error('Not implemented');
  }
}

/**
 * Create a cursor-based paginator from a cursor page response.
 * Adapts the cursor-based API response to our generic PageResponse format.
 */
export function createCursorPaginator<T>(
  fetcher: (params: { cursor?: string; limit?: number }) => Promise<CursorPage<T>>,
  initialLimit?: number
): Page<T> {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Create an offset-based paginator from an offset page response.
 * Adapts the offset-based API response to our generic PageResponse format.
 */
export function createOffsetPaginator<T>(
  fetcher: (params: { offset: number; limit: number }) => Promise<OffsetPage<T>>,
  options?: { limit?: number; startOffset?: number }
): Page<T> {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

// ============================================================================
// SAMPLE USAGE
// ============================================================================

/*
// Simulated API client
const api = {
  async listUsers(params: { cursor?: string; limit?: number }): Promise<CursorPage<User>> {
    // ... make HTTP request ...
    return { data: users, has_more: true, next_cursor: 'abc123' };
  }
};

// Create paginator
const users = createCursorPaginator(
  (params) => api.listUsers(params),
  20 // limit per page
);

// Automatic iteration - most common usage
for await (const user of users) {
  console.log(user.name);
  if (someCondition) break; // Can break early
}

// Manual page-by-page iteration
let page = users;
// First, fetch the first page
page = await page.getNextPage();

while (page.hasNextPage()) {
  console.log(`Got ${page.data.length} users`);
  page = await page.getNextPage();
}

// Page-level iteration
for await (const page of users.iterPages()) {
  console.log(`Processing batch of ${page.data.length} items`);
  await processBatch(page.data);
}

// Collect all (use carefully!)
const allUsers = await users.toArray();

// With limits
const first100Users = await users.toArray(100);


// Offset-based API example
const products = createOffsetPaginator(
  (params) => api.listProducts(params),
  { limit: 50, startOffset: 0 }
);

for await (const product of products) {
  console.log(product.name);
}
*/

// ============================================================================
// EDGE CASES TO CONSIDER
// ============================================================================

/*
1. Empty first page
   -> has_more: false, data: []
   -> Iterator should complete immediately

2. Single item total
   -> Should work correctly

3. Exact page boundary
   -> Last page is full, has_more: false
   -> Should not make extra request

4. API returns empty page with has_more: true (bug in API)
   -> Should handle gracefully, maybe warn

5. maxItems falls in middle of page
   -> Should stop iteration at exactly maxItems

6. maxPages limit
   -> Should stop after N pages regardless of has_more

7. Concurrent iteration
   -> Two for-await loops on same paginator
   -> Each should get independent state

8. Calling getNextPage() when hasNextPage() is false
   -> Should throw descriptive error

9. Network error during pagination
   -> Error should propagate, partial results lost
   -> Could consider: resume capability?

10. Very large pages (memory pressure)
    -> Consider streaming/chunking in real implementation

11. Rate limiting during pagination
    -> Combine with retry logic from exercise 02

12. Cursor expiration
    -> API invalidates cursor after time
    -> Error should be clear
*/

// ============================================================================
// HINTS
// ============================================================================

/*
HINT 1: Page class internal state:

  class Page<T> {
    private _data: T[] = [];
    private _hasMore: boolean = false;
    private _nextParams: Record<string, unknown> | undefined;
    private _fetched: boolean = false;
    private _fetcher: PageFetcher<T>;
    private _options: PaginatorOptions;
  }

HINT 2: Lazy fetching pattern - fetch on first access:

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let currentPage: Page<T> = this;
    let itemCount = 0;
    const maxItems = this._options.maxItems ?? Infinity;

    // Fetch first page if not already fetched
    if (!currentPage._fetched) {
      currentPage = await currentPage.getNextPage();
    }

    while (true) {
      for (const item of currentPage.data) {
        if (itemCount >= maxItems) return;
        yield item;
        itemCount++;
      }

      if (!currentPage.hasNextPage()) return;
      currentPage = await currentPage.getNextPage();
    }
  }

HINT 3: Immutable page pattern (each getNextPage returns new instance):

  async getNextPage(): Promise<Page<T>> {
    if (!this._nextParams && this._fetched) {
      throw new Error('No more pages available');
    }

    const params = this._nextParams ?? this._options.initialParams ?? {};
    const response = await this._fetcher(params);

    const nextPage = new Page(this._fetcher, this._options);
    nextPage._data = response.data;
    nextPage._hasMore = response.hasMore;
    nextPage._nextParams = response.nextPageParams;
    nextPage._fetched = true;

    return nextPage;
  }

HINT 4: Cursor adapter function:

  function createCursorPaginator<T>(
    fetcher: (params: { cursor?: string; limit?: number }) => Promise<CursorPage<T>>,
    initialLimit?: number
  ): Page<T> {
    const adaptedFetcher: PageFetcher<T> = async (params) => {
      const response = await fetcher({
        cursor: params.cursor as string | undefined,
        limit: (params.limit as number) ?? initialLimit
      });

      return {
        data: response.data,
        hasMore: response.has_more,
        nextPageParams: response.next_cursor
          ? { cursor: response.next_cursor, limit: params.limit ?? initialLimit }
          : undefined
      };
    };

    return new Page(adaptedFetcher, {
      initialParams: { limit: initialLimit }
    });
  }

HINT 5: Offset adapter:

  function createOffsetPaginator<T>(...) {
    const adaptedFetcher: PageFetcher<T> = async (params) => {
      const offset = (params.offset as number) ?? startOffset;
      const limit = (params.limit as number) ?? defaultLimit;
      const response = await fetcher({ offset, limit });

      const hasMore = offset + response.data.length < response.total;
      return {
        data: response.data,
        hasMore,
        nextPageParams: hasMore
          ? { offset: offset + limit, limit }
          : undefined
      };
    };
    // ...
  }

HINT 6: For independent iteration state, the async iterator
  should create its own page chain from the initial fetcher.
*/
