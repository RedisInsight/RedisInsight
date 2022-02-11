import { t, Selector } from 'testcafe';
import { rte } from '../../../helpers/constants';
import {acceptLicenseTerms, deleteDatabase} from '../../../helpers/database';
import { BrowserPage, AddRedisDatabasePage, MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, cloudDatabaseConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseParameters = {
    host: 'redis-16932.c81.us-east-1-2.ec2.cloud.redislabs.com',
    port: '16932',
    databaseName: 'cloud',
    databasePassword: ''
};

fixture `Overview`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
        await addRedisDatabasePage.addRedisDataBase(databaseParameters);
        //Click for saving
        await t.click(addRedisDatabasePage.addRedisDatabaseButton);
        //Increase timeout to add Cloud DB
        // await t.expect(Selector('span.euiLoadingSpinner').visible).notOk({timeout: 10000});
        await t.wait(5000);
        //Refresh the page
        await t.eval(() => location.reload(true));
        //Wait for database to be exist
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseParameters.databaseName).exists).ok('The existence of the database', { timeout: 10000 });
        await myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName);
    })
    .afterEach(async() => {
        //Delete database
        // await deleteDatabase(cloudDatabaseConfig.databaseName);
        await deleteDatabase(databaseParameters.databaseName);
    })
test.skip
    .meta({ rte: rte.standalone })
    ('Verify that user can see not available metrics from Overview in tooltip with the text "<Metric_name> is/are not available"', async t => {
        //Verify that CPU parameter is not displayed in Overview
        await t.expect(browserPage.overviewCpu.visible).notOk('Not available CPU');
        //Click on More Info icon
        await t.click(browserPage.overviewMoreInfo);
        //Check that tooltip was opened
        // await t.expect(browserPage.overviewTooltip.visible).ok('Overview tooltip');
        //Verify that Database statistics title is displayed in tooltip
        await t.expect(browserPage.overviewTooltipStatTitle.visible).ok('Statistics title');
        //Verify that CPU parameter is displayed in tooltip
        await t.expect(browserPage.overviewCpu.find('i').textContent).eql('CPU is not available');
    });
