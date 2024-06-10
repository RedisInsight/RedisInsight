import { Selector, t } from 'testcafe';
import { ChatBotBaseTab } from './chatbot-base-tab';

export class DatabaseChatBotTab extends ChatBotBaseTab{
    clearSessionButton = Selector('[data-testid=]');
    databaseName = Selector('[data-testid=]');
}
