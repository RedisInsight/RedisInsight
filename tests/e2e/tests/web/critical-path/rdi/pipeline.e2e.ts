import { t } from 'testcafe';
import { updateColumnValueInDBTable } from '../../../../helpers/database-scripts';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { MonacoEditor } from '../../../../common-actions/monaco-editor';

const rdiInstancePage = new RdiInstancePage();
const rdiApiRequests = new RdiApiRequests();
export const commonUrl = process.env.COMMON_URL || 'http://localhost:8080/integrate';
const rdiTable = 'rdi';

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password'
};
//skip the tests until rdi integration is added

fixture.skip `Pipeline`
    .meta({ type: 'critical_path' })
    // it will be removed
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });
test('Verify that user can refresh pipeline', async() => {
    const instanceId = 'testId';
    const text = 'text';
    const expectedText = 'connections:';

    await rdiApiRequests.addNewRdiApi(rdiInstance);
    await updateColumnValueInDBTable(rdiTable, 'id', instanceId);
    await t.navigateTo(`${commonUrl}/${instanceId}/pipeline/config`);
    await MonacoEditor.sendTextToMonaco(rdiInstancePage.configurationInput, text);
    const enteredText = await MonacoEditor.getTextFromMonaco();
    await t.expect(enteredText).eql(text, 'config text was not changed');
    await t.click(rdiInstancePage.refreshPipelineIcon);
    await t.click(rdiInstancePage.applyRefreshBtn);
    const updatedText = await MonacoEditor.getTextFromMonaco();
    await t.expect(updatedText).contains(expectedText, 'config text was not updated');
    await t.expect(updatedText).notContains(text, 'config text was not updated');

});
