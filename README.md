# @packageio/playwright-github-actions-reporter

## Install

```sh
npm install --save-dev @packageio/playwright-github-actions-reporter
```

## Configure

Add the reporter to `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
	reporter: [
		['list'],
		['@packageio/playwright-github-actions-reporter'],
	],
})
```

At the start of each run, the reporter prints its package name and version.

## Development

```sh
npm install
npm test
npm run format
```

Run `npm run format` to format the TypeScript source, tests, and Playwright config with Biome. Use `npm run format:check` to verify formatting without changing files.
