import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiPopoverOptions, RedisOverviewPage } from '../../../../helpers/constants';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const rdiApiRequests = new RdiApiRequests();
const databaseHelper = new DatabaseHelper();
const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const databaseAPIRequests = new DatabaseAPIRequests();

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password'
};

//skip the tests until rdi integration is added
fixture.skip `Rdi Navigation`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
        await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test.before(async() => {
    await rdiApiRequests.addNewRdiApi(rdiInstance);
    await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
})('Verify that buttons are displayed correctly in navigation panel', async() => {
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    let count = await rdiInstancesListPage.NavigationPanel.getButtonsCount();
    await t.expect(count).eql(3, 'dataBase buttons are displayed');

    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);

    await t.click(rdiInstancePage.NavigationPanel.myRedisDBButton);
    await t.click(rdiInstancePage.NavigationPanel.managementPageButton);
    await t.expect(rdiInstancePage.RdiHeader.uploadFromFileButton.exists).ok('rdi instance page is opened');
    const rdiName = rdiInstancePage.RdiHeader.rdiNameLinkBreadcrumbs.textContent;
    await t.expect(rdiName).eql(rdiInstance.name, 'instance name in breadcrumbs is not correct');

    await t.click(rdiInstancePage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
    count = await myRedisDatabasePage.NavigationPanel.getButtonsCount();
    await t.expect(count).eql(3, 'rdi buttons is displayed');
});

// TODO should be updated
test('Verify that context is saved after navigation panel', async() => {
    // check that tab is not highlighted
    let classes = await rdiInstancePage.PipelineManagementPanel.configurationTab.getAttribute('class');
    await t.expect(classes?.split(' ').length).eql(1, 'the tab is selected');
    await t.click(rdiInstancePage.PipelineManagementPanel.configurationTab);

    await t.click(rdiInstancePage.RdiHeader.breadcrumbsLink);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await t.expect(rdiInstancePage.selectOptionDialog.exists).notOk('the context is not saved');
    classes = await rdiInstancePage.PipelineManagementPanel.configurationTab.getAttribute('class');
    await t.expect(classes?.split(' ').length).eql(2, 'the tab is not selected');
});

test('Verify that Insight and Sign in buttons are displayed ', async() => {
    await t.expect(rdiInstancePage.RdiHeader.InsightsPanel.getInsightsPanel().exists).ok('Insight panel is not exist');
    await rdiInstancePage.RdiHeader.InsightsPanel.togglePanel(true);
    const tab = await rdiInstancePage.RdiHeader.InsightsPanel.getActiveTabName();
    await t.expect(tab).eql('Explore');
    await t.expect(rdiInstancePage.RdiHeader.cloudSignInButton.exists).ok('sight in button is not exist');
});
