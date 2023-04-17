import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddRECloudDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, cloudDatabaseConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

fixture `Overview`
    .meta({ type: 'regression', rte: rte.reCloud })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .afterEach(async() => {
        // Delete database
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    });
test('Verify that user can see not available metrics from Overview in tooltip with the text "<Metric_name> is/are not available"', async t => {
    // Verify that CPU parameter is not displayed in Overview
    await t.expect(browserPage.overviewCpu.exists).notOk('Not available CPU is displayed');
    // Click on More Info icon
    await t.click(browserPage.OverviewPanel.overviewMoreInfo);
    // Check that tooltip was opened
    await t.expect(browserPage.OverviewPanel.overviewTooltip.exists).ok('Overview tooltip not displayed');
    // Verify that Database statistics title is displayed in tooltip
    await t.expect(browserPage.OverviewPanel.overviewTooltipStatTitle.exists).ok('Statistics title not displayed');
    // Verify that CPU parameter is displayed in tooltip
    await t.expect(browserPage.overviewCpu.find('i').textContent).eql('CPU is not available');
});
