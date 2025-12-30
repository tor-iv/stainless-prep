/**
 * Exercise 04: JSON Schema $ref Resolver
 * =======================================
 *
 * OpenAPI specs use JSON References ($ref) extensively to avoid duplication
 * and organize schemas. Before generating types, these references must be resolved
 * to their actual schema definitions.
 *
 * CONTEXT:
 * - OpenAPI 3.x uses $ref for reusable components: "#/components/schemas/User"
 * - References can be nested (a $ref pointing to a schema that has more $refs)
 * - Circular references are common (User -> Post -> User)
 * - External file references also exist: "./common.yaml#/definitions/Error"
 *
 * YOUR TASK:
 * Implement a $ref resolver that can dereference JSON pointers within an OpenAPI
 * document, handling nested and circular references gracefully.
 *
 * REQUIREMENTS:
 * 1. Resolve internal $ref pointers (e.g., "#/components/schemas/User")
 * 2. Handle nested references (resolved schema may contain more $refs)
 * 3. Detect and handle circular references without infinite loops
 * 4. Support both full replacement and inline expansion modes
 * 5. Preserve other schema properties alongside $ref (though per spec, $ref should be alone)
 * 6. Provide helpful error messages for invalid references
 */

// ============================================================================
// TYPE DEFINITIONS - DO NOT MODIFY
// ============================================================================

/** A schema that may contain $ref */
export interface RefSchema {
  $ref?: string;
  [key: string]: unknown;
}

/** OpenAPI document structure (simplified) */
export interface OpenAPIDocument {
  openapi: string;
  info: { title: string; version: string };
  paths?: Record<string, unknown>;
  components?: {
    schemas?: Record<string, RefSchema>;
    responses?: Record<string, RefSchema>;
    parameters?: Record<string, RefSchema>;
    requestBodies?: Record<string, RefSchema>;
  };
}

/** Options for resolution behavior */
export interface ResolveOptions {
  /**
   * How to handle circular references:
   * - 'error': Throw an error when circular ref detected
   * - 'mark': Replace with { $circular: refPath }
   * - 'lazy': Keep the $ref in place for lazy resolution
   */
  circularHandling?: 'error' | 'mark' | 'lazy';

  /**
   * Maximum depth for nested resolution (default: 100)
   * Prevents stack overflow on deeply nested structures
   */
  maxDepth?: number;

  /**
   * Whether to mutate the original document or create a deep clone
   */
  mutate?: boolean;
}

/** Result of resolution with metadata */
export interface ResolveResult<T> {
  /** The resolved schema */
  resolved: T;
  /** Set of all $ref paths that were resolved */
  resolvedRefs: Set<string>;
  /** Set of circular reference paths detected */
  circularRefs: Set<string>;
}

// ============================================================================
// YOUR IMPLEMENTATION GOES HERE
// ============================================================================

/**
 * Parse a JSON Pointer string into path segments.
 * JSON Pointer is defined in RFC 6901.
 *
 * Examples:
 * - "#/components/schemas/User" -> ["components", "schemas", "User"]
 * - "#/paths/~1users~1{id}/get" -> ["paths", "/users/{id}", "get"]
 *
 * Note: ~0 escapes ~, ~1 escapes /
 */
