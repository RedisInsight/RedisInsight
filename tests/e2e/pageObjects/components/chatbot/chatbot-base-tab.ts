import { Selector, t } from 'testcafe';

export class ChatBotBaseTab {
    searchField = Selector('[data-testid=ai-message-textarea]');
    submitButton = Selector('[data-testid=ai-submit-message-btn]');
    answer = Selector('[data-testid^=ai-message-AIMessage_]');
    question = Selector('[data-testid^=ai-message-HumanMessage_]');
    runAnswerButton =  Selector('[data-testid=run-btn-]');
    copyAnswerButton =  Selector('[data-testid=copy-btn-]');

    /**
     * Run question
     * @param query query to run
     */
    async runQuery(query: string): Promise<void> {
        await t.typeText(this.searchField, query);
        await t.click(this.submitButton);
    }
}
