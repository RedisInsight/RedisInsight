import { Selector, t } from 'testcafe';
import { TriggersAndFunctionLibrary } from '../interfaces/triggers-and-functions';
import { LibrariesSections } from '../helpers/constants';
import { InstancePage } from './instance-page';

export class TriggersAndFunctionsLibrariesPage extends InstancePage {
    editMonacoButton = Selector('[data-testid=edit-monaco-value]');
    acceptButton = Selector('[data-testid=apply-btn]');

    inputMonaco = Selector('[class=inlineMonacoEditor]');
    textAreaMonaco = Selector('[class^=view-lines]');

    configurationLink = Selector('[data-testid=library-view-tab-config]');
    functionsLink = Selector('[data-testid=triggered-functions-tab-functions]');

    trashMask = '[data-testid=delete-library-icon-$name]';
    deleteMask = '[data-testid=delete-library-$name]';
    sectionMask = '[data-testid^=functions-$name]';
    functionMask = '[data-testid=func-$name]';

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
        const KeySpaceSection = Selector(this.sectionMask.replace(/\$name/g, sectionName));
        return KeySpaceSection.find(this.functionMask.replace(/\$name/g, functionsName));
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

    /**
     * Delete library
     * @param name The name os library
     */
    async deleteLibraryByName(name: string){
        await t.hover(this.getLibraryNameSelector(name))
            .click(Selector(this.trashMask.replace(/\$name/g, name)))
            .click(Selector(this.deleteMask.replace(/\$name/g, name)));
    }
}
