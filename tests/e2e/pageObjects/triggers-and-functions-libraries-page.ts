import { Selector, t } from 'testcafe';
import { TriggersAndFunctionLibrary } from '../interfaces/triggers-and-functions';
import { LibrariesSections, MonacoEditorInputs } from '../helpers/constants';
import { MonacoEditor } from '../common-actions/monaco-editor';
import { InstancePage } from './instance-page';

export class TriggersAndFunctionsLibrariesPage extends InstancePage {
    //Buttons
    editMonacoButton = Selector('[data-testid=edit-monaco-value]');
    addLibraryButton = Selector('[data-testid=btn-add-library]');
    uploadFileButton = Selector('[data-testid=upload-file-btn]');
    addLibrarySubmitButton = Selector('[data-testid=add-library-btn-submit]');

    //CheckBoxes
    addConfigurationCheckBox = Selector('[data-testid=show-configuration] ~ label');

    //Inputs
    textAreaMonaco = Selector('[class^=view-lines]');

    //Links
    configurationLink = Selector('[data-testid=library-view-tab-config]');
    functionsLink = Selector('[data-testid=triggered-functions-tab-functions]');

    // Import
    uploadInput = Selector('[data-testid=upload-code-file]', { timeout: 2000 });

    //Masks
    trashMask = '[data-testid=delete-library-icon-$name]';
    deleteMask = '[data-testid=delete-library-$name]';
    sectionMask = '[data-testid^=functions-$name]';
    functionMask = '[data-testid=func-$name]';
    inputMonaco = '[data-testid=wrapper-$name]';

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
    async sendTextToMonaco(input: MonacoEditorInputs, commandPart1: string, commandPart2?: string): Promise<void> {
        const inputSelector = Selector(this.inputMonaco.replace(/\$name/g, input));
        await MonacoEditor.sendTextToMonaco(inputSelector, commandPart1);
        if (commandPart2) {
            await t.pressKey('enter');
            await MonacoEditor.sendTextToMonaco(inputSelector, commandPart2, false);
        }
    }

    /**
     * Delete library
     * @param name The name os library
     */
    async deleteLibraryByName(name: string): Promise<void> {
        await t.hover(this.getLibraryNameSelector(name))
            .click(Selector(this.trashMask.replace(/\$name/g, name)))
            .click(Selector(this.deleteMask.replace(/\$name/g, name)));
    }
}
