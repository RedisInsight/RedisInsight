import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { rte } from '../../../helpers/constants';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import {MemoryEfficiencyPage, MyRedisDatabasePage} from '../../../pageObjects';
import {RecommendationsPage} from '../../../pageObjects/recommendations-page';
import {Common} from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const memoryEfficiencyPage = new MemoryEfficiencyPage();
const recommendationPage = new RecommendationsPage();
const common = new Common();

fixture `Upvote recommendations`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Analysis Tools page and create new report and open recommendations
        await t.click(myRedisDatabasePage.analysisPageButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await t.click(memoryEfficiencyPage.recommendationsTab);
    })
    .afterEach(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test.only('Verify that user can upvote recommendations', async t => {
    await recommendationPage.voteForVeryUsefulAndVerifyDisabled();
    // Verify that user can see previous votes when reload the page
    await common.reloadPage();
    await t.click(memoryEfficiencyPage.recommendationsTab);
    await recommendationPage.verifyVoteDisabled();

    await t.click(memoryEfficiencyPage.newReportBtn);
    await recommendationPage.voteForUsefulAndVerifyDisabled();

    await t.click(memoryEfficiencyPage.newReportBtn);
    await recommendationPage.voteForNotUsefulAndVerifyDisabled();
    // Verify that user can see the popup with link when he votes for “Not useful”
    await t.expect(recommendationPage.recommendationsFeedbackBtn.visible).ok();
});
