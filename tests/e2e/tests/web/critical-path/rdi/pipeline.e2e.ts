import { t } from 'testcafe';
import { DatabaseScripts, DbTableParameters } from '../../../../helpers/database-scripts';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { MonacoEditor } from '../../../../common-actions/monaco-editor';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { RedisOverviewPage } from '../../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const rdiApiRequests = new RdiApiRequests();
const browserActions = new BrowserActions();

const dbTableParams: DbTableParameters = {
    tableName: 'rdi',
    columnName: 'id',
    rowValue: 'testId'
};
const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password'
};
const instanceId = 'testId';

//skip the tests until rdi integration is added
fixture.skip `Pipeline`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await DatabaseScripts.updateColumnValueInDBTable(dbTableParams);
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiInstancesListPage.clickRdiByName(rdiInstance.name);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });
test('Verify that user can refresh pipeline', async() => {
    const text = 'text';
    const expectedText = 'connections:';

    await MonacoEditor.sendTextToMonaco(rdiInstancePage.configurationInput, text);
    const enteredText = await MonacoEditor.getTextFromMonaco();
    await t.expect(enteredText).eql(text, 'config text was not changed');
    await t.click(rdiInstancePage.refreshPipelineIcon);
    await t.click(rdiInstancePage.applyRefreshBtn);
    const updatedText = await MonacoEditor.getTextFromMonaco();
    await t.expect(updatedText).contains(expectedText, 'config text was not updated');
    await t.expect(updatedText).notContains(text, 'config text was not updated');

});
// https://redislabs.atlassian.net/browse/RI-5199
test('Verify that user can deploy pipeline', async() => {
    const messageText = 'Are you sure you want to deploy the pipeline?';
    const successMessage = 'Deployment completed successfully!';
    const errorMessage = 'Unfortunately we’ve found some errors in your pipeline.';

    await t.click(rdiInstancePage.deployPipelineBtn);
    // Verify that user can see message when request to deploy the pipeline
    await browserActions.verifyTooltipContainsText(messageText, true);

    // Verify that user the successfull message when the pipeline has been deployed
    await t.click(rdiInstancePage.deployConfirmBtn);
    await t.expect(rdiInstancePage.successDeployNotification.textContent).contains(successMessage, 'Pipeline deployment is unsuccessful');

    await t.click(rdiInstancePage.Toast.toastCloseButton);
    // Verify that user the error message when the pipeline deployment failed
    // need to add - Modify deploy.js to receive an error
    await t.click(rdiInstancePage.deployPipelineBtn);
    await t.click(rdiInstancePage.deployConfirmBtn);
    await t.expect(rdiInstancePage.errorDeployNotification.textContent).contains(errorMessage, 'Pipeline deployment is successful');

    await t.click(rdiInstancePage.Toast.toastCloseButton);
});
