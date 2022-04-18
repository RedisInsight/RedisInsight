import { t, Selector } from 'testcafe';

export class AddingdMasterGroupsResultPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //COLUMNS
    addMasterGroupsResultColumn = Selector('[data-test-subj=tableHeaderCell_message_0]');
    viewDatabasesButton = Selector('span').withText('View Databases');

  async checkResultStatus(): Promise<void> {
      await t.click(this.viewDatabasesButton);
  }
}
