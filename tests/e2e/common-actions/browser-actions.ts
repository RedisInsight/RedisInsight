import { t } from 'testcafe';
import { BrowserPage } from '../pageObjects';

const browserPage = new BrowserPage();

export class BrowserActions {
    /**
     * Check that all rendered keys on page has info displayed
     */
    async verifyAllRenderedKeysHasText(): Promise<void> {
        const keyListItems = browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow);
        // Take 1st, middle and last one rendered items for test
        const keysForTest = [keyListItems.nth(0), keyListItems.nth(await keyListItems.count / 2), keyListItems.nth(await keyListItems.count - 2)];

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
}
