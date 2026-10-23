![GitHub Actions job summary showing test statuses, durations, retries, and collapsible error details](assets/reporter.png)

In GitHub Actions, the reporter appends a test report to the job summary for every run outcome. The overall summary and each spec group show counts only for outcomes that occurred, plus the duration. Spec groups and test rows use ✅ passed, ❌ failed, ⚠️ flaky, and ⏭️ skipped status icons. Test rows include retries, tags (including attributes added with Playwright annotations as `key.value` tags) and collapsible error details.

To preview the report locally, run `npx playwright test --config=playwright.example.config.ts`. The example tests are in `test_examples/` and include failing, skipped, and flaky cases to demonstrate their report output.

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
