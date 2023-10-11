import { Selector, t } from 'testcafe';

export class BaseRightSidePanel {

    // CONTAINERS
    sidePanel = Selector('[data-testid=insights-panel]');

    /**
     * Open/Close  Panel
     * @param state State of panel
     */
    async toggleInsightsPanel(state: boolean): Promise<void> {
        const isPanelExists = await this.sidePanel.exists;

        if (state !== isPanelExists) {
            await t.click(this.sidePanel);
        }
    }

}
