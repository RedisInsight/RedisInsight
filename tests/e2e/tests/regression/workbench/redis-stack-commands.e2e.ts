import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { WorkbenchPage } from '../../../pageObjects/workbench-page';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { t } from 'testcafe';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const keyNameGraph = 'bikes_graph';

fixture `Redis Stack command in Workbench`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        //Drop key and database
        await t.switchToMainWindow();
        await workbenchPage.sendCommandInWorkbench(`GRAPH.DELETE ${keyNameGraph}`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
//skipped due the inaccessibility of the iframe
test.skip
    .meta({ rte: rte.standalone })
    ('Verify that user can switches between Graph and Text for GRAPH command and see results corresponding to their views', async t => {
        //Send Graph command
        await t.click(workbenchPage.redisStackTutorialsButton);
        await t.click(workbenchPage.workingWithGraphLink);
        await t.click(workbenchPage.createGraphBikeButton);
        await t.click(workbenchPage.submitCommandButton);
        //Switch to Text view and check result
        await workbenchPage.selectViewTypeText();
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).exists).ok('The text view is switched for GRAPH command');
        //Switch to Graph view and check result
        await workbenchPage.selectViewTypeGraph();
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.queryGraphContainer).exists).ok('The Graph view is switched for GRAPH command');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see "No data to visualize" message for Graph command', async t => {
        //Send Graph command
        await t.click(workbenchPage.redisStackTutorialsButton);
        await t.click(workbenchPage.workingWithGraphLink);
        await t.click(workbenchPage.preselectModelBikeSalesButton);
        await t.click(workbenchPage.submitCommandButton);
        //Check result
        await t.switchToIframe(workbenchPage.iframe)
        await t.expect(workbenchPage.resposeInfo.textContent).eql('No data to visualize. Switch to Text view to see raw information.', 'The info message is displayed for Graph');
        //Switch to Text view and check result
        await t.switchToMainWindow();
        await workbenchPage.selectViewTypeText();
        await t.expect(workbenchPage.queryTextResult.exists).ok('The result in text view is displayed');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can switches between Chart and Text for TimeSeries command and see results corresponding to their views', async t => {
        //Send TimeSeries command
        await t.click(workbenchPage.redisStackTutorialsButton);
        await t.click(workbenchPage.timeSeriesLink);
        await t.click(workbenchPage.showSalesPerRegiomButton);
        await t.click(workbenchPage.submitCommandButton);
        //Check result is in chart view
        await t.expect(workbenchPage.chartViewTypeOptionSelected.visible).ok('The chart view option is selected by default');
        //Switch to Text view and check result
        await workbenchPage.selectViewTypeText();
        await t.expect(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).exists).ok('The result in text view is displayed');
    });
    