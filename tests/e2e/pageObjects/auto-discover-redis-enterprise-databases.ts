import { Selector } from 'testcafe';
import { BasePage } from './base-page';

export class AutoDiscoverREDatabases extends BasePage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    addSelectedDatabases = Selector('[data-testid=btn-add-databases]');
    databaseCheckbox = Selector('[data-test-subj^=checkboxSelectRow]');
    search = Selector('[data-testid=search]');
    viewDatabasesButton = Selector('[data-testid=btn-view-databases]');
    //TEXT INPUTS (also referred to as 'Text fields')
    title = Selector('[data-testid=title]');
    databaseName = Selector('[data-testid^=db_name_]');

    // Get databases name
    async getDatabaseName(): Promise<string> {
        return this.databaseName.textContent;
    }
}
