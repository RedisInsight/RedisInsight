import { t } from 'testcafe';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { RdiPopoverOptions, RedisOverviewPage } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers';
import { RdiStatusPage } from '../../../../pageObjects/rdi-status-page';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';

const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const rdiApiRequests = new RdiApiRequests();
const databaseHelper = new DatabaseHelper();
const rdiStatusPage = new RdiStatusPage();
const rdiInstancePage = new RdiInstancePage();

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password'
};

//skip the tests until rdi integration is added
fixture.skip `Pipeline`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
        await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Server);
        await t.click(rdiInstancesListPage.NavigationPanel.statusPageButton);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });

// https://redislabs.atlassian.net/browse/RI-5150
test('Verify that user can see data on the status page', async() => {
    let text = await rdiStatusPage.getTableRowData(rdiStatusPage.targetConnectionTable, 1);
    // remove the 1st item for Target connection table since it is status icon
    text.shift();
    await t.expect(text.every(value => value.length > 0)).ok('table contains empty value');

    const text2 = await rdiStatusPage.processingPerformanceInformationTable.innerText;
    text =  text2.split(/\s+/);
    await t.expect(text.every(value => value.length > 0)).ok('table contains empty value');

    text = await rdiStatusPage.getTableRowData(rdiStatusPage.dataStreamsOverviewTable, 1);
    await t.expect(text.every(value => value.length > 0)).ok('table contains empty value');

    text = await rdiStatusPage.getTableRowData(rdiStatusPage.clientsTable, 1);
    await t.expect(text.every(value => value.length > 0)).ok('table contains empty value');

    // Verify name in hover  - should be updated according to the data

    const name = await rdiStatusPage.getValueInTable(rdiStatusPage.targetConnectionTable, 3, 3);
    await rdiStatusPage.hoverValueInTable(rdiStatusPage.targetConnectionTable, 3, 3);
    await t.expect(await rdiStatusPage.tooltip.textContent).contains(name, 'tooltip text not correct');

});

test('Verify that user can refresh tables', async() => {

    let message =  await rdiStatusPage.processingPerformanceRefreshMessage.textContent;
    await t.expect(message).contains(' 5.0 s', 'Auto refresh is not enabled');

    await t.wait(6000);
    message =  await rdiStatusPage.clientRefreshMessage.textContent;
    await t.expect(message).contains('min', 'Last refresh is enabled');

    await t.click(rdiStatusPage.refreshStreamsButton);
    message = await rdiStatusPage.dataStreamsRefreshMessage.textContent;
    await t.expect(message).contains('now', 'Last refresh is enabled');
});
