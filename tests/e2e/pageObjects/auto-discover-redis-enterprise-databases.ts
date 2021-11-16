import { Selector } from 'testcafe';

export class AutoDiscoverREDatabases {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

  title: Selector
  addSelectedDatabases: Selector
  databaseNames: Selector
  databaseCheckbox: Selector
  search: Selector
  viewDatabasesButton: Selector;

  constructor() {
      //-------------------------------------------------------------------------------------------
      //DECLARATION OF SELECTORS
      //*Declare all elements/components of the relevant page.
      //*Target any element/component via data-id, if possible!
      //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
      //-------------------------------------------------------------------------------------------
      //BUTTONS
      this.addSelectedDatabases = Selector('[data-testid=btn-add-databases]');
      this.databaseCheckbox = Selector('[data-test-subj^=checkboxSelectRow]');
      this.search = Selector('[data-testid=search]');
      this.viewDatabasesButton = Selector('[data-testid=btn-view-databases]');
      // TEXT INPUTS (also referred to as 'Text fields')
      this.title = Selector('[data-testid=title]');
      this.databaseNames = Selector('[data-testid^=db_name_]')
  }
}
