import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddRECloudDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage, DatabaseOverviewPage } from '../../../pageObjects';
import { commonUrl, cloudDatabaseConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const databaseOverviewPage = new DatabaseOverviewPage();

fixture `Overview`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see not available metrics from Overview in tooltip with the text "<Metric_name> is/are not available"', async t => {
        //Verify that CPU parameter is not displayed in Overview
        await t.expect(browserPage.overviewCpu.visible).notOk('Not available CPU');
        //Click on More Info icon
        await t.click(databaseOverviewPage.overviewMoreInfo);
        //Check that tooltip was opened
        await t.expect(databaseOverviewPage.overviewTooltip.visible).ok('Overview tooltip');
        //Verify that Database statistics title is displayed in tooltip
        await t.expect(databaseOverviewPage.overviewTooltipStatTitle.visible).ok('Statistics title');
        //Verify that CPU parameter is displayed in tooltip
        await t.expect(browserPage.overviewCpu.find('i').textContent).eql('CPU is not available');
    });
