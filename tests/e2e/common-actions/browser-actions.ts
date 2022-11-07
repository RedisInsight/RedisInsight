import { t } from 'testcafe';
import { BrowserPage } from '../pageObjects';

const browserPage = new BrowserPage();

export class BrowserActions {

    /**
     * Check that all rendered keys on page has info displayed
     */
    async verifyAllRenderedKeysHasText(): Promise<void> {
        const keyListItems = browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow);

        // Verify that keys info in all columns is not empty
        for (let i = 0; i < await keyListItems.count - 2; i++) {
            const keyColumnsSelectors = [
                browserPage.cssSelectorKey,
                browserPage.cssKeyBadge,
                browserPage.cssKeyTtl,
                browserPage.cssKeySize
            ];

            for (const columnSelector of keyColumnsSelectors) {
                const keyRenderedName = await keyListItems.nth(i).find(keyColumnsSelectors[0]).innerText;
                const listRenderedKeyInfo = await keyListItems.nth(i).find(columnSelector).innerText;

                await t.expect(listRenderedKeyInfo).notEql('', `"${keyRenderedName}" Key has empty data`);
            }
        }
    }
}
