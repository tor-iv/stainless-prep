import { describe, it, expect } from '@jest/globals';
import { generateTypeScript, schemaToInlineType, type OpenAPISchema } from '../exercises/01-openapi-to-types.js';

describe('Exercise 01: OpenAPI to TypeScript Types', () => {
  describe('schemaToInlineType', () => {
    it('should handle string type', () => {
      const schema: OpenAPISchema = { type: 'string' };
      expect(schemaToInlineType(schema)).toBe('string');
    });

    it('should handle number type', () => {
      const schema: OpenAPISchema = { type: 'number' };
      expect(schemaToInlineType(schema)).toBe('number');
    });

    it('should handle integer as number', () => {
      const schema: OpenAPISchema = { type: 'integer' };
      expect(schemaToInlineType(schema)).toBe('number');
    });

    it('should handle boolean type', () => {
      const schema: OpenAPISchema = { type: 'boolean' };
      expect(schemaToInlineType(schema)).toBe('boolean');
    });

    it('should handle nullable types', () => {
      const schema: OpenAPISchema = { type: 'string', nullable: true };
      expect(schemaToInlineType(schema)).toBe('string | null');
    });

    it('should handle string enums as unions', () => {
      const schema: OpenAPISchema = { type: 'string', enum: ['a', 'b', 'c'] };
      expect(schemaToInlineType(schema)).toBe("'a' | 'b' | 'c'");
    });

    it('should handle arrays', () => {
      const schema: OpenAPISchema = {
        type: 'array',
        items: { type: 'string' },
      };
      expect(schemaToInlineType(schema)).toBe('Array<string>');
    });

    it('should handle arrays with complex items', () => {
      const schema: OpenAPISchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      };
      const result = schemaToInlineType(schema);
      expect(result).toContain('Array<');
      expect(result).toContain('id: string');
    });
  });

  describe('generateTypeScript', () => {
    it('should generate a simple interface', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id'],
      };

      const result = generateTypeScript(schema, { typeName: 'User', export: true });

      expect(result).toContain('export interface User');
      expect(result).toContain('id: string');
      expect(result).toContain('name?: string'); // Optional because not in required
    });

    it('should add JSDoc for descriptions', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        description: 'A user object',
        properties: {
          id: { type: 'string', description: 'Unique ID' },
        },
        required: ['id'],
      };

      const result = generateTypeScript(schema, { typeName: 'User', export: true });

      expect(result).toContain('/** A user object */');
      expect(result).toContain('/** Unique ID */');
    });

    it('should handle enums as literal unions', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['admin', 'user', 'guest'] },
        },
        required: ['role'],
      };

      const result = generateTypeScript(schema, { typeName: 'User' });

      expect(result).toContain("'admin' | 'user' | 'guest'");
    });

    it('should handle nullable properties', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        properties: {
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      };

      const result = generateTypeScript(schema, { typeName: 'Entity' });

      expect(result).toContain('string | null');
    });

    it('should handle oneOf as union type', () => {
      const schema: OpenAPISchema = {
        oneOf: [
          { type: 'string' },
          { type: 'number' },
        ],
      };

      const result = generateTypeScript(schema, { typeName: 'StringOrNumber' });

      expect(result).toContain('type StringOrNumber = string | number');
    });

    it('should handle allOf as intersection type', () => {
      const schema: OpenAPISchema = {
        allOf: [
          {
            type: 'object',
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
          {
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name'],
          },
        ],
      };

      const result = generateTypeScript(schema, { typeName: 'Combined' });

      expect(result).toContain('&');
    });

    it('should handle additionalProperties: true', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        additionalProperties: true,
      };

      const result = generateTypeScript(schema, { typeName: 'Dict' });

      expect(result).toContain('Record<string, unknown>');
    });

    it('should handle additionalProperties with schema', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        additionalProperties: { type: 'string' },
      };

      const result = generateTypeScript(schema, { typeName: 'StringDict' });

      expect(result).toContain('Record<string, string>');
    });

    it('should escape property names that need quotes', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        properties: {
          'kebab-case': { type: 'string' },
          '123numeric': { type: 'string' },
          normalName: { type: 'string' },
        },
      };

      const result = generateTypeScript(schema, { typeName: 'Mixed' });

      expect(result).toContain('"kebab-case"');
      expect(result).toContain('"123numeric"');
      expect(result).not.toContain('"normalName"');
    });
  });

  describe('real-world schemas', () => {
    it('should handle User schema like Stainless SDKs', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        description: 'A user in the system',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Unique identifier' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          age: { type: 'integer', nullable: true },
          role: { type: 'string', enum: ['admin', 'user', 'guest'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'role'],
      };

      const result = generateTypeScript(schema, { typeName: 'User', export: true });

      // Required props don't have ?
      expect(result).toMatch(/id:\s*string/);
      expect(result).toMatch(/email:\s*string/);
      expect(result).toMatch(/role:\s*'admin' \| 'user' \| 'guest'/);

      // Optional props have ?
      expect(result).toMatch(/name\?:/);
      expect(result).toMatch(/age\?:\s*number \| null/);
      expect(result).toMatch(/createdAt\?:/);
    });

    it('should handle paginated response', () => {
      const schema: OpenAPISchema = {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                value: { type: 'number' },
              },
              required: ['id', 'value'],
            },
          },
          has_more: { type: 'boolean' },
          next_cursor: { type: 'string', nullable: true },
        },
        required: ['data', 'has_more'],
      };

      const result = generateTypeScript(schema, { typeName: 'PagedResponse', export: true });

      expect(result).toContain('data:');
      expect(result).toContain('Array<');
      expect(result).toContain('has_more: boolean');
      expect(result).toContain('next_cursor?: string | null');
    });
  });
});
