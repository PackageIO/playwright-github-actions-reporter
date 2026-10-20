# Contributing

Contributions are welcome. Please open an issue to discuss larger changes before starting implementation.

## Development

1. Fork the repository and create a feature branch from `main`.
2. Install dependencies with `npm ci`.
3. Add or update tests in `test/` for behavior changes.
4. Run `npm test` and `npm pack --dry-run` before submitting.
5. Open a pull request against `main` and wait for the CI workflow to pass.

The reporter is implemented in TypeScript under `src/`. `npm test` compiles the source and runs the Node.js test suite. Keep changes focused and update the README or changelog when user-facing behavior changes.

## Releases

Releases are published from version tags. The tag must match the version in `package.json`; for example, version `1.0.0` uses tag `v1.0.0`. See the README for the initial publish steps and npm Trusted Publisher configuration.