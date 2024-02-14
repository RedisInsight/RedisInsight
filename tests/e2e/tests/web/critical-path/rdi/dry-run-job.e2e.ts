import { t } from 'testcafe';
import { DatabaseScripts, DbTableParameters } from '../../../../helpers/database-scripts';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RedisOverviewPage } from '../../../../helpers/constants';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';

const rdiInstancePage = new RdiInstancePage();
const rdiApiRequests = new RdiApiRequests();
const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancesListPage = new RdiInstancesListPage();

const resultMock = `{··"name":·"John",··"years":·123}`;
const outputMock = 'Shirizli';
const dbTableParams: DbTableParameters = {
    tableName: 'rdi',
    columnName: 'id',
    rowValue: 'testId'
};
const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password',
};

//skip the tests until rdi integration is added
fixture.skip `Rdi dry run job`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });
test('Verify that user can use Dry run panel', async() => {
    const job = 'testJob';

    // Need to add method to add jobs once it is implemented

    await rdiApiRequests.addNewRdiApi(rdiInstance);
    await DatabaseScripts.updateColumnValueInDBTable(dbTableParams);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.openJobByName(job);
    await t.click(rdiInstancePage.dryRunButton);
    // Verify that user can see dry run a job right panel
    await t.expect(rdiInstancePage.dryRunPanel.visible).ok('Dry run panel not opened');

    // Verify that user dry run only JSON value in Input
    await rdiInstancePage.sendTransformationInput('testInvalid');
    await t.expect(rdiInstancePage.dryRunSubmitBtn.getAttribute('class')).contains('isDisabled', 'Dry run button enabled when input is not JSON');

    // Verify that user can see the request to display the “output” section results sent only when click the “Dry run” button (not when switching between the tabs)
    await t.click(rdiInstancePage.outputTab);
    await t.expect(rdiInstancePage.commandsOutput.textContent).contains('', 'Transformation output is not empty by default');

    // Verify that user can request to run the transformation logic
    await t.click(rdiInstancePage.transformationsTab);
    await rdiInstancePage.sendTransformationInput('1');
    await t.expect(rdiInstancePage.transformationResults.textContent).contains(resultMock, 'Transformation results not displayed');

    await t.click(rdiInstancePage.outputTab);
    await t.expect(rdiInstancePage.commandsOutput.innerText).contains(outputMock, 'Transformation output not displayed');
    // Verify that user can close the right panel
    await t.click(rdiInstancePage.closeDryRunPanelBtn);
    await t.expect(rdiInstancePage.dryRunPanel.exists).notOk('Dry run panel still displayed');
});
