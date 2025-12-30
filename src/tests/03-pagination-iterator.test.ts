import { describe, it, expect, jest } from '@jest/globals';
import {
  Page,
  createCursorPaginator,
  createOffsetPaginator,
  type CursorPage,
  type OffsetPage,
  type PageResponse,
} from '../exercises/03-pagination-iterator.js';

describe('Exercise 03: Pagination Iterator', () => {
  describe('Page class', () => {
    it('should create an empty page initially', () => {
      const fetcher = jest.fn();
      const page = new Page(fetcher as () => Promise<PageResponse<unknown>>);

      expect(page.data).toEqual([]);
      expect(page.hasNextPage()).toBe(false);
    });

    it('should fetch first page on getNextPage', async () => {
      const fetcher = jest.fn().mockResolvedValue({
        data: [1, 2, 3],
        hasMore: false,
      });

      const page = new Page(fetcher as () => Promise<PageResponse<number>>);
      const nextPage = await page.getNextPage();

      expect(nextPage.data).toEqual([1, 2, 3]);
      expect(nextPage.hasNextPage()).toBe(false);
    });

    it('should iterate through items with for await', async () => {
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce({
          data: [1, 2],
          hasMore: true,
          nextPageParams: { cursor: 'a' },
        })
        .mockResolvedValueOnce({
          data: [3, 4],
          hasMore: true,
          nextPageParams: { cursor: 'b' },
        })
        .mockResolvedValueOnce({
          data: [5],
          hasMore: false,
        });

      const page = new Page(fetcher as (params: Record<string, unknown>) => Promise<PageResponse<number>>);
      const items: number[] = [];

      for await (const item of page) {
        items.push(item);
      }

      expect(items).toEqual([1, 2, 3, 4, 5]);
      expect(fetcher).toHaveBeenCalledTimes(3);
    });

    it('should respect maxItems option', async () => {
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce({
          data: [1, 2, 3],
          hasMore: true,
          nextPageParams: { cursor: 'a' },
        })
        .mockResolvedValueOnce({
          data: [4, 5, 6],
          hasMore: false,
        });

      const page = new Page(fetcher as (params: Record<string, unknown>) => Promise<PageResponse<number>>, {
        maxItems: 4,
      });

      const items: number[] = [];
      for await (const item of page) {
        items.push(item);
      }

      expect(items).toEqual([1, 2, 3, 4]);
    });

    it('should respect maxPages option', async () => {
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce({
          data: [1],
          hasMore: true,
          nextPageParams: { cursor: 'a' },
        })
        .mockResolvedValueOnce({
          data: [2],
          hasMore: true,
          nextPageParams: { cursor: 'b' },
        })
        .mockResolvedValueOnce({
          data: [3],
          hasMore: true,
          nextPageParams: { cursor: 'c' },
        });

      const page = new Page(fetcher as (params: Record<string, unknown>) => Promise<PageResponse<number>>, {
        maxPages: 2,
      });

      const items = await page.toArray();

      expect(items).toEqual([1, 2]);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should allow breaking out of iteration early', async () => {
      const fetcher = jest.fn().mockResolvedValue({
        data: [1, 2, 3, 4, 5],
        hasMore: true,
        nextPageParams: { cursor: 'a' },
      });

      const page = new Page(fetcher as (params: Record<string, unknown>) => Promise<PageResponse<number>>);
      const items: number[] = [];

      for await (const item of page) {
        items.push(item);
        if (item === 3) break;
      }

      expect(items).toEqual([1, 2, 3]);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should iterate over pages with iterPages', async () => {
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce({
          data: [1, 2],
          hasMore: true,
          nextPageParams: { cursor: 'a' },
        })
        .mockResolvedValueOnce({
          data: [3, 4],
          hasMore: false,
        });

      const page = new Page(fetcher as (params: Record<string, unknown>) => Promise<PageResponse<number>>);
      const pages: number[][] = [];

      for await (const p of page.iterPages()) {
        pages.push([...p.data]);
      }

      expect(pages).toEqual([[1, 2], [3, 4]]);
    });

    it('should collect all items with toArray', async () => {
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce({
          data: ['a', 'b'],
          hasMore: true,
          nextPageParams: { cursor: 'x' },
        })
        .mockResolvedValueOnce({
          data: ['c'],
          hasMore: false,
        });

      const page = new Page(fetcher as (params: Record<string, unknown>) => Promise<PageResponse<string>>);
      const all = await page.toArray();

      expect(all).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty first page', async () => {
      const fetcher = jest.fn().mockResolvedValue({
        data: [],
        hasMore: false,
      });

      const page = new Page(fetcher as () => Promise<PageResponse<number>>);
      const items: number[] = [];

      for await (const item of page) {
        items.push(item);
      }

      expect(items).toEqual([]);
    });

    it('should throw on getNextPage when no more pages', async () => {
      const fetcher = jest.fn().mockResolvedValue({
        data: [1],
        hasMore: false,
      });

      const page = new Page(fetcher as () => Promise<PageResponse<number>>);
      const page1 = await page.getNextPage();

      expect(page1.hasNextPage()).toBe(false);
      await expect(page1.getNextPage()).rejects.toThrow();
    });
  });

  describe('createCursorPaginator', () => {
    it('should adapt cursor-based API responses', async () => {
      const apiFetcher = jest
        .fn<(params: { cursor?: string; limit?: number }) => Promise<CursorPage<string>>>()
        .mockResolvedValueOnce({
          data: ['a', 'b'],
          has_more: true,
          next_cursor: 'cursor1',
        })
        .mockResolvedValueOnce({
          data: ['c'],
          has_more: false,
          next_cursor: null,
        });

      const page = createCursorPaginator(apiFetcher, 10);
      const items = await page.toArray();

      expect(items).toEqual(['a', 'b', 'c']);
      expect(apiFetcher).toHaveBeenNthCalledWith(1, { limit: 10 });
      expect(apiFetcher).toHaveBeenNthCalledWith(2, { cursor: 'cursor1', limit: 10 });
    });
  });

  describe('createOffsetPaginator', () => {
    it('should adapt offset-based API responses', async () => {
      const apiFetcher = jest
        .fn<(params: { offset: number; limit: number }) => Promise<OffsetPage<number>>>()
        .mockResolvedValueOnce({
          data: [1, 2],
          total: 5,
          offset: 0,
          limit: 2,
        })
        .mockResolvedValueOnce({
          data: [3, 4],
          total: 5,
          offset: 2,
          limit: 2,
        })
        .mockResolvedValueOnce({
          data: [5],
          total: 5,
          offset: 4,
          limit: 2,
        });

      const page = createOffsetPaginator(apiFetcher, { limit: 2, startOffset: 0 });
      const items = await page.toArray();

      expect(items).toEqual([1, 2, 3, 4, 5]);
      expect(apiFetcher).toHaveBeenNthCalledWith(1, { offset: 0, limit: 2 });
      expect(apiFetcher).toHaveBeenNthCalledWith(2, { offset: 2, limit: 2 });
      expect(apiFetcher).toHaveBeenNthCalledWith(3, { offset: 4, limit: 2 });
    });

    it('should handle exact page boundary', async () => {
      const apiFetcher = jest
        .fn<(params: { offset: number; limit: number }) => Promise<OffsetPage<number>>>()
        .mockResolvedValueOnce({
          data: [1, 2],
          total: 2,
          offset: 0,
          limit: 2,
        });

      const page = createOffsetPaginator(apiFetcher, { limit: 2 });
      const items = await page.toArray();

      expect(items).toEqual([1, 2]);
      expect(apiFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('independent iteration', () => {
    it('should allow multiple independent iterations', async () => {
      let callCount = 0;
      const fetcher = jest.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: [callCount],
          hasMore: callCount < 3,
          nextPageParams: { page: callCount },
        });
      });

      const page = new Page(fetcher as (params: Record<string, unknown>) => Promise<PageResponse<number>>);

      // Two independent iterations should each get their own sequence
      const items1: number[] = [];
      const items2: number[] = [];

      // Start first iteration
      const iter1 = page[Symbol.asyncIterator]();
      // Start second iteration
      const iter2 = page[Symbol.asyncIterator]();

      // Interleave the iterations
      items1.push((await iter1.next()).value);
      items2.push((await iter2.next()).value);
      items1.push((await iter1.next()).value);
      items2.push((await iter2.next()).value);

      // Both iterations should work independently
      expect(items1.length).toBe(2);
      expect(items2.length).toBe(2);
    });
  });
});
