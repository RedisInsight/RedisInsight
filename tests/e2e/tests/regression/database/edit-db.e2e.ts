import { acceptLicenseTermsAndAddDatabaseApi, clickOnEditDatabaseByName, deleteDatabase } from '../../../helpers/database';
import { AddRedisDatabasePage, BrowserPage, CliPage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { Common } from '../../../helpers/common';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const common = new Common();
const myRedisDatabasePage = new MyRedisDatabasePage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const browserPage = new BrowserPage();
const cliPage = new CliPage();
const database = Object.assign({}, ossStandaloneConfig);

const previousDatabaseName = common.generateWord(20);
const newDatabaseName = common.generateWord(20);
database.databaseName = previousDatabaseName;
const keyName = common.generateWord(10);

fixture`List of Databases`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(database, database.databaseName);
    });
test
    .after(async() => {
        // Delete database
        await deleteDatabase(newDatabaseName);
    })('Verify that user can edit DB alias of Standalone DB', async t => {
        await t.click(myRedisDatabasePage.myRedisDBButton);
        // Edit alias of added database
        await clickOnEditDatabaseByName(database.databaseName);

        // Verify that timeout input is displayed for edit db window with default value when it wasn't specified
        await t.expect(addRedisDatabasePage.timeoutInput.value).eql('30', 'Timeout is not defaulted to 30');

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
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that context for previous database not saved after editing port/username/password/certificates/SSH', async t => {
        const command = 'HSET';

        // Create context modificaions and navigate to db list
        await browserPage.addStringKey(keyName);
        await browserPage.openKeyDetails(keyName);
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(myRedisDatabasePage.myRedisDBButton);
        // Edit port of added database
        await clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.typeText(addRedisDatabasePage.portInput, ossStandaloneBigConfig.port, { replace: true, paste: true });
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        // Verify that keys from the database with new port are displayed
        await t.expect(browserPage.keysSummary.find('b').withText('18 00').exists).ok('DB with new port not opened');
        // Verify that context not saved
        await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).notOk('The key details is still selected');
        await t.expect(cliPage.cliCommandExecuted.withExactText(command).exists).notOk(`Executed command '${command}' in CLI is still displayed`);
    });
