import { t } from 'testcafe';
import { BaseRunCommandsPage } from './base-run-commands-page';

export class SearchAndQueryPage extends BaseRunCommandsPage {

    /**
    * Select query using autosuggest
    * @param query Value of query
    */
    async selectFieldUsingAutosuggest(value: string): Promise<void> {
        await t.wait(200);
        await t.typeText(this.queryInput, '@', { replace: false });
        await t.expect(this.MonacoEditor.monacoSuggestion.visible).ok('Suggestions not displayed');
        await t.typeText(this.queryInput, value, { replace: false });
        // Select query option into autosuggest and go out of quotes
        await t.pressKey('tab');
        await t.pressKey('right');
        await t.pressKey('space');
    }
}
