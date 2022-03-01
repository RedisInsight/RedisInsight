import { t, Selector } from 'testcafe';

export class MyRedisDatabasePage {

    //------------------------------------------------------------------------------------------
    //DECLARATION OF TYPES: DOM ELEMENTS and UI COMPONENTS
    //*Assign the 'Selector' type to any element/component nested within the constructor.
    //------------------------------------------------------------------------------------------

  dbNameList: Selector
  settingsButton: Selector
  workbenchButton: Selector
  helpCenterButton: Selector
  myRedisDBButton: Selector
  toastCloseButton: Selector
  deleteDatabaseButton: Selector
  confirmDeleteButton: Selector
  tableRowContent: Selector
  hostPort: Selector
  selectAllCheckbox: Selector
  deleteButtonInPopover: Selector
  confirmDeleteAllDbButton: Selector
  browserButton: Selector
  editDatabaseButton: Selector
  editAliasButton: Selector
  aliasInput: Selector
  applyButton: Selector
  submitChangesButton: Selector
  databaseInfoMessage: Selector;

  constructor() {
      //-------------------------------------------------------------------------------------------
      //DECLARATION OF SELECTORS
      //*Declare all elements/components of the relevant page.
      //*Target any element/component via data-id, if possible!
      //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
      //-------------------------------------------------------------------------------------------
      //BUTTONS
      this.settingsButton = Selector('[data-testid=settings-page-btn]');
      this.workbenchButton = Selector('[data-testid=workbench-page-btn]');
      this.helpCenterButton = Selector('[data-testid=help-menu-button]');
      this.browserButton = Selector('[data-testid=browser-page-btn]');
      this.myRedisDBButton = Selector('[data-test-subj=home-page-btn]');
      this.deleteDatabaseButton = Selector('[data-testid^=delete-instance-]');
      this.confirmDeleteButton = Selector('[data-testid^=delete-instance-confirm]');
      this.toastCloseButton = Selector('[data-test-subj=toastCloseButton]');
      this.selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
      this.deleteButtonInPopover = Selector('#deletePopover button');
      this.confirmDeleteAllDbButton = Selector('[data-testid=delete-selected-dbs]');
      this.editDatabaseButton = Selector('[data-testid^=edit-instance]');
      this.editAliasButton = Selector('[data-testid=edit-alias-btn]');
      this.applyButton = Selector('[data-testid=apply-btn]');
      this.submitChangesButton = Selector('[data-testid=btn-submit]');
      // TEXT INPUTS (also referred to as 'Text fields')
      this.dbNameList = Selector('[data-testid^=instance-name]');
      this.tableRowContent = Selector('[data-test-subj=database-alias-column]');
      this.databaseInfoMessage = Selector('[data-test-subj=euiToastHeader]');
      this.hostPort = Selector('[data-testid=host-port]');
      this.aliasInput = Selector('[data-testid=alias-input]');
  }

  /**
   * Click on the database by name
   * @param dbName The name of the database to be opened
   */
  async clickOnDBByName(dbName: string): Promise<void>{
      if (await this.toastCloseButton.exists) {
          await t.click(this.toastCloseButton);
      }
      const db = this.dbNameList.withExactText(dbName.trim());
      await t.expect(db.exists).ok('The database exists', {timeout: 60000});
      await t.click(db);
  }

  //Delete all the databases from the list
  async deleteAllDatabases(): Promise<void> {
      await t.click(this.myRedisDBButton);
      const dbNames = this.tableRowContent;
      const count = await dbNames.count;
      if(count > 1) {
          await t.click(this.selectAllCheckbox);
          await t.click(this.deleteButtonInPopover);
          await t.click(this.confirmDeleteAllDbButton);
      }
      else if (count === 1) {
          await t.click(this.deleteDatabaseButton);
          await t.click(this.confirmDeleteButton);
      }
      if (await this.toastCloseButton.exists) {
          await t.click(this.toastCloseButton);
      }
  }

  //Delete database by Name
  async deleteDatabaseByName(dbName: string): Promise<void> {
      const dbNames = this.tableRowContent;
      const count = await dbNames.count;

      for(let i = 0; i < count; i++) {
          if((await dbNames.nth(i).innerText || '').includes(dbName)) {
              await t.click(this.deleteDatabaseButton.nth(i));
              await t.click(this.confirmDeleteButton);
              break;
          }
      }
  }

  /**
   * Click on the edit database button by name
   * @param databaseName The name of the database to be edited
   */
  async clickOnEditDBByName(databaseName: string): Promise<void>{
      const dbNames = this.tableRowContent;
      const count = await dbNames.count;

      for(let i = 0; i < count; i++) {
          if((await dbNames.nth(i).innerText || '').includes(databaseName)) {
              await t.click(this.editDatabaseButton.nth(i));
              break;
          }
      }
    }
}
