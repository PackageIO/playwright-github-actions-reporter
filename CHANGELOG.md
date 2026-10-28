# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-10-27

### Changed
- Show the test total, outcome counts, and duration together in the overall summary.
- Style outcome counts and duration as italic inline code in spec group summaries.
- Wrap rendered error lines at 80 characters.

## [1.5.1] - 2026-10-23

### Changed
- Omit project names from the overall test summary.

## [1.5.0] - 2026-10-23

### Changed
- Show only nonzero outcome counts in report summaries, with the run duration and project name in the overall summary.
- Use status emojis for each spec group and test row while keeping summary counts emoji-free.
- Rename the report preview tests directory to `test_examples`.

## [1.4.0] - 2026-10-22

### Changed
- Show tags and attribute-shaped Playwright annotations beneath each test title.
- Show only the first error from each attempt, with retry labels matching the attempt number.
- Use concise test titles and place retries before duration in the test table.
- Format durations as zero-padded milliseconds below one second and in seconds, minutes, or hours otherwise.

## [1.3.2] - 2026-10-21

### Changed
- Minor report style changes

## [1.3.1] - 2026-10-22

## [1.3.0] - 2026-10-21
### Added
- Add a dedicated status column with an icon and text label for each test.

### Changed
- Show the project name in each spec group heading instead of repeating it in the test table.
- Improve error visibility with collapsible, retry-specific error details.
- Remove inline status colors and separate report metadata from test details with a divider.

## [1.2.0] - 2026-10-21
### Added
- Add Biome formatting with `npm run format` and `npm run format:check` scripts.
- Add a pull request preview workflow with examples for passed, failed, skipped, and flaky test outcomes.
- Add detailed reports grouped by spec file and project, including outcome counts, durations, retries, tags, annotations, and collapsible error details.
- Make HTTP and HTTPS links in annotation descriptions clickable.

### Changed
- Format the generated report timestamp as `YYYY-MM-DD/HH:mm:ss` in UTC.
- Append a detailed GitHub Actions job summary for every run outcome.

## [1.0.4] - 2026-10-21
### Changed
- Rename the npm package scope to `@packageio` and update repository links to the `PackageIO` organization.

## [1.0.3] - 2026-10-21
### Changed
- Write a concise result to the GitHub Actions job summary for every run status, including failures, timeouts, and interruptions.

## [1.0.2] - 2026-10-21
### Fixed
- Add a default export condition so Playwright can resolve the reporter by package name.

## [1.0.1] - 2026-10-20
### Changed
- Keep reporter output minimal: print the package name and version at run start, then write `result` to the GitHub Actions job summary only after a successful run.

## [1.0.0] - 2026-10-20
### Added
- Initial TypeScript Playwright reporter package.
- Print the package name and version when a test run begins.
- Write `result` to the GitHub Actions job summary after a successful run.
- Add CI and tag-based npm publishing workflows.
