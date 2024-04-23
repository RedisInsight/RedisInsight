import { Selector, t } from 'testcafe';
import { ChatBotBaseTab } from './chatbot-base-tab';

export class GeneralChatBotTab extends ChatBotBaseTab {
    suggestion = Selector('[data-testid*=ai-chat-suggestion_]');
    restartSessionButton = Selector('[data-testid=ai-general-restart-session-btn]');

    /**
     * Select question suggestion
     * @param index of suggestion
     */
    async runSuggestion(index: number): Promise<void> {
        await t.click(this.suggestion.nth(index));
    }
}
