import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { Common } from '../../../helpers/common';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../helpers/api/api-keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const database = Object.assign({}, ossStandaloneConfig);
const previousDatabaseName = Common.generateWord(20);
const newDatabaseName = Common.generateWord(20);
database.databaseName = previousDatabaseName;
const keyName = Common.generateWord(10);

fixture `List of Databases`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(database);
    });
test
    .after(async() => {
        // Delete database
        await databaseHelper.deleteDatabase(newDatabaseName);
    })('Verify that user can edit DB alias of Standalone DB', async t => {
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        // Edit alias of added database
        await databaseHelper.clickOnEditDatabaseByName(database.databaseName);

        // Verify that timeout input is displayed for edit db window with default value when it wasn't specified
        await t.expect(myRedisDatabasePage.AddRedisDatabase.timeoutInput.value).eql('30', 'Timeout is not defaulted to 30');

        await t.click(myRedisDatabasePage.editAliasButton);
        await t.typeText(myRedisDatabasePage.aliasInput, newDatabaseName, { replace: true });
        await t.click(myRedisDatabasePage.applyButton);
        await t.click(myRedisDatabasePage.submitChangesButton);
        // Verify that database has new alias
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newDatabaseName).exists).ok('The database with new alias is in not the list', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(previousDatabaseName).exists).notOk('The database with previous alias is still in the list', { timeout: 10000 });
    });
test
    .meta({ env: env.desktop })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .after(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.typeText(myRedisDatabasePage.AddRedisDatabase.portInput, ossStandaloneConfig.port, { replace: true, paste: true });
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneBigConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that context for previous database not saved after editing port/username/password/certificates/SSH', async t => {
        const command = 'HSET';

        // Create context modificaions and navigate to db list
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        await t.click(browserPage.Cli.cliExpandButton);
        await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        // Edit port of added database
        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.typeText(myRedisDatabasePage.AddRedisDatabase.portInput, ossStandaloneBigConfig.port, { replace: true, paste: true });
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        // Verify that keys from the database with new port are displayed
        await t.expect(browserPage.keysSummary.find('b').withText('18 00').exists).ok('DB with new port not opened');
        // Verify that context not saved
        await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).notOk('The key details is still selected');
        await t.expect(browserPage.Cli.cliCommandExecuted.withExactText(command).exists).notOk(`Executed command '${command}' in CLI is still displayed`);
    });
