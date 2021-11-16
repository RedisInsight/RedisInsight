import { t, Selector } from 'testcafe';

export class DiscoverMasterGroupsPage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

  selectAllCheckbox: Selector
  addPrimaryGroupButton: Selector
  masterGroupsTitle: Selector

  constructor() {
      //-------------------------------------------------------------------------------------------
      //DECLARATION OF SELECTORS
      //*Declare all elements/components of the relevant page.
      //*Target any element/component via data-id, if possible!
      //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
      //-------------------------------------------------------------------------------------------
      //BUTTONS
      this.selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
      this.addPrimaryGroupButton = Selector('[data-testid=btn-add-primary-group]');
      this.masterGroupsTitle = Selector('//h1[text()="Auto-Discover Redis Sentinel Primary Groups"]');
  }

  /**
 * Add all Master Groups from Sentinel
 */
  async addMasterGroups(): Promise<void> {
      await t
          .click(this.selectAllCheckbox)
          .expect(this.selectAllCheckbox.checked).ok();
      await t
          .click(this.addPrimaryGroupButton);
  }
}
