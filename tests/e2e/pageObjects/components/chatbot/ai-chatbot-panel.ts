import { Selector, t } from 'testcafe';
import { ChatBotTabs } from '../../../helpers/constants';
import { DatabaseChatBotTab } from './database-chatbot-tab';
import { GeneralChatBotTab } from './general-chatbot-tab';
import { RedisCloudSigninPanel } from '../redis-cloud-sign-in-panel';

export class AiChatBotPanel {
    RedisCloudSigninPanel = new RedisCloudSigninPanel();

    // CONTAINERS
    sidePanel = Selector('[data-testid=redis-copilot]');
    copilotButton = Selector('[data-testid=]');
    closeButton = Selector('[data-testid=]');
    activeTab = Selector('[class*=euiTab-isSelected]');

    generalTab = Selector('[data-testid=ai-general-chat_tab]');
    databaseTab = Selector('[data-testid=eai-database-chat_tab]');

    databasePopover = Selector('[data-testid=]');

    /**
     * Open/Close  Panel
     * @param state State of panel
     */
    async togglePanel(state: boolean): Promise<void> {
        const isPanelExists = await this.sidePanel.exists;

        if (state !== isPanelExists) {
            await t.click(this.copilotButton);
        }
    }

    /**
     * get active tab
     */
    async getActiveTabName(): Promise<string> {
        return this.activeTab.textContent;
    }
    /**
     * Click on Panel tab
     * @param type of the tab
     */
    async setActiveTab(type: ChatBotTabs.Database): Promise<DatabaseChatBotTab>
    async setActiveTab(type: ChatBotTabs.General): Promise<GeneralChatBotTab>
    async setActiveTab(type: ChatBotTabs): Promise<DatabaseChatBotTab | GeneralChatBotTab> {
        const activeTabName  = await this.getActiveTabName();
        if(type === ChatBotTabs.General) {
            if(type !== activeTabName) {
                await t.click(this.generalTab);
            }
            return new GeneralChatBotTab();
        }

        if(type !== activeTabName) {
            await t.click(this.databaseTab);
        }
        return new DatabaseChatBotTab();

    }
}