export function parseJsonPointer(pointer: string): string[] {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Resolve a JSON Pointer path against a document.
 * Returns the value at that path, or throws if not found.
 *
 * @param document - The root document
 * @param path - Array of path segments
 * @returns The value at the path
 * @throws Error if path doesn't exist
 */
export function resolvePointer(document: unknown, path: string[]): unknown {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Resolve all $ref references in a schema, returning a fully dereferenced schema.
 *
 * @param schema - The schema to resolve
 * @param document - The root document containing component definitions
 * @param options - Resolution options
 * @returns The resolved schema with metadata
 */
export function resolveRefs<T extends RefSchema>(
  schema: T,
  document: OpenAPIDocument,
  options?: ResolveOptions
): ResolveResult<T> {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Resolve all references in an entire OpenAPI document.
 * This processes all schemas in components and inline schemas in paths.
 *
 * @param document - The OpenAPI document
 * @param options - Resolution options
 * @returns The fully resolved document with metadata
 */
export function resolveDocument(
  document: OpenAPIDocument,
  options?: ResolveOptions
): ResolveResult<OpenAPIDocument> {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Check if a schema has any unresolved $refs.
 * Useful for validation after resolution.
 */
export function hasUnresolvedRefs(schema: unknown): boolean {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

/**
 * Get all $ref paths used in a schema (without resolving them).
 * Useful for dependency analysis.
 */
export function collectRefs(schema: unknown): Set<string> {
  // TODO: Implement this function
  throw new Error('Not implemented');
}

// ============================================================================
// SAMPLE INPUT/OUTPUT
// ============================================================================

/*
SAMPLE INPUT:

const doc: OpenAPIDocument = {
  openapi: '3.0.3',
  info: { title: 'Example API', version: '1.0.0' },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          posts: {
            type: 'array',
            items: { $ref: '#/components/schemas/Post' }
          }
        }
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          author: { $ref: '#/components/schemas/User' }  // Circular!
        }
      },
      CreateUserRequest: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              password: { type: 'string' }
            }
          }
        ]
      }
    }
  }
};

// Resolve the User schema
const result = resolveRefs(
  doc.components!.schemas!.User,
  doc,
  { circularHandling: 'mark' }
);

EXPECTED OUTPUT:

result.resolved = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    posts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          author: { $circular: '#/components/schemas/User' }  // Marked as circular
        }
      }
    }
  }
};

result.resolvedRefs = Set { '#/components/schemas/Post' };
result.circularRefs = Set { '#/components/schemas/User' };


// Parse JSON Pointer examples:
parseJsonPointer('#/components/schemas/User')
// => ['components', 'schemas', 'User']

parseJsonPointer('#/paths/~1users~1{id}/get/responses/200')
// => ['paths', '/users/{id}', 'get', 'responses', '200']
*/

// ============================================================================
// EDGE CASES TO CONSIDER
// ============================================================================

/*
1. Self-referential schema
   -> { $ref: '#/components/schemas/Node', properties: { children: { type: 'array', items: { $ref: '#/components/schemas/Node' } } } }
   -> Circular at the first level

2. Deeply nested circular reference
   -> A -> B -> C -> A
   -> Should detect and handle

3. $ref with sibling properties (technically invalid per spec)
   -> { $ref: '#/...', description: 'Override description' }
   -> Some tools merge, some ignore siblings

4. Reference to non-existent path
   -> Should throw helpful error with the invalid path

5. Reference to non-schema value
   -> #/info/title points to a string, not a schema
   -> May be valid in some contexts

6. Empty components
   -> Document has no components.schemas
   -> Should handle gracefully

7. External file references
   -> "$ref": "./other-file.yaml#/components/schemas/Foo"
   -> For this exercise, throw "External references not supported"

8. URL references
   -> "$ref": "https://example.com/schema.json"
   -> Also throw "External references not supported"

9. Escaped characters in path
   -> ~0 for ~, ~1 for /
   -> Must unescape correctly

10. Array indices in path
    -> #/components/schemas/0 (if schemas were an array)
    -> Should work with numeric indices

11. maxDepth exceeded
    -> Very deep nesting without circularity
    -> Should throw with clear message

12. Mutate vs clone
    -> mutate: false should not modify original
    -> mutate: true can modify for performance
*/

// ============================================================================
// HINTS
// ============================================================================

/*
HINT 1: JSON Pointer unescaping:

  function unescapePointer(segment: string): string {
    return segment.replace(/~1/g, '/').replace(/~0/g, '~');
  }

  function parseJsonPointer(pointer: string): string[] {
    if (!pointer.startsWith('#/')) {
      if (pointer.startsWith('#')) return []; // Root reference
      throw new Error(`Invalid JSON pointer: ${pointer}`);
    }
    return pointer
      .slice(2)
      .split('/')
      .map(unescapePointer);
  }

HINT 2: Path resolution:

  function resolvePointer(doc: unknown, path: string[]): unknown {
    let current = doc;
    for (const segment of path) {
      if (current === null || current === undefined) {
        throw new Error(`Cannot resolve path: value is ${current}`);
      }
      if (typeof current !== 'object') {
        throw new Error(`Cannot resolve path: expected object, got ${typeof current}`);
      }
      current = (current as Record<string, unknown>)[segment];
    }
    return current;
  }

HINT 3: Tracking visited refs for circular detection:

  function resolveRefsRecursive(
    schema: unknown,
    doc: OpenAPIDocument,
    visited: Set<string>,  // Track refs being resolved in current chain
    resolved: Set<string>, // Track all refs that have been resolved
    circular: Set<string>, // Track circular refs found
    depth: number,
    options: Required<ResolveOptions>
  ): unknown {
    // ...
  }

HINT 4: Deep clone helper:

  function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

HINT 5: Check if value is a ref object:

  function isRefObject(value: unknown): value is { $ref: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      '$ref' in value &&
      typeof (value as { $ref: unknown }).$ref === 'string'
    );
  }

HINT 6: Recursive resolution structure:

  if (isRefObject(schema)) {
    const refPath = schema.$ref;

    // Check for external refs
    if (!refPath.startsWith('#')) {
      throw new Error(`External references not supported: ${refPath}`);
    }

    // Check for circular
    if (visited.has(refPath)) {
      circular.add(refPath);
      switch (options.circularHandling) {
        case 'error': throw new Error(`Circular reference: ${refPath}`);
        case 'mark': return { $circular: refPath };
        case 'lazy': return { $ref: refPath };
      }
    }

    // Resolve the reference
    const path = parseJsonPointer(refPath);
    const target = resolvePointer(doc, path);
    resolved.add(refPath);

    // Recursively resolve the target
    visited.add(refPath);
    const result = resolveRefsRecursive(target, doc, visited, resolved, circular, depth + 1, options);
    visited.delete(refPath);

    return result;
  }

HINT 7: Handle objects and arrays recursively:

  if (Array.isArray(schema)) {
    return schema.map(item =>
      resolveRefsRecursive(item, doc, visited, resolved, circular, depth + 1, options)
    );
  }

  if (typeof schema === 'object' && schema !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      result[key] = resolveRefsRecursive(value, doc, visited, resolved, circular, depth + 1, options);
    }
    return result;
  }

  return schema; // Primitives pass through
*/
