import { Selector, t } from 'testcafe';
import { TriggersAndFunctionLibrary } from '../interfaces/triggers-and-functions';
import { LibrariesSections } from '../helpers/constants';
import { InstancePage } from './instance-page';

export class TriggersAndFunctionsPage extends InstancePage {
    editMonacoButton = Selector('[data-testid=edit-monaco-value]');
    acceptButton = Selector('[data-testid=apply-btn]');

    inputMonaco = Selector('[class=inlineMonacoEditor]');
    textAreaMonaco = Selector('[class^=view-lines]');

    configurationLink = Selector('[data-testid=library-view-tab-config]');

    /**
     * Is library displayed in the table
     * @param libraryName The Library Name
     */
    getLibraryNameSelector(libraryName: string): Selector {
        return Selector(`[data-testid=row-${libraryName}]`);
    }

    /**
     * Get library item by name
     * @param libraryName The Library Name
     */
    async getLibraryItem(libraryName: string): Promise<TriggersAndFunctionLibrary> {
        const item = {} as TriggersAndFunctionLibrary;
        const row = this.getLibraryNameSelector(libraryName);
        item.name = await row.find('span').nth(0).textContent;
        item.user = await row.find('span').nth(1).textContent;
        item.pending = parseInt(await row.find('span').nth(2).textContent);
        item.totalFunctions = parseInt(await row.find('span').nth(3).textContent);

        return item;
    }

    /**
     * Is function displayed in the list
     * @param sectionName The functions Name
     * @param functionsName The section Name
     */
    getFunctionsByName(sectionName: LibrariesSections, functionsName: string): Selector {
        const KeySpaceSection = Selector(`[data-testid^=functions-${sectionName}]`);
        return KeySpaceSection.find(`[data-testid=func-${functionsName}]`);
    }

    /**
     * Send  commands in monacoEditor
     * @param commandPart1 The command that should be on the first line
     * @param commandPart2 command part except mandatory part
     */
    async sendTextToMonaco(commandPart1: string, commandPart2?: string): Promise<void> {

        await t
            // remove text since replace doesn't work here
            .pressKey('ctrl+a')
            .pressKey('delete')
            .typeText(this.inputMonaco, commandPart1);
        if (commandPart2) {
            await t.pressKey('enter')
                .typeText(this.inputMonaco, commandPart2);
        }
        await t.click(this.acceptButton);
    }

    /**
     * Get  text from monacoEditor
     */
    async getTextToMonaco(): Promise<string> {

        return (await this.textAreaMonaco.textContent).replace(/\s+/g, ' ');
    }
}
