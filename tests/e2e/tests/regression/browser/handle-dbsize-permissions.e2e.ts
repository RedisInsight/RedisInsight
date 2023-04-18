import { t } from 'testcafe';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, BulkActionsPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneNoPermissionsConfig
} from '../../../helpers/conf';
import { addNewStandaloneDatabaseApi, deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const bulkActionsPage = new BulkActionsPage();
const common = new Common();
const createUserCommand = 'acl setuser noperm nopass on +@all ~* -dbsize';
const keyName = common.generateWord(20);
const createKeyCommand = `set ${keyName} ${common.generateWord(20)}`;

fixture `Handle user permissions`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
        await browserPage.Cli.sendCommandInCli(createUserCommand);
        ossStandaloneNoPermissionsConfig.host = process.env.OSS_STANDALONE_BIG_HOST || 'oss-standalone-big';
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await addNewStandaloneDatabaseApi(ossStandaloneNoPermissionsConfig);
        await common.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
        await deleteStandaloneDatabaseApi(ossStandaloneNoPermissionsConfig);
        // Change config to initial
        ossStandaloneNoPermissionsConfig.host = process.env.OSS_STANDALONE_HOST || 'oss-standalone';
    });

test('Verify that user without dbsize permissions can connect to DB', async t => {
    // Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneNoPermissionsConfig.databaseName);
    // Check that user can see total number of key is overview
    await t.expect(browserPage.OverviewPanel.overviewTotalKeys.find('div').withExactText('18 M').exists).ok('Total keys are not displayed');
    // Check that user can see total number of keys in browser
    await t.expect(browserPage.keysSummary.find('b').withText('18 00').exists).ok('Total number is not displayed');
    // Check that user can search per key
    await browserPage.Cli.sendCommandInCli(createKeyCommand);
    await browserPage.searchByKeyName(keyName);
    await t.expect(browserPage.keysNumberOfResults.textContent).eql('1', 'Found keys number not correct');
    await t.expect(browserPage.scannedValue.textContent).contains('18 000', 'Number of scanned not correct');
    await t.expect(browserPage.keysTotalNumber.textContent).contains('18 000', 'Number of total keys not correct');
    // Check bulk delete
    await browserPage.Cli.sendCommandInCli(createKeyCommand);
    await browserPage.searchByKeyName(keyName);
    await bulkActionsPage.startBulkDelete();
    await t.expect(bulkActionsPage.bulkStatusCompleted.visible).ok('Bulk deletion is not completed', { timeout: 60000 });
});
