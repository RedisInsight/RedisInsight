import { t, Selector } from 'testcafe';
import { InsightsPanel } from '../insights-panel';

export class NavigationHeader {
    insightsTriggerButton = Selector('[data-testid=insights-trigger]');
    cloudSignInButton = Selector('[data-testid=cloud-sign-in-btn]');

    /**
     * Open/Close  Panel
     * @param state State of panel
     */
    async togglePanel(state: boolean): Promise<void> {
        const isPanelExists = await (new InsightsPanel()).sidePanel.exists;

        if (state !== isPanelExists) {
            await t.click(this.insightsTriggerButton);
        }
    }
}
