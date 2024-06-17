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
        if(clean) {
            await t
                // remove text since replace doesn't work here
                .pressKey('ctrl+a')
                .pressKey('delete');
        }
        await t.typeText(input, command);
    }

    /**
     * Get text from monacoEditor
     */
    async getTextFromMonaco(): Promise<string> {
        const textAreaMonaco = Selector('[class^=view-lines ]');
        return (await textAreaMonaco.textContent).replace(/\s+/g, ' ');
    }
}
