import { DatabaseHelper } from '../../../../helpers/database';
import { WorkbenchPage, MyRedisDatabasePage, BrowserPage } from '../../../../pageObjects';
import { KeysInteractionTabs, rte } from '../../../../helpers/constants';
import { commonUrl, ossStandaloneConfig, ossStandaloneRedisearch } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { SearchAndQueryPage } from '../../../../pageObjects/search-and-query-page';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const searchAndQueryPage = new SearchAndQueryPage();

const indexName = Common.generateWord(5);
const unicodeValue = '山女馬 / 马目 abc 123';

const databasesForAdding =
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testDB2' };

fixture `Search and Query Raw mode`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);

test
    .before(async t => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(
            databasesForAdding);
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch);
        // Go to Workbench page
        await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.Workbench);
    })
    .after(async t => {
        // Drop index, documents and database
        await t.switchToMainWindow();
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneRedisearch);

    })('Display Raw mode for plugins and save state', async t => {
        const commandsForSend = [
            `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`,
            `HMSET product:1 name "${unicodeValue}"`
        ];
        const commandSearch = `FT.SEARCH ${indexName} "${unicodeValue}"`;

        await workbenchPage.sendCommandsArrayInWorkbench(commandsForSend);
        await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
        // Send command in raw mode
        await t.click(searchAndQueryPage.rawModeBtn);
        await searchAndQueryPage.sendCommandInWorkbench(commandSearch);
        // Check the FT.SEARCH result
        await t.switchToIframe(workbenchPage.iframe);
        let name = workbenchPage.queryTableResult.withText(unicodeValue);
        await t.expect(name.exists).ok('The added key name field is not converted to Unicode');
        await t.switchToMainWindow();
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding.databaseName);
        await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.Workbench);

        await workbenchPage.sendCommandsArrayInWorkbench(commandsForSend);
        await browserPage.KeysInteractionPanel.setActiveTab(KeysInteractionTabs.SearchAndQuery);
        await searchAndQueryPage.sendCommandInWorkbench(commandSearch);
        // Check the FT.SEARCH result
        await t.switchToIframe(workbenchPage.iframe);
        name = workbenchPage.queryTableResult.withText(unicodeValue);
        await t.expect(name.exists).ok('The added key name field is not converted to Unicode');
    });
