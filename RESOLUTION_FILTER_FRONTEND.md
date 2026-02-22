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
Updated file:

- `test/...`

What changed:

- 

Why:

- 

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
