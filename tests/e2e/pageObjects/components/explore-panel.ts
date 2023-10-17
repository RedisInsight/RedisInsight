import { Selector, t } from 'testcafe';
import { ExploreTabs } from '../../helpers/constants';
import { InsightTab } from './insight-tab';
import { TutorialsTab } from './tutorials-tab';

export class ExplorePanel {
    // CONTAINERS
    sidePanel = Selector('[data-testid=insights-panel]');
    explorePanelButton = Selector('[data-testid=explore-trigger]');

    /**
     * Open/Close  Panel
     * @param state State of panel
     */
    async togglePanel(state: boolean): Promise<void> {
        const isPanelExists = await this.sidePanel.exists;

        if (state !== isPanelExists) {
            await t.click(this.explorePanelButton);
        }
    }

    /**
     * Click on Panel tab
     * @param type of the tab
     */
    async setActiveTab(type: ExploreTabs.Explore): Promise<TutorialsTab>
    async setActiveTab(type: ExploreTabs.Insights): Promise<InsightTab>
    async setActiveTab(type: ExploreTabs): Promise<TutorialsTab | InsightTab> {
        // TODO check active tab
        const tabSelector = Selector('[class=euiButton__text]').withExactText(type);
        await t.click(tabSelector);
        if(type === ExploreTabs.Explore){
            return new TutorialsTab();
        }

        return new InsightTab();
    }

    /**
     * Get Insights panel selector
     */
    getInsightsPanel(): Selector {
        return Selector('[class=euiButton__text]').withExactText(ExploreTabs.Insights);
    }

}
