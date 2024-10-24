import { Selector, t } from 'testcafe';

export class MonacoEditor {
    //MONACO ELEMENTS
    monacoCommandDetails = Selector('div.suggest-details-container');
    monacoSuggestion = Selector('span.monaco-icon-name-container');
    monacoContextMenu = Selector('div.shadow-root-host').shadowRoot();
    monacoShortcutInput = Selector('input.input');
    monacoSuggestionOption = Selector('div.monaco-list-row');
    monacoHintWithArguments = Selector('[widgetid="editor.widget.parameterHintsWidget"]');
    monacoCommandIndicator = Selector('div.monaco-glyph-run-command');
    monacoWidget = Selector('[data-testid=monaco-widget]');
    monacoSuggestWidget = Selector('.suggest-widget');
    nonRedisEditorResizeBottom = Selector('.t_resize-bottom');
    nonRedisEditorResizeTop = Selector('.t_resize-top');

    /**
     * Send commands in monacoEditor
     * @param input The input locator
     * @param command command
     * @param clean if  field should be cleaned
     */
    async sendTextToMonaco(input: Selector, command: string, clean = true): Promise<void> {

        await t.click(input);
        if (clean) {
            await t
                // remove text since replace doesn't work here
                .pressKey('ctrl+a')
                .pressKey('delete');
        }
        await t.typeText(input, command);
    }

    /**
     * Send lines in monacoEditor without additional space that typeText can add
     * @param input The input locator
     * @param lines lines
     * @param depth level of depth of the object
     */
    async insertTextByLines(input: Selector, lines: string[], depth: number): Promise<void> {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            for (let j = 0; j < depth; j++) {
                await t.pressKey('shift+tab');
            }

            if (line) {
                await t.typeText(input, line, { paste: true });
            }
            await t.pressKey('esc');
            await t.pressKey('enter');
        }
    }

    /**
     * Get text from monacoEditor
     */
    async getTextFromMonaco(): Promise<string> {
        const textAreaMonaco = Selector('[class^=view-lines ]');
        return (await textAreaMonaco.textContent).replace(/\s+/g, ' ');
    }

    /**
    * Get suggestions as ordered array from monaco from the beginning
    * @param suggestions number of elements to get
    */
    async getSuggestionsArrayFromMonaco(suggestions: number): Promise<string[]> {
        const textArray: string[] = [];
        const suggestionElements = this.monacoSuggestion;

        for (let i = 0; i < suggestions; i++) {
            const suggestionItem = suggestionElements.nth(i);
            if (await suggestionItem.exists) {
                textArray.push(await suggestionItem.textContent);
            }
        }

        return textArray;
    }
}
