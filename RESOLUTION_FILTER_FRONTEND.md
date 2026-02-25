# Resolution Filter Frontend Note

## 1. Scope of This Change

This patch includes:
- A filter option for open and resolved posts

## 2. Frontend UI Added

### Files added/updated for this feature

- `public/src/modules/sort.js`
- `public/src/client/category.js`
- `src/views/partials/category/sort.tpl` 
- `test/...`


### Behavior

- Displays option to filter posts by resolved or open
- Matches UI of the other 5 filter options
- When 'resolved posts' is clicked, the forum will only display resovled posts
- When 'open posts' is clicked, the forum will only display open posts


## 3. Testing
New file:

- `test/homework-filter`

What changed:

- Created a dedicated test suite using `JSDOM` to mock the frontend browser environment.

- Added tests to verify the correct URL is built when a homework filter is applied or cleared (ensuring existing parameters like `keyword` are preserved).

- Added UI state tests to verify the DOM updates correctly based on API data (showing an empty state alert when `topics` is empty, and hiding it when topics exist).

Why:

- To fulfill the specific requirements regarding URL parameter preservation and empty state handling.

- To cleanly separate frontend/UI DOM manipulation tests from pure backend or utility tests, making it easier to debug failures.

- To ensure a resilient user experience by formally covering the filter's happy path, unhappy path, and reset states.

## 4. Frontend Integration Notes

Frontend should:

- Call `/api/homework/filter` with at least `homework`.
- Use returned `pagination` directly for pager UI.
- Preserve filter state in URL params (`homework`, `keyword`, `page`, etc.).
- Show empty states when `topics` is empty.

Recommended request examples:

- `/api/homework/filter?homework=hw1`
- `/api/homework/filter?homework=hw1&keyword=dynamic&page=1&perPage=20`

## 5. Net Effect

After this patch:

- Homework-tag-based filtering is available through a dedicated backend API.
- API docs and route schema checks are aligned.
- Export-related tests are more isolated and deterministic in CI/test DB mode.
- ActivityPub profile tests are more robust to runtime response variations.
