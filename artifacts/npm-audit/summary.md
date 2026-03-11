# npm audit (P3 Part A) Summary

Date: 2026-03-11
Branch: feature/npm-audit-v2

## Commands Used

```bash
npm i --prefix install --package-lock-only --ignore-scripts
npm audit --prefix install
npm audit --json --prefix install > artifacts/npm-audit/npm-audit-report.json
```

## What Was Changed

Updated dependency versions in `install/package.json`:

- `multer`: `2.0.2` -> `2.1.1`
- `nodebb-plugin-dbsearch`: `6.3.4` -> `6.4.1`
- `nodebb-plugin-mentions`: `4.8.5` -> `4.8.17`
- `terser-webpack-plugin`: `5.3.16` -> `5.4.0`
- `lodash`: `4.17.21` -> `4.17.23`

Generated audit artifacts:

- `artifacts/npm-audit/npm-audit-output.txt`
- `artifacts/npm-audit/npm-audit-report.json`

## Results

- Initial audit after creating lockfile: **22 vulnerabilities**
  - `5 low`, `6 moderate`, `9 high`, `2 critical`
- After dependency updates: **17 vulnerabilities**
  - `5 low`, `3 moderate`, `7 high`, `2 critical`

## Remaining Risk and Why

Some vulnerabilities are in legacy/transitive packages with no clean non-breaking fix from `npm audit`:

- `request` chain (`request`, `form-data`, `qs`, `tough-cookie`) via `coveralls`
- old `grunt` toolchain (`minimatch`, `gaze`, `globule`)
- `mocha`/`diff`/`serialize-javascript` path where `audit` suggests force changes

I did not run `npm audit fix --force` because it proposes potentially breaking version changes/downgrades.
