import { Selector } from 'testcafe';
import { MyRedisDatabasePage, MemoryEfficiencyPage, BrowserPage, CliPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const cliPage = new CliPage();

let hashKeyName = 'test:Hash1';
let streamKeyName = 'test:Stream1';
const keyTTL = '2147476121';
// const keyFieldValue = 'hashField11111';
const keyValue = 'hashValue11111!';

fixture `Memory Efficiency`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
    })
    .afterEach(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('No reports/keys message and report tooltip', async t => {
    const noReportsMessage = 'No Reports foundRun "New Analysis" to generate first report';
    const noKeysMessage = 'No keys to displayUse Workbench Guides and Tutorials to quickly load data';
    const tooltipText = 'Memory EfficiencyAnalyze up to 10K keys in your Redis database to get an overview of your data and memory efficiency recommendations.';
    
    // Verify that user can see the “No reports found” message when report wasn't generated
    await t.expect(memoryEfficiencyPage.noReportsText.textContent).eql(noReportsMessage, 'No reports message not displayed or text is invalid');
    // Verify that user can see the “No keys to display” message when there are no keys in database
    await t.click(memoryEfficiencyPage.newReportBtn);
    await t.expect(memoryEfficiencyPage.noKeysText.textContent).eql(noKeysMessage, 'No keys message not displayed or text is invalid');
    // Verify that user can open workbench page from No keys to display message
    

    // Verify that user can see a tooltip when hovering over the icon on the right of the “New analysis” button
    await t.hover(memoryEfficiencyPage.reportTooltipIcon);
    await t.expect(browserPage.tooltip.textContent).eql(tooltipText, 'Report tooltip is not displayed or text is invalid');
});
test
.before(async t => {
    await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    await browserPage.addHashKey(hashKeyName, keyTTL, keyValue);
    await browserPage.addStreamKey(streamKeyName, 'field', 'value', keyTTL);
    await cliPage.addKeysFromCliWithDelimiter('MSET', 15);
    await t.click(browserPage.treeViewButton);
    await browserPage.searchByKeyName('');
    // // Go to Analysis Tools page
    // await t.click(myRedisDatabasePage.analysisPageButton);
})
.after(async t => {
    await cliPage.deleteKeysFromCliWithDelimiter(15);
    // await t.click(myRedisDatabasePage.browserButton);
    await browserPage.deleteKeyByName(hashKeyName);
    await browserPage.deleteKeyByName(streamKeyName);
    await deleteStandaloneDatabaseApi(ossStandaloneConfig);
})('Keyspaces displaying in Summary per keyspaces table', async t => {

});