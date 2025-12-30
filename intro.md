I'm preparing for engineering interviews at Stainless, an early-stage startup (~40 people, NYC) that builds SDK generation tooling from OpenAPI specs. They power SDKs for OpenAI, Anthropic, Cloudflare, Meta, and others.

My background:
- 24 years old, Software Engineer at Bloomberg LP
- Focus on ETL pipelines, streaming architecture (Kafka), data migrations
- 6 years Python, 4-5 years C/C++/Bash, 1 year TypeScript
- Experience with APIs, data engineering, Apache Airflow, AWS

Set up a practice repo for Stainless-relevant coding exercises. Create a TypeScript project with the following structure:

/stainless-interview-prep
  /src
    /exercises
      01-openapi-to-types.ts      # Parse OpenAPI schema → generate TS interfaces
      02-retry-with-backoff.ts     # Exponential backoff with jitter
      03-pagination-iterator.ts   # Async iterator for cursor/offset pagination
      04-ref-resolver.ts          # Resolve $ref in JSON schemas
      05-http-client-abstraction.ts # Clean sync/async HTTP client interface
    /solutions                    # I'll work here
    /tests                        # Test files for each exercise
  /sample-specs                   # Sample OpenAPI specs to work with
  package.json
  tsconfig.json
  README.md

For each exercise file, include:
1. A clear problem description in comments
2. Type definitions / interfaces to implement
3. A simple sample input and expected output
4. Hints about edge cases to consider

Make the exercises progressively harder. Focus on:
- Clean, idiomatic TypeScript
- Proper typing (generics, conditional types where appropriate)
- Real-world SDK patterns Stainless would actually care about
- Good error handling and helpful error messages

Start me with exercise 01 (OpenAPI to TypeScript types) - this is the most directly relevant to what Stainless does.