# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript practice repository for Stainless engineering interview preparation. It contains five exercises focused on SDK generation patterns - the core technology Stainless uses to generate type-safe SDKs from OpenAPI specs for companies like OpenAI, Anthropic, Cloudflare, and Meta.

## Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check without emitting
npm run typecheck

# Lint
npm run lint
```

## Project Structure

```
src/
  exercises/     # Exercise files with problem descriptions and type definitions
  solutions/     # Implement solutions here
  tests/         # Test files (pattern: *.test.ts)
sample-specs/    # Sample OpenAPI specs (users-api.json, chat-api.json)
```

## TypeScript Configuration

- ES2022 target with NodeNext module resolution (ESM)
- Strict mode enabled with additional safety flags: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`
- Tests use Jest with ts-jest ESM preset

## Exercises

1. **OpenAPI to TypeScript Types** (`01-openapi-to-types.ts`) - Parse OpenAPI schemas and generate TypeScript interfaces. Handle primitives, arrays, objects, enums, nullable types, unions (oneOf/anyOf), intersections (allOf), and JSDoc comments.

2. **Retry with Backoff** (`02-retry-with-backoff.ts`) - Implement exponential backoff with jitter for transient failures. Handle Retry-After headers, AbortSignal cancellation, and retriable HTTP status codes (408, 409, 429, 5xx).

3. **Pagination Iterator** (`03-pagination-iterator.ts`) - Build async iterators for cursor-based and offset-based pagination. Implement `for await...of` protocol plus manual `hasNextPage()`/`getNextPage()` methods.

4. **$ref Resolver** (`04-ref-resolver.ts`) - Resolve JSON Schema `$ref` pointers in OpenAPI documents. Handle nested refs, circular reference detection, and JSON Pointer parsing (RFC 6901 with ~0/~1 escaping).

5. **HTTP Client Abstraction** (`05-http-client-abstraction.ts`) - Design a type-safe HTTP client with authentication, request/response interceptors, timeout handling, and error mapping to typed error classes.

## Key Patterns

- Use `interface` for object types, `type` for unions/intersections
- String literal unions for enums (not TypeScript enums)
- `| null` for nullable, `?:` for optional
- Each exercise file contains: type definitions (DO NOT MODIFY section), function stubs to implement, sample inputs/outputs, edge cases, and hints
