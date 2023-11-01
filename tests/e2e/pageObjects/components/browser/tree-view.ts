import { Selector, t } from 'testcafe';
import { Common } from '../../../helpers/common';

export class TreeView {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    treeViewSettingsBtn = Selector('[data-testid=tree-view-settings-btn]');
    treeViewDelimiterValueSave = Selector('[data-testid=tree-view-apply-btn]');
    treeViewDelimiterValueCancel = Selector('[data-testid=tree-view-cancel-btn]');
    sortingBtn = Selector('[data-testid=tree-view-sorting-select]');
    sortingASCoption = Selector('[id=ASC]');
    sortingDESCoption = Selector('[id=DESC]');
    sortingProgressBar = Selector('[data-testid=progress-key-tree]');
    // TEXT ELEMENTS
    treeViewKeysNumber = Selector('[data-testid^=count_]');
    treeViewDeviceFolder = Selector('[data-testid^=node-item_device] div');
    //INPUTS
    treeViewDelimiterInput = Selector('[data-testid=tree-view-delimiter-input]');

    /**
     * Get folder selector by folder name
     * @param folderName The name of the folder
     */
    getFolderSelectorByName(folderName: string): Selector {
        return Selector(`[data-testid^="node-item_${folderName}"]`);
    }

    /**
     * Get folder counter selector by folder name
     * @param folderName The name of the folder
     */
    getFolderCountSelectorByName(folderName: string): Selector {
        return Selector(`[data-testid^="count_${folderName}"]`);
    }

    /**
    * Verifying if the Keys are in the List of keys
    * @param keyNames The names of the keys
    * @param isDisplayed True if keys should be displayed
    */
    async verifyFolderDisplayingInTheList(folderName: string, isDisplayed: boolean): Promise<void> {
        isDisplayed
            ? await t.expect(this.getFolderSelectorByName(folderName).exists).ok(`The folder ${folderName} not found`)
            : await t.expect(this.getFolderSelectorByName(folderName).exists).notOk(`The folder ${folderName} found`);
    }

    /**
     * Change delimiter value
     * @delimiter string with delimiter value
     */
    async changeDelimiterInTreeView(delimiter: string): Promise<void> {
        // Open delimiter popup
        await t.click(this.treeViewSettingsBtn);
        // Apply new value to the field
        await t.typeText(this.treeViewDelimiterInput, delimiter, { replace: true, paste: true });
        // Click on save button
        await t.click(this.treeViewDelimiterValueSave);
    }

    /**
     * Change ordering value
     * @param order ASC/DESC ordering for tree view
     */
    async changeOrderingInTreeView(order: string): Promise<void> {
        // Open settings popup
        await t.click(this.treeViewSettingsBtn);
        await t.click(this.sortingBtn);
        order === 'ASC'
        ? await t.click(this.sortingASCoption)
        : await t.click(this.sortingDESCoption)

        // Click on save button
        await t.click(this.treeViewDelimiterValueSave);
        await Common.waitForElementNotVisible(this.sortingProgressBar);
    }

    /**
    * Get text from tree element by number
    * @param number The number of tree folder
    */
    async getTextFromNthTreeElement(number: number): Promise<string> {
        return (await Selector('[role="treeitem"]').nth(number).find('div').textContent).replace(/\s/g, '');
    }

    /**
    * Open tree folder with multiple level
    * @param names folder names with sequence of subfolder
    */
    async openTreeFolders(names: string[]): Promise<void> {
        let base = `node-item_${names[0]}:`;
        await t.click(Selector(`[data-testid="${base}"]`));
        if (names.length > 1) {
            for (let i = 1; i < names.length; i++) {
                base = `${base  }${names[i]}:`;
                await t.click(Selector(`[data-testid="${base}"]`));
            }
        }
    }

    /**
    * Get all keys from tree view list with order
    */
    async getAllItemsArray(): Promise<string[]> {
        const textArray: string[] = [];
        const treeViewItemElements = Selector('[role="treeitem"]');
        const itemCount = await treeViewItemElements.count;

        for (let i = 0; i < itemCount; i++) {
            const treeItem = treeViewItemElements.nth(i);
            const keyItem = treeItem.find('[data-testid^="key-"]');
            if (await keyItem.exists) {
                textArray.push(await keyItem.textContent);
            }
        }

        return textArray;
    }
}
