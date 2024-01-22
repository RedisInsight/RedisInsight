import { Selector, t } from 'testcafe';

export class CompatibilityPromotion {
    compatibilityLinks = Selector('[data-testid*=capability-promotion-]').find('div');

    /**
     * Click on link
     * @param name Name of the compatibility
     */
    async clickOnLinkByName(name: string): Promise<void> {
        const link = this.compatibilityLinks.withText(name);
        await t.click(link);
    }
}
