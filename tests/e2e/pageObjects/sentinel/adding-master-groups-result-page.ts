import { t, Selector } from 'testcafe';

export class AddingdMasterGroupsResultPage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

  addMasterGroupsResultColumn: Selector
  viewDatabasesButton: Selector

  constructor() {
      //-------------------------------------------------------------------------------------------
      //DECLARATION OF SELECTORS
      //*Declare all elements/components of the relevant page.
      //*Target any element/component via data-id, if possible!
      //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
      //-------------------------------------------------------------------------------------------
      //Columns
      this.addMasterGroupsResultColumn = Selector('[data-test-subj=tableHeaderCell_message_0]');
      this.viewDatabasesButton = Selector('span').withText('View Databases');
  }

  async checkResultStatus(): Promise<void> {
      await t.click(this.viewDatabasesButton);
  }
}
