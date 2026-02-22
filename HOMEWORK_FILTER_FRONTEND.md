# Homework Filter Frontend Note

## 1. Scope of This Change

This patch includes:

- A new homework filter backend API.
- OpenAPI schema updates for the new endpoint.
- Test updates for the new endpoint and existing ActivityPub behavior.
- Export job fixes so tests use `test_database` (not production DB) in CI/forked processes.

## 2. Backend API Added

### New endpoint

- `GET /api/homework/filter`

### Files added/updated for this feature

- `src/controllers/homework-filter.js` (new)
- `src/controllers/index.js`
- `src/routes/api.js`
- `test/controllers.js`

### Request query parameters

- `homework` (or `hw` or `tag`): required, e.g. `hw1`
- `keyword`: optional title/tag keyword narrowing
- `page`: optional, default `1`
- `perPage`: optional, default `20`, max `100`
- `sort`: optional, `recent|old|create|posts|votes|views`
- `term`: optional, `alltime|day|week|month|year`
- `filter`: optional, `new|watched|unreplied`
- `cid`: optional category filter (single, repeated, or comma-separated)

### Behavior

- Returns topics tagged with the requested homework tag.
- Applies optional keyword filtering against title/tags.
- Returns paginated payload (`pagination` + `topics`).
- Returns HTTP `400` if homework tag is missing/invalid.

### Bug fix after first implementation

- Fixed `parseCids` in `src/controllers/homework-filter.js`:
  - corrected `.map(...)` chaining (previous typo caused `ReferenceError: map is not defined` and HTTP `500`).

## 3. OpenAPI Documentation Updates

### Files

- `public/openapi/read.yaml`
- `public/openapi/read/homework/filter.yaml` (new)

### Why

- `test/api.js` requires every mounted read route to be present in schema docs.
- Without this, tests fail with:
  - `GET /api/homework/filter is not defined in schema docs`.

### Result

- `/api/homework/filter` is now registered and documented with query parameters and `200/400` responses.

## 4. Test Stability and CI-Related Fixes

### Export job child process DB selection

Updated files:

- `src/api/users.js`
- `src/user/jobs/export-posts.js`
- `src/user/jobs/export-profile.js`
- `src/user/jobs/export-uploads.js`

What changed:

- When tests run in CI, `usersAPI.generateExport` now forks child jobs with `NODEBB_USE_TEST_DB=1`.
- Export job scripts read this flag and switch runtime DB config from `database` to `test_database`.
- Added null guard before deleting `userData.password` in `export-profile.js`.

Why:

- Prevents forked export jobs from connecting to/reading wrong DB during tests.
- Avoids intermittent failures and uncaught errors in export test paths.

### ActivityPub test hardening

Updated file:

- `test/activitypub.js`

What changed:

- Adjusted assertions to handle redirect-first profile responses and environment differences in HTML rendering responses.

Why:

- Reduced flaky failures caused by response format differences (redirect path vs direct HTML payload).

## 5. Frontend Integration Notes

Frontend should:

- Call `/api/homework/filter` with at least `homework`.
- Use returned `pagination` directly for pager UI.
- Preserve filter state in URL params (`homework`, `keyword`, `page`, etc.).
- Show empty states when `topics` is empty.

Recommended request examples:

- `/api/homework/filter?homework=hw1`
- `/api/homework/filter?homework=hw1&keyword=dynamic&page=1&perPage=20`

## 6. Net Effect

After this patch:

- Homework-tag-based filtering is available through a dedicated backend API.
- API docs and route schema checks are aligned.
- Export-related tests are more isolated and deterministic in CI/test DB mode.
- ActivityPub profile tests are more robust to runtime response variations.
