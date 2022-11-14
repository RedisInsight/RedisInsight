import { MyRedisDatabasePage, MemoryEfficiencyPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { commonUrl, ossStandaloneBigConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { CliActions } from '../../../common-actions/cli-actions';
import { Common } from '../../../helpers/common';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const cliActions = new CliActions();
const common = new Common();

fixture `Memory Efficiency Recommendations`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
        // Go to Analysis Tools page
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Avoid dynamic Lua script recommendation', async t => {
        const noRecommendationsMessage = 'No Recommendations at the moment.';
        const externalPageLink = 'https://docs.redis.com/latest/ri/memory-optimizations/';

        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
        // No recommendations message
        await t.expect(memoryEfficiencyPage.noRecommendationsMessage.textContent).eql(noRecommendationsMessage, 'No recommendations message not displayed');
        // Add cached scripts and generate new report
        await cliActions.addCachedScripts(10);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // No recommendations message with 10 cached scripts
        await t.expect(memoryEfficiencyPage.noRecommendationsMessage.textContent).eql(noRecommendationsMessage, 'No recommendations message not displayed');
        // Add the last cached script to see the recommendation
        await cliActions.addCachedScripts(1);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Verify that user can see Avoid dynamic Lua script recommendation when number_of_cached_scripts> 10
        await t.expect(memoryEfficiencyPage.luaScriptAccordion.exists).ok('Avoid dynamic lua script recommendation not displayed');

        // Verify that user can expand/collapse recommendation
        const expandedTextConaiterSize = await memoryEfficiencyPage.luaScriptTextContainer.offsetHeight;
        await t.click(memoryEfficiencyPage.luaScriptButton);
        await t.expect(await memoryEfficiencyPage.luaScriptTextContainer.offsetHeight).lt(expandedTextConaiterSize, 'Recommendation not collapsed');
        await t.click(memoryEfficiencyPage.luaScriptButton);
        await t.expect(await memoryEfficiencyPage.luaScriptTextContainer.offsetHeight).eql(expandedTextConaiterSize, 'Recommendation not expanded');

        // Verify that user can navigate by link to see the recommendation
        await t.click(memoryEfficiencyPage.readMoreLink);
        await common.checkURL(externalPageLink);
        // Close the window with external link to switch to the application window
        await t.closeWindow();
    });
