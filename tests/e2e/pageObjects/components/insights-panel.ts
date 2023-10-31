import { Selector, t } from 'testcafe';
import { ExploreTabs } from '../../helpers/constants';
import { RecommendationsTab } from './recommendations-tab';
import { ExploreTab } from './explore-tab';

export class InsightsPanel {
    // CONTAINERS
    sidePanel = Selector('[data-testid=insights-panel]');
    explorePanelButton = Selector('[data-testid=insights-trigger]');

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
    async setActiveTab(type: ExploreTabs.Explore): Promise<ExploreTab>
    async setActiveTab(type: ExploreTabs.Recommendations): Promise<RecommendationsTab>
    async setActiveTab(type: ExploreTabs): Promise<ExploreTab | RecommendationsTab> {
        const tabSelector = Selector('[class^=euiTab]').withExactText(type);
        const tabClass = await tabSelector.getAttribute('class');
        if(! tabClass?.includes('isSelected')){
            await t.click(tabSelector);
        }
        if(type === ExploreTabs.Explore){
            return new ExploreTab();
        }

        return new RecommendationsTab();
    }

    /**
     * Get Insights panel selector
     */
    getInsightsPanel(): Selector {
        return Selector('[class=euiButton__text]').withExactText(ExploreTabs.Recommendations);
    }

}
