import { Selector, t } from 'testcafe';
import { BrowserPage } from '../pageObjects';

const browserPage = new BrowserPage();

export class BrowserActions {
    /**
     * Check that all rendered keys on page has info displayed
     */
    async verifyAllRenderedKeysHasText(): Promise<void> {
        const keyListItems = browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow);
        // Take 1st, middle and last one rendered items for test
        const keysForTest = [keyListItems.nth(0), keyListItems.nth(Math.round(await keyListItems.count / 2)), keyListItems.nth(await keyListItems.count - 2)];

        // Verify that keys info in all columns is not empty
        for (const key of keysForTest) {
            const keyColumnsSelectors = [
                browserPage.cssSelectorKey,
                browserPage.cssKeyBadge,
                browserPage.cssKeyTtl,
                browserPage.cssKeySize
            ];

            for (const columnSelector of keyColumnsSelectors) {
                const keyRenderedName = await key.find(keyColumnsSelectors[0]).innerText;
                const listRenderedKeyInfo = await key.find(columnSelector).innerText;

                await t.expect(listRenderedKeyInfo).notEql('', `"${keyRenderedName}" Key has empty data`);
            }
        }
    }

    /**
     * Verify tooltip contains text
     * @param expectedText Expected link that is compared with actual
     * @param contains Should this tooltip contains or not contains text
     */
    async verifyTooltipContainsText(expectedText: string, contains: boolean): Promise<void> {
        contains
            ? await t.expect(browserPage.tooltip.textContent).contains(expectedText, `"${expectedText}" Text is incorrect in tooltip`)
            : await t.expect(browserPage.tooltip.textContent).notContains(expectedText, `Tooltip still contains text "${expectedText}"`);
    }

    /**
     * Verify dialog contains text
     * @param expectedText Expected link that is compared with actual
     * @param contains Should this tooltip contains or not contains text
     */
    async verifyDialogContainsText(expectedText: string, contains: boolean): Promise<void> {
        contains
            ? await t.expect(browserPage.dialog.textContent).contains(expectedText, `"${expectedText}" Text is incorrect in tooltip`)
            : await t.expect(browserPage.dialog.textContent).notContains(expectedText, `Dialog still contains text "${expectedText}"`);
    }

    /**
     * Verify that the new key is displayed at the top of the list of keys and opened and pre-selected in List view
     * @param keyName Key name
     */
    async verifyKeyDisplayedTopAndOpened(keyName: string): Promise<void> {
        await t.expect(Selector('[aria-rowindex="1"]').withText(keyName).visible).ok(`element with ${keyName} is not visible in the top of list`);
        await t.expect(browserPage.keyNameFormDetails.withText(keyName).visible).ok(`element with ${keyName} is not opened`);
    }

    /**
     * Verify that the new key is not displayed at the top of the list of keys and opened and pre-selected in List view
     * @param keyName Key name
     */
    async verifyKeyIsNotDisplayedTop(keyName: string): Promise<void> {
        await t.expect(Selector('[aria-rowindex="1"]').withText(keyName).exists).notOk(`element with ${keyName} is not visible in the top of list`);
    }

    /**
     * Verify that not patterned keys not visible with delimiter
     * @param delimiter string with delimiter value
     */
    async verifyNotPatternedKeys(delimiter: string): Promise<void> {
        const notPatternedKeys = Selector('[data-testid^="badge"]').parent('[data-testid^="node-item_"]');
        const notPatternedKeysNumber = await notPatternedKeys.count;

        for (let i = 0; i < notPatternedKeysNumber; i++) {
            await t.expect(notPatternedKeys.nth(i).withText(delimiter).exists).notOk('Not contained delimiter keys');
        }
    }

    /**
     * Get node name by folders
     * @param startFolder start folder
     * @param folderName name of folder
     * @param delimiter string with delimiter value
     */
    getNodeName(startFolder: string, folderName: string, delimiter: string): string {
        return startFolder + folderName + delimiter;

    }

    /**
     * Get node selector by name
     * @param name node name
     */
    getNodeSelector(name: string): Selector {
        return Selector(`[data-testid^="node-item_${name}"]`);
    }

    /**
     * Check tree view structure
     * @param folders name of folders for tree view build
     * @param delimiter string with delimiter value
     */
    async checkTreeViewFoldersStructure(folders: string[][], delimiter: string): Promise<void> {
        // Verify not patterned keys
        await this.verifyNotPatternedKeys(delimiter);

        const foldersNumber = folders.length;

        for (let i = 0; i < foldersNumber; i++) {
            const innerFoldersNumber = folders[i].length;
            let prevNodeSelector = '';

            for (let j = 0; j < innerFoldersNumber; j++) {
                const nodeName = this.getNodeName(prevNodeSelector, folders[i][j], delimiter);
                const node = this.getNodeSelector(nodeName);
                const fullTestIdSelector = await node.getAttribute('data-testid');
                if (!fullTestIdSelector?.includes('expanded')) {
                    await t.click(node);
                }
                prevNodeSelector = nodeName;
            }

            // Verify that the last folder level contains required keys
            const foundKeyName = `${folders[i].join(delimiter)}`;
            const firstFolderName = this.getNodeName('', folders[i][0], delimiter);
            const firstFolder = this.getNodeSelector(firstFolderName);
            await t
                .expect(Selector(`[data-testid*="node-item_${foundKeyName}"]`).find('[data-testid^="key-"]').exists).ok('Specific key not found')
                .click(firstFolder);
        }
    }
}
