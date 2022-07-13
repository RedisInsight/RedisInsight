import {t, Selector} from 'testcafe';

export class MyRedisDatabasePage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    settingsButton = Selector('[data-testid=settings-page-btn]');
    workbenchButton = Selector('[data-testid=workbench-page-btn]');
    helpCenterButton = Selector('[data-testid=help-menu-button]');
    githubButton = Selector('[data-testid=github-repo-icon]');
    browserButton = Selector('[data-testid=browser-page-btn]');
    myRedisDBButton = Selector('[data-test-subj=home-page-btn]');
    deleteDatabaseButton = Selector('[data-testid^=delete-instance-]');
    confirmDeleteButton = Selector('[data-testid^=delete-instance-]').withExactText('Remove');
    toastCloseButton = Selector('[data-test-subj=toastCloseButton]');
    deleteButtonInPopover = Selector('#deletePopover button');
    confirmDeleteAllDbButton = Selector('[data-testid=delete-selected-dbs]');
    editDatabaseButton = Selector('[data-testid^=edit-instance]');
    editAliasButton = Selector('[data-testid=edit-alias-btn]');
    applyButton = Selector('[data-testid=apply-btn]');
    submitChangesButton = Selector('[data-testid=btn-submit]');
    promoButton = Selector('[data-testid=promo-btn]');
    //CHECKBOXES
    selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
    //ICONS
    moduleColumn = Selector('[data-test-subj=tableHeaderCell_modules_3]');
    moduleSearchIcon = Selector('[data-testid^=RediSearch]');
    moduleGraphIcon = Selector('[data-testid^=RedisGraph]');
    moduleJSONIcon = Selector('[data-testid^=RedisJSON]');
    moduleTimeseriesIcon = Selector('[data-testid^=RedisTimeSeries]');
    moduleBloomIcon = Selector('[data-testid^=RedisBloom]');
    moduleAIIcon = Selector('[data-testid^=RedisAI]');
    moduleGearsIcon = Selector('[data-testid^=RedisGears]');
    redisStackIcon = Selector('[data-testid=redis-stack-icon]');
    tooltipRedisStackLogo = Selector('[data-testid=tooltip-redis-stack-icon]');
    //TEXT INPUTS (also referred to as 'Text fields')
    aliasInput = Selector('[data-testid=alias-input]');
    searchInput = Selector('[data-testid=search-database-list]');
    //TEXT ELEMENTS
    moduleTooltip = Selector('.euiToolTipPopover');
    moduleQuantifier = Selector('[data-testid=_module]');
    dbNameList = Selector('[data-testid^=instance-name]');
    tableRowContent = Selector('[data-test-subj=database-alias-column]');
    databaseInfoMessage = Selector('[data-test-subj=euiToastHeader]');
    hostPort = Selector('[data-testid=host-port]');
    noResultsFoundMessage = Selector('div').withExactText('No results found');
    noResultsFoundText = Selector('div').withExactText('No databases matched your search. Try reducing the criteria.');

    /**
     * Click on the database by name
     * @param dbName The name of the database to be opened
     */
    async clickOnDBByName(dbName: string): Promise<void> {
        if (await this.toastCloseButton.exists) {
            await t.click(this.toastCloseButton);
        }
        const db = this.dbNameList.withExactText(dbName.trim());
        await t.expect(db.exists).ok('The database exists', {timeout: 10000});
        await t.click(db);
    }

    //Delete all the databases from the list
    async deleteAllDatabases(): Promise<void> {
        await t.click(this.myRedisDBButton);
        const dbNames = this.tableRowContent;
        const count = await dbNames.count;
        if (count > 1) {
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

    /**
     * Delete DB by name
     * @param dbName The name of the database to be deleted
     */
    async deleteDatabaseByName(dbName: string): Promise<void> {
        const dbNames = this.tableRowContent;
        const count = await dbNames.count;

        for (let i = 0; i < count; i++) {
            if ((await dbNames.nth(i).innerText || '').includes(dbName)) {
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
    async clickOnEditDBByName(databaseName: string): Promise<void> {
        const dbNames = this.tableRowContent;
        const count = await dbNames.count;

        for (let i = 0; i < count; i++) {
            if ((await dbNames.nth(i).innerText || '').includes(databaseName)) {
                await t.click(this.editDatabaseButton.nth(i));
                break;
            }
        }
    }

    /**
     * Check module inside of tooltip
     * @param moduleNameList Array with modules list
     */
    async checkModulesInTooltip(moduleNameList: Array<string>): Promise<void> {
        for (const item of moduleNameList) {
            await t.expect(this.moduleTooltip.find('span').withText(`${item} v.`).exists).ok(item)
        }
    }

    /**
     * Check module icons on the page
     * @param moduleList Array with modules list
     */
    async checkModulesOnPage(moduleList: Array<Selector>): Promise<void> {
        for (const item of moduleList) {
            await t.expect(item.visible).ok(`${item} icon`)
        }
    }
}
