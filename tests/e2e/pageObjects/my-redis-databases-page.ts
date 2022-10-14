import { t, Selector } from 'testcafe';

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
    analysisPageButton = Selector('[data-testid=analytics-page-btn]');
    helpCenterButton = Selector('[data-testid=help-menu-button]');
    githubButton = Selector('[data-testid=github-repo-icon]');
    browserButton = Selector('[data-testid=browser-page-btn]');
    pubSubButton = Selector('[data-testid=pub-sub-page-btn]');
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
    sortByDatabaseAlias = Selector('span').withAttribute('title', 'Database Alias');
    sortByHostAndPort = Selector('span').withAttribute('title', 'Host:Port');
    sortByConnectionType = Selector('span').withAttribute('title', 'Connection Type');
    sortByLastConnection = Selector('span').withAttribute('title', 'Last connection');
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
    dbNameList = Selector('[data-testid^=instance-name]', { timeout: 3000 });
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
        await t.expect(db.exists).ok(`"${dbName}" database doesn't exist`, {timeout: 10000});
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
        const dbNames = this.dbNameList;
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
    async checkModulesInTooltip(moduleNameList: string[]): Promise<void> {
        for (const item of moduleNameList) {
            await t.expect(this.moduleTooltip.find('span').withText(`${item} v.`).exists).ok(item);
        }
    }

    /**
     * Check module icons on the page
     * @param moduleList Array with modules list
     */
    async checkModulesOnPage(moduleList: Selector[]): Promise<void> {
        for (const item of moduleList) {
            await t.expect(item.exists).ok(`${item} icon`);
        }
    }

    /**
     * Get all databases from List of DBs page
     */
    async getAllDatabases(): Promise<string[]> {
        const databases: string[] = [];
        const n = await this.dbNameList.count;
        for(let k = 0; k < n; k++) {
            const name = await this.dbNameList.nth(k).textContent;
            databases.push(name);
        }
        return databases;
    }

    /**
     * Get all databases from List of DBs page
     * @param actualList Actual databases list
     * @param sortedList Expected list
     */
    async compareDatabases(actualList: string[], sortedList: string[]): Promise<void> {
        for (let k = 0; k < actualList.length; k++) {
            await t.expect(actualList[k].trim()).eql(sortedList[k].trim());
        }
    }
}
