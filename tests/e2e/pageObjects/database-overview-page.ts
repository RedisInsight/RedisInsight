import { Selector, t } from 'testcafe';
import { BrowserPage } from '../pageObjects';

const browserPage = new BrowserPage();

export class DatabaseOverviewPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //TEXT ELEMENTS
    overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
    overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
    databaseModules = Selector('[data-testid$=module]');
    overviewTooltipStatTitle = Selector('[data-testid=overview-db-stat-title]');
    //BUTTONS
    overviewRedisStackLogo = Selector('[data-testid=redis-stack-logo]');
    overviewMoreInfo = Selector('[data-testid=overview-more-info-button]');
    //Panel
    overviewTooltip = Selector('[data-testid=overview-more-info-tooltip]');

    /**
    * Verify that tooltip contains/not the text
    * @param text The text in tooltip
    * @param contains Boolean contains or not
    */
    async verifyTooltipContainsText(text: string, contains: boolean): Promise<void> {
        contains
            ? await t.expect(browserPage.tooltip.textContent).contains(text, `"${text}" Text is incorrect in tooltip`)
            : await t.expect(browserPage.tooltip.textContent).notContains(text, `Tooltip still contains text "${text}"`);
    }
}
