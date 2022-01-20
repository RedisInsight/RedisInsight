import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    MonitorPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const monitorPage = new MonitorPage();

fixture `Monitor`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    })
test('Verify that when user closes the Monitor by clicking on "Close Monitor" button Monitor stopped', async t => {
    //Run monitor
    await monitorPage.startMonitor();
    //Close Monitor
    await t.click(monitorPage.closeMonitor);
    //Verify that monitor is not displayed
    await t.expect(monitorPage.monitorArea.visible).notOk('Monitor area');
    //Verify that user open monitor again
    await t.click(monitorPage.expandMonitor);
    //Verify that when user reopens Monitor history is not displayed
    await t.expect(monitorPage.startMonitorButton.visible).ok('Start monitor button');
});
