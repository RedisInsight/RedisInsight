import { Selector, t } from 'testcafe';
import { Compatibility } from '../../helpers/constants';

export class CompatibilityPromotion {
    linkMask = '[data-testid="guide-icon-$name"]';
    /**
     * Click on link
     * @param name Name of the compatibility
     */
    async clickOnLinkByName(name: Compatibility): Promise<void> {
        const link = Selector(this.linkMask.replace(/\$name/g, name));
        await t.click(link);
    }
}
