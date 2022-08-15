import { t } from 'testcafe';
import { Chance } from 'chance';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, CliPage, MyRedisDatabasePage, DatabaseOverviewPage, BulkActionsPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneNoPermissionsConfig
} from '../../../helpers/conf';
import { addNewStandaloneDatabaseApi, deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const chance = new Chance();
const cliPage = new CliPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseOverviewPage = new DatabaseOverviewPage();
const bulkActionsPage = new BulkActionsPage();
const createUserCommand = 'acl setuser noperm nopass on +@all ~* -dbsize';
const keyName = chance.word({ length: 20 });
const createKeyCommand = `set ${keyName} ${chance.word({ length: 20 })}`;

fixture `Handle user permissions`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
        await cliPage.sendCommandInCli(createUserCommand);
        ossStandaloneNoPermissionsConfig.host = process.env.OSS_STANDALONE_BIG_HOST || 'oss-standalone-big';
        // await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
        await t.click(myRedisDatabasePage.myRedisDBButton);
        await addNewStandaloneDatabaseApi(ossStandaloneNoPermissionsConfig);
        await t.eval(() => location.reload());
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneNoPermissionsConfig);
        // Change config to initial
        ossStandaloneNoPermissionsConfig.host = process.env.OSS_STANDALONE_HOST || 'oss-standalone';
    });

test.only('Verify that user without dbsize permissions can connect to DB', async t => {
    // Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneNoPermissionsConfig.databaseName);
    // Check that user can see total number of key is overview
    await t.expect(databaseOverviewPage.overviewTotalKeys.find('div').withExactText('18 M').exists).ok('Total keys are displayed');
    // Check that user can see total number of keys in browser
    await t.expect(browserPage.keysSummary.find('b').withText('18 00').exists).ok('Total number is displayed');
    // Check that user can search per key
    await cliPage.sendCommandInCli(createKeyCommand);
    await browserPage.searchByKeyName(keyName);
    await t.expect(browserPage.keysNumberOfResults.textContent).eql('1', 'Found keys number');
    await t.expect(browserPage.keysNumberOfScanned.textContent).contains('18 000', 'Number of scanned');
    await t.expect(browserPage.keysTotalNumber.textContent).contains('18 000', 'Number of total keys');
    // Check bulk delete
    await cliPage.sendCommandInCli(createKeyCommand);
    await browserPage.searchByKeyName(keyName);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkStatusCompleted.visible).ok('Bulk deletion is not completed', { timeout: 60000 });
});
