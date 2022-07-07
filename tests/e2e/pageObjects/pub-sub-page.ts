import { t, Selector } from 'testcafe';

export class PubSubPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //COMPONENTS
    subscribeStatus = Selector('[data-testid=subscribe-status-text]');
    //BUTTONS
    subscribeButton = Selector('[data-testid=btn-submit]');
    publishButton = Selector('[data-testid=publish-message-submit]');
    //INPUTS
    chanelNameInput = Selector('[data-testid=field-channel-name]');
    messageInput = Selector('[data-testid=field-message]');

  //Accept RedisInsight License Terms
  async publishMessage(chanel: string, message: string):Promise<void> {
    await t.click(this.chanelNameInput);
    await t.typeText(this.chanelNameInput, chanel, { replace: true });
    await t.click(this.messageInput);
    await t.typeText(this.messageInput, message, { replace: true });
    await t.click(this.publishButton);
  }
}
