import { describe, it, expect } from '@jest/globals';
import {
  parseJsonPointer,
  resolvePointer,
  resolveRefs,
  resolveDocument,
  hasUnresolvedRefs,
  collectRefs,
  type OpenAPIDocument,
} from '../exercises/04-ref-resolver.js';

describe('Exercise 04: $ref Resolver', () => {
  describe('parseJsonPointer', () => {
    it('should parse simple pointers', () => {
      expect(parseJsonPointer('#/components/schemas/User')).toEqual([
        'components',
        'schemas',
        'User',
      ]);
    });

    it('should parse root pointer', () => {
      expect(parseJsonPointer('#')).toEqual([]);
    });

    it('should unescape ~1 as /', () => {
      expect(parseJsonPointer('#/paths/~1users~1{id}/get')).toEqual([
        'paths',
        '/users/{id}',
        'get',
      ]);
    });

    it('should unescape ~0 as ~', () => {
      expect(parseJsonPointer('#/definitions/foo~0bar')).toEqual([
        'definitions',
        'foo~bar',
      ]);
    });

    it('should handle complex escaping', () => {
      expect(parseJsonPointer('#/a~1b/c~0d')).toEqual(['a/b', 'c~d']);
    });

    it('should throw for invalid pointers', () => {
      expect(() => parseJsonPointer('not-a-pointer')).toThrow();
      expect(() => parseJsonPointer('/no-hash')).toThrow();
    });
  });

  describe('resolvePointer', () => {
    const doc = {
      components: {
        schemas: {
          User: { type: 'object', properties: { id: { type: 'string' } } },
        },
      },
      paths: {
        '/users': { get: { summary: 'List users' } },
      },
    };

    it('should resolve simple paths', () => {
      expect(resolvePointer(doc, ['components', 'schemas', 'User'])).toEqual({
        type: 'object',
        properties: { id: { type: 'string' } },
      });
    });

    it('should resolve nested paths', () => {
      expect(
        resolvePointer(doc, ['components', 'schemas', 'User', 'properties', 'id'])
      ).toEqual({ type: 'string' });
    });

    it('should throw for non-existent paths', () => {
      expect(() =>
        resolvePointer(doc, ['components', 'schemas', 'NonExistent'])
      ).toThrow();
    });

    it('should handle array indices', () => {
      const docWithArray = { items: ['a', 'b', 'c'] };
      expect(resolvePointer(docWithArray, ['items', '1'])).toBe('b');
    });
  });

  describe('resolveRefs', () => {
    const baseDoc: OpenAPIDocument = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          Post: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              author: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
    };

    it('should resolve simple $ref', () => {
      const schema = { $ref: '#/components/schemas/User' };
      const result = resolveRefs(schema, baseDoc);

      expect(result.resolved).toEqual({
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      });
      expect(result.resolvedRefs.has('#/components/schemas/User')).toBe(true);
    });

    it('should resolve nested $refs', () => {
      const schema = { $ref: '#/components/schemas/Post' };
      const result = resolveRefs(schema, baseDoc);

      expect(result.resolved).toEqual({
        type: 'object',
        properties: {
          id: { type: 'string' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      });
    });

    it('should handle circular references with mark mode', () => {
      const circularDoc: OpenAPIDocument = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                children: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Node' },
                },
              },
            },
          },
        },
      };

      const result = resolveRefs(
        circularDoc.components!.schemas!.Node,
        circularDoc,
        { circularHandling: 'mark' }
      );

      expect(result.circularRefs.has('#/components/schemas/Node')).toBe(true);
      expect(result.resolved).toMatchObject({
        type: 'object',
        properties: {
          children: {
            type: 'array',
            items: { $circular: '#/components/schemas/Node' },
          },
        },
      });
    });

    it('should throw on circular with error mode', () => {
      const circularDoc: OpenAPIDocument = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            A: { $ref: '#/components/schemas/A' },
          },
        },
      };

      expect(() =>
        resolveRefs(circularDoc.components!.schemas!.A, circularDoc, {
          circularHandling: 'error',
        })
      ).toThrow(/[Cc]ircular/);
    });

    it('should preserve $ref with lazy mode', () => {
      const circularDoc: OpenAPIDocument = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                next: { $ref: '#/components/schemas/Node' },
              },
            },
          },
        },
      };

      const result = resolveRefs(
        circularDoc.components!.schemas!.Node,
        circularDoc,
        { circularHandling: 'lazy' }
      );

      expect(result.resolved).toMatchObject({
        type: 'object',
        properties: {
          next: { $ref: '#/components/schemas/Node' },
        },
      });
    });

    it('should throw on external refs', () => {
      const schema = { $ref: './other.yaml#/schemas/Foo' };
      expect(() => resolveRefs(schema, baseDoc)).toThrow(/[Ee]xternal/);
    });

    it('should resolve arrays with refs', () => {
      const doc: OpenAPIDocument = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Item: { type: 'string' },
            List: {
              type: 'array',
              items: { $ref: '#/components/schemas/Item' },
            },
          },
        },
      };

      const result = resolveRefs(doc.components!.schemas!.List, doc);

      expect(result.resolved).toEqual({
        type: 'array',
        items: { type: 'string' },
      });
    });

    it('should not mutate original when mutate: false', () => {
      const schema = { $ref: '#/components/schemas/User' };
      const originalSchema = JSON.parse(JSON.stringify(schema));

      resolveRefs(schema, baseDoc, { mutate: false });

      expect(schema).toEqual(originalSchema);
    });
  });

  describe('resolveDocument', () => {
    it('should resolve all refs in document', () => {
      const doc: OpenAPIDocument = {
        openapi: '3.0.3',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Base: { type: 'object', properties: { id: { type: 'string' } } },
            Extended: {
              allOf: [
                { $ref: '#/components/schemas/Base' },
                { type: 'object', properties: { name: { type: 'string' } } },
              ],
            },
          },
        },
      };

      const result = resolveDocument(doc);

      expect(
        result.resolved.components!.schemas!.Extended
      ).toMatchObject({
        allOf: [
          { type: 'object', properties: { id: { type: 'string' } } },
          { type: 'object', properties: { name: { type: 'string' } } },
        ],
      });
    });
  });

  describe('hasUnresolvedRefs', () => {
    it('should return false for resolved schema', () => {
      expect(hasUnresolvedRefs({ type: 'string' })).toBe(false);
      expect(
        hasUnresolvedRefs({
          type: 'object',
          properties: { id: { type: 'string' } },
        })
      ).toBe(false);
    });

    it('should return true for schema with $ref', () => {
      expect(hasUnresolvedRefs({ $ref: '#/components/schemas/User' })).toBe(
        true
      );
    });

    it('should detect nested $refs', () => {
      expect(
        hasUnresolvedRefs({
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
          },
        })
      ).toBe(true);
    });

    it('should detect $refs in arrays', () => {
      expect(
        hasUnresolvedRefs({
          type: 'array',
          items: { $ref: '#/components/schemas/Item' },
        })
      ).toBe(true);
    });
  });

  describe('collectRefs', () => {
    it('should collect all $ref paths', () => {
      const schema = {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          posts: {
            type: 'array',
            items: { $ref: '#/components/schemas/Post' },
          },
        },
      };

      const refs = collectRefs(schema);

      expect(refs.size).toBe(2);
      expect(refs.has('#/components/schemas/User')).toBe(true);
      expect(refs.has('#/components/schemas/Post')).toBe(true);
    });

    it('should return empty set for schema without refs', () => {
      const schema = { type: 'string' };
      expect(collectRefs(schema).size).toBe(0);
    });

    it('should handle oneOf/anyOf/allOf', () => {
      const schema = {
        oneOf: [
          { $ref: '#/components/schemas/A' },
          { $ref: '#/components/schemas/B' },
        ],
      };

      const refs = collectRefs(schema);

      expect(refs.size).toBe(2);
    });
  });
});
