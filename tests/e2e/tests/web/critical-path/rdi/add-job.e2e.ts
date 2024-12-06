import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiPopoverOptions, RdiTemplatePipelineType, RedisOverviewPage } from '../../../../helpers/constants';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { DatabaseHelper } from '../../../../helpers';

const rdiInstancePage = new RdiInstancePage();
const rdiApiRequests = new RdiApiRequests();
const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const databaseHelper = new DatabaseHelper();

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'https://11.111.111.111',
    username: 'username',
    password: '111'
};

//skip the tests until rdi integration is added
fixture.skip `Add job`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await rdiInstancesListPage.reloadPage();
        await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
        await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });
test('Verify that user can add, edit and delete job', async() => {
    const jobName = 'testJob';
    const jobName2 = 'testJob2';

    await t.click(rdiInstancePage.PipelineManagementPanel.addJobBtn);

    const placeholder =  await rdiInstancePage.PipelineManagementPanel.jobNameInput.getAttribute('placeholder');

    await t.expect(placeholder).eql('Enter job name');

    await t
        .expect(rdiInstancePage.PipelineManagementPanel.EditorButton.applyBtn.hasAttribute('disabled')).ok('the button is not disabled');
    await t.hover(rdiInstancePage.PipelineManagementPanel.EditorButton.applyBtn);
    await rdiInstancePage.verifyTooltipContainsText('Job name is required');

    await t.click(rdiInstancePage.EditorButton.cancelBtn);
    await rdiInstancePage.PipelineManagementPanel.addJob(jobName);

    const elementItem = await rdiInstancePage.PipelineManagementPanel.jobItem.count;
    await t.expect(elementItem).gt(0, 'The job is not added');

    await t.click(rdiInstancePage.PipelineManagementPanel.addJobBtn);
    await t.typeText(rdiInstancePage.PipelineManagementPanel.jobNameInput, jobName);
    await t
        .expect(rdiInstancePage.PipelineManagementPanel.EditorButton.applyBtn.hasAttribute('disabled')).ok('the button is not disabled');
    await t.hover(rdiInstancePage.PipelineManagementPanel.EditorButton.applyBtn);
    await rdiInstancePage.verifyTooltipContainsText('Job name is already in use');
    await t.click(rdiInstancePage.EditorButton.cancelBtn);

    await rdiInstancePage.PipelineManagementPanel.addJob(jobName2);
    let elementItem2 = await rdiInstancePage.PipelineManagementPanel.jobItem.count;
    await t.expect(elementItem + 1).eql(elementItem2, 'the 2d job has not be added');

    await rdiInstancePage.PipelineManagementPanel.deleteJobByName(jobName2);
    elementItem2 = await rdiInstancePage.PipelineManagementPanel.jobItem.count;
    await t.expect(elementItem).eql(elementItem2, 'the 2d job has not be deleted');

    await rdiInstancePage.PipelineManagementPanel.editJobByName(jobName, jobName2);
    await rdiInstancePage.PipelineManagementPanel.openJobByName(jobName2);

    await t.expect(rdiInstancePage.PipelineManagementPanel.jobsPipelineTitle.textContent).eql(jobName2);
});
test('Verify that user insert template for jobs', async() => {
    const jobName = 'testJob';
    const disabledAttribute = 'isDisabled';
    const templateWords = 'server_name: chinook';
    const templateInsertedTooltip = 'Templates can be accessed only with the empty Editor to prevent potential data loss.';
    // Should be empty config
    await rdiInstancePage.PipelineManagementPanel.addJob(jobName);

    await rdiInstancePage.PipelineManagementPanel.openJobByName(jobName);
    await t.click(rdiInstancePage.templateButton);

    // Verify uniq templates words - should be undated when templates are added
    const enteredText = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    // Verify that user can see the template is inserted for the empty editor when clicking on the “Insert template” in jobs
    await t.expect(enteredText).contains(templateWords, 'template is incorrect');

    // Verify that user can see a standard validation on disabled Insert template button when the editor is not empty
    await t.hover(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
    await rdiInstancePage.verifyTooltipContainsText(templateInsertedTooltip);
    const buttonClass = rdiInstancePage.templateButton.getAttribute('class');
    await t.expect(buttonClass).contains(disabledAttribute, 'Insert Template button is not disabled');
});
test('Verify that user can change job config', async() => {
    const jobName = 'testJob';
    const textForMonaco = 'here should be a job';

    await rdiInstancePage.PipelineManagementPanel.addJob(jobName);
    await rdiInstancePage.PipelineManagementPanel.openJobByName(jobName);
    let text = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(text).eql('', 'monacoEditor for the job is not empty');
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.jobsInput, textForMonaco, false);
    text = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(text).eql(textForMonaco, 'user can not enter a text');
});
// https://redislabs.atlassian.net/browse/RI-5770
test('Verify that user can open an additional editor to work with SQL and JMESPath expressions', async() => {
    const jobName = 'testJob';
    const sqlText = 'SELECT test FROM test1';
    const SQLiteText = 's';
    const SQLiteAutoCompleteText = 'SIGN(X)';
    const JMESPathText = 'r';
    const JMESPathAutoCompleteText = 'REGEX_REPLACE';

    await rdiInstancePage.PipelineManagementPanel.addJob(jobName);
    await rdiInstancePage.PipelineManagementPanel.openJobByName(jobName);
    await t.click(rdiInstancePage.templateCancelButton);
    // Verify that editor is not displayed by default
    await t.expect(rdiInstancePage.draggableArea.exists).notOk('SQL/JMESPath editor is displayed by default');

    await t.click(rdiInstancePage.jobsInput);
    await t.pressKey('shift+space');
    // Verify that user can open an additional editor to work with SQL and JMESPath expressions
    await t.expect(rdiInstancePage.draggableArea.exists).ok('SQL/JMESPath editor is not displayed');

    // Verify that user can see SQL(set by default) and JMESPath editor options
    await t.expect(rdiInstancePage.dedicatedLanguageSelect.textContent).eql('SQLite functions', 'SQL is not set by default');

    // Verify that user can close the additional editor
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.draggableArea, sqlText, false);
    await t.click(rdiInstancePage.EditorButton.cancelBtn);
    await t.expect(rdiInstancePage.draggableArea.exists).notOk('SQL/JMESPath editor is displayed after closing');
    await t.expect(await rdiInstancePage.MonacoEditor.getTextFromMonaco()).eql('', 'Text from canceled SQL editor applied');

    await t.pressKey('shift+space');
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.draggableArea, sqlText, false);
    await t.click(rdiInstancePage.EditorButton.applyBtn);
    await t.expect(await rdiInstancePage.MonacoEditor.getTextFromMonaco()).eql(sqlText, 'Text from SQL editor not applied');

    //verify that autocomplete works for JMESPath
    await t.hover(rdiInstancePage.sqlEditorButton);
    await rdiInstancePage.verifyTooltipContainsText('Open a dedicated SQL or JMESPath editor:');
    await t.click(rdiInstancePage.sqlEditorButton);
    await t.click(rdiInstancePage.languageDropdown);
    await t.click(rdiInstancePage.jmesPathOption);
    // Start type characters and select command
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.draggableArea, JMESPathText);
    // Verify that the list with auto-suggestions is displayed
    await t.expect(rdiInstancePage.MonacoEditor.monacoSuggestion.count).gt(1, 'Auto-suggestions are not displayed');
    await t.pressKey('tab');
    await t.click(rdiInstancePage.EditorButton.applyBtn);
    await t.expect(await rdiInstancePage.MonacoEditor.getTextFromMonaco()).contains(JMESPathAutoCompleteText, 'Text from JMESPath editor not applied');

    // Verify that autocomplete works for SQLite functions
    await t.click(rdiInstancePage.sqlEditorButton);
    // Start type characters and select command
    await rdiInstancePage.MonacoEditor.sendTextToMonaco(rdiInstancePage.draggableArea, SQLiteText);
    // Verify that the list with auto-suggestions is displayed
    await t.expect(rdiInstancePage.MonacoEditor.monacoSuggestion.count).gt(1, 'Auto-suggestions are not displayed');
    await t.pressKey('tab');
    await t.click(rdiInstancePage.EditorButton.applyBtn);
    await t.expect(await rdiInstancePage.MonacoEditor.getTextFromMonaco()).contains(SQLiteAutoCompleteText, 'Text from SQLite editor not applied');
});
