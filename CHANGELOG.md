# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-10-20
### Changed
- Keep reporter output minimal: print the package name and version at run start, then write `result` to the GitHub Actions job summary only after a successful run.

## [1.0.0] - 2026-10-20
### Added
- Initial TypeScript Playwright reporter package.
- Print the package name and version when a test run begins.
- Write `result` to the GitHub Actions job summary after a successful run.
- Add CI and tag-based npm publishing workflows.