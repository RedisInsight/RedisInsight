import { Selector, t } from 'testcafe';

export class MonacoEditor {
    /**
     * Send commands in monacoEditor
     * @param input The input locator
     * @param command command
     * @param clean if  field should be cleaned
     */
    static async sendTextToMonaco(input: Selector, command: string, clean = true): Promise<void> {
        if(clean) {
            await t.click(input);
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
    static async getTextFromMonaco(): Promise<string> {
        const textAreaMonaco = Selector('[class^=view-lines ]');
        return (await textAreaMonaco.textContent).replace(/\s+/g, ' ');
    }
}
