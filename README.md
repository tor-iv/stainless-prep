# Getting Started

## Setup

```bash
# Install dependencies
npm install
```

## Workflow

1. Read the exercise file in `src/exercises/` - each contains:
   - Problem description and context
   - Type definitions (don't modify these)
   - Function stubs to implement
   - Sample inputs/outputs
   - Edge cases to consider
   - Hints at the bottom

2. Create your solution file in `src/solutions/`:
   ```bash
   # Example: create solution for exercise 01
   cp src/exercises/01-openapi-to-types.ts src/solutions/01-openapi-to-types.ts
   ```

3. Write tests in `src/tests/`:
   ```typescript
   // src/tests/01-openapi-to-types.test.ts
   import { generateTypeScript } from '../solutions/01-openapi-to-types.js';

   describe('generateTypeScript', () => {
     it('should generate interface for simple object', () => {
       // ...
     });
   });
   ```

4. Run tests:
   ```bash
   # Run all tests
   npm test

   # Watch mode for TDD
   npm run test:watch

   # Run specific test file
   npm test -- 01-openapi-to-types
   ```

## Exercise Order

The exercises build on each other conceptually:

1. **OpenAPI to Types** - Core type generation from schemas
2. **Retry with Backoff** - Network resilience patterns
3. **Pagination Iterator** - Async iteration for paginated APIs
4. **$ref Resolver** - JSON Schema reference resolution (builds on #1)
5. **HTTP Client** - Ties everything together in a client abstraction

## Sample Data

Use the OpenAPI specs in `sample-specs/` for testing:
- `users-api.json` - Simple CRUD API with User, Error schemas
- `chat-api.json` - Complex API similar to OpenAI/Anthropic with nested types, oneOf unions

## Tips

- Start with the hints at the bottom of each exercise file
- Use `npm run typecheck` to catch type errors without running tests
- The sample inputs/outputs in each file are good first test cases
- Edge cases section lists gotchas to handle
