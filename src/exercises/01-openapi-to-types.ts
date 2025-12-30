/**
 * Exercise 01: OpenAPI Schema to TypeScript Types
 * ================================================
 *
 * This is the core of what Stainless does - generating type-safe SDKs from OpenAPI specs.
 * You'll implement a simplified version of their schema-to-types conversion.
 *
 * CONTEXT:
 * - Stainless generates SDKs for OpenAI, Anthropic, Cloudflare, Meta, and others
 * - Type generation is central to their value proposition: compile-time safety
 * - The generated types should be idiomatic TypeScript, not just valid TypeScript
 *
 * YOUR TASK:
 * Implement `generateTypeScript()` which takes an OpenAPI schema object and returns
 * a string of TypeScript type definitions.
 *
 * REQUIREMENTS:
 * 1. Support basic types: string, number, integer, boolean, null
 * 2. Support string formats: date, date-time, uuid, email, uri
 * 3. Support arrays with typed items
 * 4. Support objects with properties (required vs optional)
 * 5. Support enums (as string literal unions)
 * 6. Support nullable types (using | null)
 * 7. Support oneOf/anyOf (as union types)
 * 8. Support allOf (as intersection types)
 * 9. Handle nested schemas recursively
 * 10. Generate JSDoc comments from description fields
 */

// ============================================================================
// TYPE DEFINITIONS - DO NOT MODIFY
// ============================================================================

/** OpenAPI 3.0 Schema Object (simplified) */
export interface OpenAPISchema {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  format?: 'date' | 'date-time' | 'uuid' | 'email' | 'uri' | 'int32' | 'int64' | 'float' | 'double';
  description?: string;
  enum?: readonly (string | number | boolean | null)[];
  nullable?: boolean;

  // Array-specific
  items?: OpenAPISchema;

  // Object-specific
  properties?: Record<string, OpenAPISchema>;
  required?: readonly string[];
  additionalProperties?: boolean | OpenAPISchema;

  // Composition
  oneOf?: readonly OpenAPISchema[];
  anyOf?: readonly OpenAPISchema[];
  allOf?: readonly OpenAPISchema[];

  // Reference (bonus - see exercise 04 for full $ref resolution)
  $ref?: string;

  // Default value
  default?: unknown;
}

export interface GeneratorOptions {
  /** Name for the root type being generated */
  typeName: string;
  /** Whether to export the type */
  export?: boolean;
  /** Indentation string (default: '  ') */
  indent?: string;
}

// ============================================================================
// YOUR IMPLEMENTATION GOES HERE
// ============================================================================

/**
 * Generate TypeScript type definition from an OpenAPI schema.
 *
 * @param schema - The OpenAPI schema object to convert
 * @param options - Generation options (type name, export, indentation)
 * @returns TypeScript type definition as a string
 */
export function generateTypeScript(schema: OpenAPISchema, options: GeneratorOptions): string {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Helper: Convert an OpenAPI schema to its inline TypeScript type representation.
 * This is used recursively for nested types.
 *
 * @param schema - The OpenAPI schema to convert
 * @returns The TypeScript type as a string (e.g., "string", "number[]", "{ foo: string }")
 */
export function schemaToInlineType(schema: OpenAPISchema): string {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

// ============================================================================
// SAMPLE INPUT/OUTPUT
// ============================================================================

/*
SAMPLE INPUT 1 - Simple object:

const userSchema: OpenAPISchema = {
  type: 'object',
  description: 'A user in the system',
  properties: {
    id: { type: 'string', format: 'uuid', description: 'Unique identifier' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    age: { type: 'integer', nullable: true },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'email', 'role']
};

generateTypeScript(userSchema, { typeName: 'User', export: true });

EXPECTED OUTPUT 1:

/** A user in the system */
export interface User {
  /** Unique identifier */
  id: string;
  email: string;
  name?: string;
  age?: number | null;
  role: 'admin' | 'user' | 'guest';
  createdAt?: string;
}


SAMPLE INPUT 2 - Array with nested objects:

const paginatedResponseSchema: OpenAPISchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          value: { type: 'number' }
        },
        required: ['id', 'value']
      }
    },
    hasMore: { type: 'boolean' },
    nextCursor: { type: 'string', nullable: true }
  },
  required: ['data', 'hasMore']
};

