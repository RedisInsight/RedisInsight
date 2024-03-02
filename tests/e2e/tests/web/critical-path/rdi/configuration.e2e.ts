import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { RedisOverviewPage, TextConnectionSection } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers';

const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const rdiApiRequests = new RdiApiRequests();
const databaseHelper = new DatabaseHelper();

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
        await t.click(rdiInstancePage.configurationTab);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });

test('Verify that user can test connection', async() => {
    //TODO do sth to get failed and success connection
    await t.click(rdiInstancePage.textConnectionBtn);

    await rdiInstancePage.TestConnectionPanel.expandOrCollapseSection(TextConnectionSection.Success, true);

    await t.expect(await rdiInstancePage.TestConnectionPanel.getNumberOfSectionRow(TextConnectionSection.Success)).eql(await rdiInstancePage.TestConnectionPanel.getNumberOfSection(TextConnectionSection.Success));

    await rdiInstancePage.TestConnectionPanel.expandOrCollapseSection(TextConnectionSection.Success, false);
    await rdiInstancePage.TestConnectionPanel.expandOrCollapseSection(TextConnectionSection.Failed, true);

    // TODO check expected value
    await t.expect(await rdiInstancePage.TestConnectionPanel.getSectionRowTextByIndex(TextConnectionSection.Failed, 0)).contains('redis', 'endpoint is not empty');
    await t.click(rdiInstancePage.TestConnectionPanel.closeSection);
    await t.expect(rdiInstancePage.TestConnectionPanel.sidePanel.exists).notOk('the panel is not closed');
});
