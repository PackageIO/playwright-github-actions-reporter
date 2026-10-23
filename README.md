![GitHub Actions job summary showing test statuses, durations, retries, and collapsible error details](assets/reporter.png)

In GitHub Actions, the reporter appends a test report to the job summary for every run outcome. The report groups tests by spec file and project, with overall and per-group outcome counts and durations. Test rows include retries, tags (including attributes added with Playwright annotations as `key.value` tags) and collapsible error details.

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