generateTypeScript(paginatedResponseSchema, { typeName: 'PaginatedResponse', export: true });

EXPECTED OUTPUT 2:

export interface PaginatedResponse {
  data: Array<{
    id: string;
    value: number;
  }>;
  hasMore: boolean;
  nextCursor?: string | null;
}


SAMPLE INPUT 3 - Union types with oneOf:

const apiResponseSchema: OpenAPISchema = {
  oneOf: [
    {
      type: 'object',
      properties: {
        success: { type: 'boolean', enum: [true] },
        data: { type: 'object', additionalProperties: true }
      },
      required: ['success', 'data']
    },
    {
      type: 'object',
      properties: {
        success: { type: 'boolean', enum: [false] },
        error: { type: 'string' }
      },
      required: ['success', 'error']
    }
  ]
};

generateTypeScript(apiResponseSchema, { typeName: 'ApiResponse', export: true });

EXPECTED OUTPUT 3:

export type ApiResponse = {
  success: true;
  data: Record<string, unknown>;
} | {
  success: false;
  error: string;
};

*/

// ============================================================================
// EDGE CASES TO CONSIDER
// ============================================================================

/*
1. Empty object type: { type: 'object' } without properties
   -> Should generate: Record<string, unknown> or {}

2. additionalProperties: true vs additionalProperties: { type: 'string' }
   -> true: Record<string, unknown>
   -> schema: Record<string, string>

3. Mixed required and optional properties
   -> Required props: `prop: Type`
   -> Optional props: `prop?: Type`

4. Nullable + optional (both can apply)
   -> `prop?: Type | null` (optional AND can be null when present)

5. Deeply nested objects (3+ levels)
   -> Maintain proper indentation and type nesting

6. Enum with mixed types: enum: [1, 'two', true, null]
   -> `1 | 'two' | true | null`

7. allOf with multiple object schemas (intersection)
   -> `Type1 & Type2 & Type3`

8. Empty enum array or empty oneOf/anyOf
   -> Handle gracefully (never type?)

9. Circular references via $ref
   -> For this exercise, just output the ref name
   -> Full resolution is in exercise 04

10. Property names that need escaping: "foo-bar", "123", "class"
    -> Use quoted property syntax: "foo-bar": string

11. Description with special characters (quotes, newlines)
    -> Escape properly in JSDoc comments
*/

// ============================================================================
// HINTS
// ============================================================================

/*
HINT 1: Start with schemaToInlineType() and build up complexity:
  - Handle primitives first (string, number, boolean)
  - Add format handling (date-time -> string, but you could add a comment)
  - Add nullable support
  - Add enum support
  - Add array support (recursive call for items)
  - Add object support (recursive calls for properties)
  - Finally, handle oneOf/anyOf/allOf

HINT 2: For generating clean output, track indentation level:

  function generateObject(schema: OpenAPISchema, indent: number): string {
    const spaces = '  '.repeat(indent);
    // ...
  }

HINT 3: Property name escaping - use a helper:

  function needsQuotes(name: string): boolean {
    return !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
  }

HINT 4: For JSDoc comments, handle multi-line descriptions:

  function formatJSDoc(description: string, indent: string): string {
    const lines = description.split('\n');
    if (lines.length === 1) {
      return `${indent}/** ${description} */\n`;
    }
    // Multi-line JSDoc formatting...
  }

HINT 5: Think about type vs interface:
  - Use `interface` for plain object types (extensible, better error messages)
  - Use `type` for unions, intersections, and primitives
  - Stainless typically uses interfaces for response types

HINT 6: The Stainless/OpenAI SDK uses these conventions:
  - Interfaces for request params and response types
  - String literal unions for enums (not TypeScript enums)
  - `| null` for nullable, `?:` for optional
  - Proper JSDoc with @deprecated, @example when available
*/
