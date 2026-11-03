import type { TestGroup } from '../report/model.js';
import { renderTestGroup } from './test-group.js';

export function renderTestDetails(groups: readonly TestGroup[]): string {
	return `<details>
<summary>Show test details</summary>

<br>

${groups.map(renderTestGroup).join('\n')}
</details>`;
}