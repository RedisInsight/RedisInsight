import { ClientFunction, t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import {
    RdiTemplateDatabaseType,
    RdiTemplatePipelineType,
    RedisOverviewPage,
    TextConnectionSection
} from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers';
import { MonacoEditor } from '../../../../common-actions/monaco-editor';
import { goBackHistory } from '../../../../helpers/utils';

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

const getPageUrl = ClientFunction(() => window.location.href);

//skip the tests until rdi integration is added
fixture.skip `Pipeline`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
        await t.click(rdiInstancePage.PipelineManagementPanel.configurationTab);

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
test('Verify that link on configuration is valid', async() => {

    const link = 'https://docs.redis.com/latest/rdi/quickstart/';
    // Verify the link
    await t.click(rdiInstancePage.configurationLink);
    await t.expect(getPageUrl()).eql(link, 'Build from homebrew page is not valid');
    await goBackHistory();
});

test('Verify that user can insert template', async() => {
    const disabledAttribute = 'isDisabled';
    const defaultValue = 'Ingest';
    const templateWords = 'type: redis';
    // should be empty config
    await t.expect(rdiInstancePage.templateApplyButton.visible).ok('the template popover is not expanded');
    const buttonClass = rdiInstancePage.templateApplyButton.getAttribute('class');
    await t.expect(buttonClass).notContains(disabledAttribute, 'Apply button is disabled');
    await t.click(rdiInstancePage.templateCancelButton);
    await t.expect(rdiInstancePage.templateApplyButton.exists).notOk('the template popover is not closed');

    await t.click(rdiInstancePage.templateButton);
    await t.expect(rdiInstancePage.templateApplyButton.visible).ok('the template popover is not expanded');
    await t.expect(rdiInstancePage.pipelineDropdown.textContent).eql(defaultValue, 'the default value is set incorrectly');
    await rdiInstancePage.setTemplateDropdownValue(RdiTemplatePipelineType.Ingest, RdiTemplateDatabaseType.MyQal);

    //verify uniq templates words - should be undated when templates are added
    const enteredText = await MonacoEditor.getTextFromMonaco();
    await t.expect(enteredText).contains(templateWords, 'template is incorrect');

    await t.click(rdiInstancePage.templateButton);
    await t.expect(buttonClass).contains(disabledAttribute, 'Apply button is active');
    await t.expect(rdiInstancePage.pipelineDropdown.textContent).eql('Ingest', 'the value is set incorrectly');
    await t.expect(rdiInstancePage.databaseDropdown.textContent).eql('MySQL', 'the default value is set incorrectly');
});
