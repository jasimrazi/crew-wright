# Eval Case 2: REST API with Bearer Auth & Encrypted Note Store

Build a lightweight RESTful API service in TypeScript/JavaScript (Node.js) for managing encrypted user notes with Bearer token authentication.

Requirements:
1. Endpoints:
   - `POST /api/auth/token`: Issues a signed Bearer token given a valid client key.
   - `GET /api/notes`: Lists all notes belonging to the authenticated user.
   - `POST /api/notes`: Creates a new note (`title`, `content`, `tags`) with input validation.
   - `GET /api/notes/:id`: Retrieves a single note; returns 404 if not found, 403 if belonging to another user.
   - `DELETE /api/notes/:id`: Deletes a note.
2. Security & Boundaries:
   - Enforce Bearer token authorization on all `/api/notes*` routes; reject unauthenticated calls with HTTP 401.
   - Validate and sanitize input payloads against injection and oversized strings (max title: 100 chars, max content: 10,000 chars).
   - In-memory or file-backed storage with strict per-user isolation.
3. Architecture & Testing:
   - Modular structure: route handlers, auth middleware, note repository.
   - Full automated test suite verifying happy paths, expired/invalid tokens, authorization boundaries, and input validation failures.
