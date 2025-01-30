import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    RdiPopoverOptions,
    RdiTemplateDatabaseType,
    RedisOverviewPage
} from '../../../../helpers/constants';
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
    url: 'https://54.175.165.214',
    username: 'username',
    password: '111'
};

const rdiInstance2: AddNewRdiParameters = {
    name: 'testInstance2',
    url: 'https://11.111.111.214',
    username: 'username',
    password: '111'
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
    await t.click(rdiInstancePage.proceedNavigateDialog);
    await t.click(rdiInstancePage.NavigationPanel.managementPageButton);
    await t.expect(rdiInstancePage.RdiHeader.uploadFromFileButton.exists).ok('rdi instance page is opened');
    const rdiName = rdiInstancePage.RdiHeader.rdiNameLinkBreadcrumbs.textContent;
    await t.expect(rdiName).eql(rdiInstance.name, 'instance name in breadcrumbs is not correct');

    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    await t.click(rdiInstancePage.NavigationPanel.myRedisDBButton);
    await t.click(rdiInstancePage.proceedNavigateDialog);
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
    count = await myRedisDatabasePage.NavigationPanel.getButtonsCount();
    await t.expect(count).eql(3, 'rdi buttons is displayed');
});

test('Verify that context is saved after navigation panel', async() => {
    await t.click(rdiInstancePage.NavigationPanel.statusPageButton);

    await t.click(rdiInstancePage.RdiHeader.breadcrumbsLink);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    // TODO add verification that status page is opened
    await t.expect(rdiInstancePage.PipelineManagementPanel.configurationTab.exists).notOk('status page is not opened');
});

test('Verify that Insight and Sign in buttons are displayed ', async() => {
    await t.expect(rdiInstancePage.NavigationHeader.insightsTriggerButton.exists).ok('Insight panel is not exist');
    await rdiInstancePage.NavigationHeader.togglePanel(true);
    const tab = await rdiInstancePage.RdiHeader.InsightsPanel.getActiveTabName();
    await t.expect(tab).eql('Tutorials');
    await t.expect(rdiInstancePage.NavigationHeader.cloudSignInButton.exists).ok('sight in button is not exist');
});

test('Verify that confirmation message is displayed, if there are unsaved changes ', async() => {
    const jobName = 'jobName';
    const textForMonaco = 'here should be a job';

    await rdiInstancePage.PipelineManagementPanel.addJob(jobName);
    await rdiInstancePage.PipelineManagementPanel.openJobByName(jobName);
    await t.click(rdiInstancePage.templateCancelButton);
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.jobsInput, textForMonaco, false);
    await t.click(rdiInstancePage.RdiHeader.breadcrumbsLink);
    await t.expect(rdiInstancePage.downloadNavigateDialog.exists).ok('the user can not download');
    await t.click(rdiInstancePage.closeConfirmNavigateDialog);

    const text = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(text).eql(textForMonaco, 'changes is not saved');

    await t.click(rdiInstancePage.PipelineManagementPanel.configurationTabLink);
    await t.click(rdiInstancePage.templateButton);
    await rdiInstancePage.setTemplateDropdownValue(RdiTemplateDatabaseType.MySql);
    await t.click(rdiInstancePage.NavigationPanel.myRedisDBButton);
    await t.click(rdiInstancePage.proceedNavigateDialog);
    await t.expect(rdiInstancesListPage.addRdiInstanceButton.exists).ok('the user is not navigated to the panel');
});
test.before(async() => {
    await rdiApiRequests.addNewRdiApi(rdiInstance);
    await rdiApiRequests.addNewRdiApi(rdiInstance2);
    await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig)})
('Verify that context is saved when user switches to db', async() => {
    const jobName = 'jobName';
    const textForMonaco = 'here should be a job';

    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);

    await t.click(rdiInstancePage.templateCancelButton);
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.jobsInput, textForMonaco, false);
    await t.click(rdiInstancePage.NavigationHeader.dbName);
    await t.click(rdiInstancePage.NavigationHeader.dbListInstance.withText(ossStandaloneConfig.databaseName));

    await t.click(rdiInstancePage.NavigationHeader.dbName);
    await t.click(rdiInstancePage.NavigationHeader.dbListInstance.withText(rdiInstance.name));

    const text = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(text).eql(textForMonaco, 'rdi context is not saved between rdi and db');

    await t.click(rdiInstancePage.NavigationHeader.dbName);
    await t.click(rdiInstancePage.NavigationHeader.dbListInstance.withText(rdiInstance2.name));

    await t.expect(rdiInstancePage.selectOptionDialog.exists).ok('rdi context is saved between rdi')
});
