import { t } from 'testcafe';
import { PubSubPage } from '../pageObjects';

const pubSubPage = new PubSubPage();

/**
 * Verify message is/not displayed in pubsub
 * @param message The message text
 * @param displayed Boolean - displayed or not
 */
export async function verifyMessageDisplayingInPubSub(message: string, displayed: boolean): Promise<void> {
    const messageByText = pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText(message);
    displayed
        ? await t.expect(messageByText.exists).ok(`"${message}" Message is not displayed`, { timeout: 5000 })
        : await t.expect(messageByText.exists).notOk(`"${message}" Message is still displayed`);
}
