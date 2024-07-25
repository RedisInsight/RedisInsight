import * as path from 'path';
import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiPopoverOptions, RedisOverviewPage } from '../../../../helpers/constants';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { DatabaseHelper } from '../../../../helpers';


const rdiInstancePage = new RdiInstancePage();
const rdiApiRequests = new RdiApiRequests();
const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const databaseHelper = new DatabaseHelper();

const outputMock = 'No Redis commands provided by the server.';

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'https://11.111.111.111',
    username: 'username',
    password: '111'
};
const filePath = path.join('..', '..', '..', '..', 'test-data', 'rdi', 'RDI_pipelineJobValid.zip');

//skip the tests until rdi integration is added
fixture.skip `Rdi dry run job`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await myRedisDatabasePage.reloadPage();

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });
test('Verify that user can use Dry run panel', async() => {
    const job = 'test';

    const expectedTransformation = 'FULL_NAME": "jane smith"';

    const transformationInputText = '{\n' +
        '      "FNAME": "jane",\n' +
        '      "LAST_NAME": "smith",\n' +
        '      "country_code": 1,\n' +
        '      "country_name": "usa"';

    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.File);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePath);
    await t.click(rdiInstancePage.okUploadPipelineBtn);
    await rdiInstancePage.PipelineManagementPanel.openJobByName(job);

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
    await rdiInstancePage.sendTransformationInput(transformationInputText);
    await t.expect(rdiInstancePage.transformationResults.textContent).contains(expectedTransformation, 'Transformation results not displayed');

    await t.click(rdiInstancePage.outputTab);
    await t.expect(rdiInstancePage.commandsOutput.innerText).contains(outputMock, 'Transformation output not displayed');
    // Verify that user can close the right panel
    await t.click(rdiInstancePage.closeDryRunPanelBtn);
    await t.expect(rdiInstancePage.dryRunPanel.exists).notOk('Dry run panel still displayed');
});
